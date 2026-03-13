from decimal import Decimal, InvalidOperation
from datetime import datetime, timedelta, timezone as dt_timezone
import re

from django.conf import settings
from django.contrib.auth import get_user_model, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from django.utils.decorators import method_decorator
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework.authentication import SessionAuthentication
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
import stripe

from forum.channel_names import build_notification_group_name

from .ai_trip_planner import generate_trip_plan
from .models import BillingEvent, CheckoutRequest, DirectMessage, Expert, ItineraryItem, Membership, Trip
from .serializers import (
    AITripBuilderRequestSerializer,
    CHECKOUT_PLANS,
    AITripSelectionSerializer,
    BillingEventSerializer,
    ConsultancyProfileUpdateSerializer,
    DirectMessageComposerSerializer,
    DirectMessageSerializer,
    CheckoutRequestCreateSerializer,
    CheckoutRequestSerializer,
    DashboardTripSerializer,
    DocumentTripRequestSerializer,
    EngagementTrackSerializer,
    ExpertSerializer,
    HomeExpertSerializer,
    HomeTripSerializer,
    LoginSerializer,
    MessageThreadSerializer,
    MemberDirectorySerializer,
    MembershipSerializer,
    OperationsCheckoutRequestSerializer,
    SignupSerializer,
    TripSerializer,
    build_user_display_name,
)
from .models import UserEngagementEvent


User = get_user_model()


def _build_initials(name):
    parts = [part for part in (name or '').split() if part]
    if not parts:
        return 'TR'
    if len(parts) == 1:
        return parts[0][:2].upper()
    return (parts[0][0] + parts[1][0]).upper()


def _user_is_operations_admin(user):
    if not user or not user.is_authenticated:
        return False

    if user.is_staff or user.is_superuser:
        return True

    admin_emails = getattr(settings, 'OPERATIONS_ADMIN_EMAILS', []) or []
    if user.email.strip().lower() in admin_emails:
        return True

    membership = getattr(user, 'membership', None)
    if membership is None:
        membership = Membership.objects.filter(user=user).only('tier').first()

    return bool(membership and membership.tier == Membership.TIER_ADMIN)


def _serialize_auth_user(user):
    membership = _get_or_create_membership(user)
    full_name = user.get_full_name().strip()
    if not full_name:
        full_name = user.username.split('@')[0].replace('.', ' ').replace('_', ' ').title()

    return {
        'name': full_name,
        'email': user.email,
        'initials': _build_initials(full_name),
        'memberSince': user.date_joined.date().isoformat(),
        'membership': MembershipSerializer(membership).data,
        'canManageOperations': _user_is_operations_admin(user),
    }


def _get_or_create_membership(user):
    membership, _ = Membership.objects.get_or_create(
        user=user,
        defaults={'start_date': user.date_joined.date()},
    )

    if _user_is_operations_admin(user) and membership.tier != Membership.TIER_ADMIN:
        membership.tier = Membership.TIER_ADMIN
        if not membership.start_date:
            membership.start_date = user.date_joined.date()
        membership.status = Membership.STATUS_ACTIVE
        membership.save(update_fields=['tier', 'start_date', 'status', 'updated_at'])

    return membership


def _user_can_manage_operations(user):
    if not _user_is_operations_admin(user):
        return False

    _get_or_create_membership(user)
    return True


def _build_checkout_reference():
    stamp = timezone.now().strftime('%Y%m%d%H%M%S')
    latest = CheckoutRequest.objects.order_by('-id').first()
    next_id = (latest.id + 1) if latest else 1
    return f'TR-{stamp}-{next_id:04d}'


def _resolve_member_directory_viewer_access(request):
    user = getattr(request, 'user', None)
    if not user or not user.is_authenticated:
        return {
            'tier': 'Public',
            'canViewStarBreakdown': False,
        }

    membership = _get_or_create_membership(user)
    return {
        'tier': membership.tier,
        'canViewStarBreakdown': membership.can_view_star_breakdown,
    }


def _record_billing_event(event_type, event_status='', summary='', membership=None, checkout_request=None, reference='', metadata=None):
    BillingEvent.objects.create(
        membership=membership,
        checkout_request=checkout_request,
        provider='stripe',
        event_type=event_type,
        event_status=event_status or '',
        reference=reference or getattr(checkout_request, 'reference', '') or getattr(membership, 'stripe_subscription_id', ''),
        summary=summary,
        metadata=metadata or {},
    )


def _get_expert_for_user(user):
    expert = getattr(user, 'expert_profile', None)
    if expert is not None:
        return expert
    return Expert.objects.filter(is_dashboard_profile=True).first() or Expert.objects.first()


def _get_or_create_user_expert_profile(user):
    expert = getattr(user, 'expert_profile', None)
    if expert is not None:
        return expert

    fallback = Expert.objects.filter(is_dashboard_profile=True).first() or Expert.objects.first()
    full_name = user.get_full_name().strip() or user.username.split('@')[0].replace('.', ' ').replace('_', ' ').title()

    defaults = {
        'name': full_name,
        'initials': _build_initials(full_name),
        'member_since': user.date_joined.date(),
        'consultancy_mode': 'Free & Paid',
        'consultation_rate': 'Rate not set',
        'consultancy_bio': 'No consultancy bio added yet.',
    }

    if fallback:
        defaults.update({
            'profile': fallback.profile,
            'bio': fallback.bio,
            'countries_visited': fallback.countries_visited,
            'specializations': fallback.specializations,
            'specialty': fallback.specialty,
            'star_rating': fallback.star_rating,
            'profile_views': fallback.profile_views,
            'messages_count': fallback.messages_count,
            'trip_count_display': fallback.trip_count_display,
            'author_metric': fallback.author_metric,
        })

    return Expert.objects.create(user=user, **defaults)


def _refresh_expert_message_count(user):
    expert = getattr(user, 'expert_profile', None)
    if not expert:
        return

    total = DirectMessage.objects.filter(recipient=user).count()
    if expert.messages_count != total:
        expert.messages_count = total
        expert.save(update_fields=['messages_count'])


def _build_message_thread_payload(current_user, other_user, latest_message=None, unread_count=0):
    expert = getattr(other_user, 'expert_profile', None)
    member_name = expert.name if expert else build_user_display_name(other_user)
    return {
        'userId': other_user.id,
        'expertId': expert.id if expert else None,
        'memberName': member_name,
        'initials': _build_initials(member_name),
        'latestMessage': latest_message.body if latest_message else '',
        'updatedAt': latest_message.created_at if latest_message else None,
        'unreadCount': unread_count,
    }


def _build_message_summary(user):
    if not user or not user.is_authenticated:
        return {
            'unreadMessages': 0,
            'totalThreads': 0,
            'totalMessages': 0,
        }

    messages = list(
        DirectMessage.objects.filter(Q(sender=user) | Q(recipient=user))
        .only('sender_id', 'recipient_id', 'read_at')
    )

    thread_user_ids = set()
    unread_messages = 0
    for message in messages:
        other_user_id = message.recipient_id if message.sender_id == user.id else message.sender_id
        thread_user_ids.add(other_user_id)
        if message.recipient_id == user.id and message.read_at is None:
            unread_messages += 1

    return {
        'unreadMessages': unread_messages,
        'totalThreads': len(thread_user_ids),
        'totalMessages': len(messages),
    }


def _push_notification(user, payload):
    if not user:
        return

    channel_layer = get_channel_layer()
    if not channel_layer:
        return

    try:
        async_to_sync(channel_layer.group_send)(
            build_notification_group_name(user.username),
            {
                'type': 'notify',
                'notification': payload,
            }
        )
    except Exception:
        return


def _push_message_summary_event(user, event_name, thread_payload=None):
    _push_notification(user, {
        'type': event_name,
        'summary': _build_message_summary(user),
        'thread': thread_payload,
    })


def _get_checkout_redirect_urls(reference):
    base_url = (settings.APP_BASE_URL or 'http://localhost:3000').rstrip('/')
    success_url = f'{base_url}/checkout/success?reference={reference}&session_id={{CHECKOUT_SESSION_ID}}'
    cancel_url = f'{base_url}/checkout/cancel?reference={reference}'
    return success_url, cancel_url


def _get_request_session_key(request):
    session = getattr(request, 'session', None)
    if session is None:
        return ''

    if not session.session_key:
        session.save()

    return session.session_key or ''


def _serialize_engagement_event(event):
    user = getattr(event, 'user', None)
    actor_name = build_user_display_name(user) if user else 'Guest user'
    actor_email = user.email if user else ''

    return {
        'id': event.id,
        'actorName': actor_name,
        'actorEmail': actor_email,
        'isAuthenticated': bool(user),
        'path': event.path,
        'eventType': event.event_type,
        'createdAt': event.created_at.isoformat(),
        'metadata': event.metadata or {},
    }


def _build_engagement_overview():
    now = timezone.now()
    active_cutoff = now - timedelta(minutes=5)
    hourly_cutoff = now - timedelta(hours=1)
    active_events = list(
        UserEngagementEvent.objects.select_related('user')
        .filter(created_at__gte=active_cutoff)
        .order_by('-created_at', '-id')[:250]
    )
    recent_events = list(
        UserEngagementEvent.objects.select_related('user')
        .order_by('-created_at', '-id')[:25]
    )

    active_actors = {}
    live_routes = {}

    for event in active_events:
        actor_key = f'user:{event.user_id}' if event.user_id else f'session:{event.session_key or event.id}'
        active_actors[actor_key] = True

        route = live_routes.setdefault(event.path, {
            'path': event.path,
            'activeUsers': set(),
            'lastSeenAt': event.created_at,
            'lastEventType': event.event_type,
        })
        route['activeUsers'].add(actor_key)
        if event.created_at > route['lastSeenAt']:
            route['lastSeenAt'] = event.created_at
            route['lastEventType'] = event.event_type

    live_route_items = []
    for route in live_routes.values():
        live_route_items.append({
            'path': route['path'],
            'activeUsers': len(route['activeUsers']),
            'lastSeenAt': route['lastSeenAt'].isoformat(),
            'lastEventType': route['lastEventType'],
        })

    live_route_items.sort(key=lambda item: (-item['activeUsers'], item['path']))

    return {
        'activeUsersLastFiveMinutes': len(active_actors),
        'eventsLastHour': UserEngagementEvent.objects.filter(created_at__gte=hourly_cutoff).count(),
        'liveRoutes': live_route_items[:10],
        'recentActivity': [_serialize_engagement_event(event) for event in recent_events],
    }


def _get_checkout_billing_mode(checkout_request):
    plan_config = CHECKOUT_PLANS.get(checkout_request.plan_key, {})
    configured_mode = (plan_config.get('billingMode') or '').strip()
    stored_mode = (checkout_request.billing_mode or '').strip()

    if stored_mode == 'payment' and configured_mode == 'subscription':
        return configured_mode

    return stored_mode or configured_mode or 'payment'


def _active_priority_slots_after_bundle_removal(membership):
    return max(membership.priority_slots_total - 1, 0)


def _set_membership_tier_for_recurring_state(membership, next_tier, plan_key=None):
    if membership.tier == Membership.TIER_ADMIN:
        return

    if next_tier == 'inactive':
        if plan_key == 'bundle' and membership.priority_slots_total > 0:
            membership.priority_slots_total = _active_priority_slots_after_bundle_removal(membership)

        if membership.priority_slots_total > 0:
            membership.tier = Membership.TIER_PRIORITY
        else:
            membership.tier = Membership.TIER_MEMBER
        return

    if next_tier == Membership.TIER_BUNDLE:
        membership.tier = Membership.TIER_BUNDLE
        return

    if next_tier == Membership.TIER_SUBSCRIBER:
        if membership.priority_slots_total > 0:
            membership.tier = Membership.TIER_BUNDLE
        else:
            membership.tier = Membership.TIER_SUBSCRIBER
        return

    membership.tier = next_tier


def _activate_membership_for_checkout(checkout_request, customer_id=None, subscription_id=None, current_period_end=None, recurring_status='active'):
    membership = _get_or_create_membership(checkout_request.user)
    billing_mode = _get_checkout_billing_mode(checkout_request)
    today = timezone.now().date()
    current_end = membership.end_date if membership.end_date and membership.end_date >= today else today
    next_end = datetime.fromtimestamp(current_period_end, tz=dt_timezone.utc).date() if current_period_end else current_end + timedelta(days=365)

    if checkout_request.plan_key == 'subscription':
        _set_membership_tier_for_recurring_state(membership, Membership.TIER_SUBSCRIBER)
    elif checkout_request.plan_key == 'priority':
        _set_membership_tier_for_recurring_state(membership, Membership.TIER_PRIORITY)
        membership.priority_slots_total += 1
    elif checkout_request.plan_key == 'bundle':
        _set_membership_tier_for_recurring_state(membership, Membership.TIER_BUNDLE)
        membership.priority_slots_total += 1

    membership.status = Membership.STATUS_ACTIVE
    if not membership.start_date:
        membership.start_date = today
    membership.end_date = next_end

    update_fields = ['tier', 'status', 'start_date', 'end_date', 'priority_slots_total', 'updated_at']
    if billing_mode == 'subscription':
        membership.billing_provider = 'stripe'
        membership.stripe_customer_id = customer_id or membership.stripe_customer_id
        membership.stripe_subscription_id = subscription_id or membership.stripe_subscription_id
        membership.recurring_plan_key = checkout_request.plan_key
        membership.recurring_status = recurring_status
        update_fields.extend(['billing_provider', 'stripe_customer_id', 'stripe_subscription_id', 'recurring_plan_key', 'recurring_status'])

    membership.save(update_fields=sorted(set(update_fields)))
    return membership


def _sync_membership_from_subscription(subscription_object, event_type='customer.subscription.updated'):
    customer_id = subscription_object.get('customer') or ''
    subscription_id = subscription_object.get('id') or ''
    membership = Membership.objects.filter(stripe_subscription_id=subscription_id).first()
    if not membership and customer_id:
        membership = Membership.objects.filter(stripe_customer_id=customer_id).first()

    if not membership:
        return None

    status_value = (subscription_object.get('status') or '').strip()
    current_period_end = subscription_object.get('current_period_end')
    update_fields = ['updated_at']
    membership.recurring_status = status_value
    update_fields.append('recurring_status')

    if current_period_end:
        membership.end_date = datetime.fromtimestamp(current_period_end, tz=dt_timezone.utc).date()
        update_fields.append('end_date')

    if status_value in {'active', 'trialing'}:
        membership.status = Membership.STATUS_ACTIVE
        update_fields.append('status')
        if membership.recurring_plan_key == 'bundle':
            _set_membership_tier_for_recurring_state(membership, Membership.TIER_BUNDLE)
        elif membership.recurring_plan_key == 'subscription':
            _set_membership_tier_for_recurring_state(membership, Membership.TIER_SUBSCRIBER)
        update_fields.append('tier')
    elif status_value in {'past_due', 'unpaid', 'incomplete'}:
        membership.status = Membership.STATUS_SUSPENDED
        update_fields.append('status')
    elif status_value in {'canceled', 'incomplete_expired'}:
        membership.status = Membership.STATUS_EXPIRED
        _set_membership_tier_for_recurring_state(membership, 'inactive', membership.recurring_plan_key)
        membership.recurring_plan_key = ''
        membership.stripe_subscription_id = ''
        membership.recurring_status = 'canceled'
        update_fields.extend(['status', 'tier', 'priority_slots_total', 'recurring_plan_key', 'stripe_subscription_id', 'recurring_status'])

    membership.save(update_fields=sorted(set(update_fields)))
    if status_value in {'past_due', 'unpaid', 'incomplete'}:
        summary = 'Recurring payment needs attention. Stripe reported ' + status_value.replace('_', ' ') + '.'
    elif status_value in {'canceled', 'incomplete_expired'}:
        summary = 'Recurring subscription ended and the membership was downgraded.'
    else:
        summary = 'Recurring subscription synchronized from Stripe.'

    _record_billing_event(
        event_type=event_type,
        event_status=status_value,
        summary=summary,
        membership=membership,
        reference=subscription_id or customer_id,
        metadata={
            'subscriptionId': subscription_id,
            'customerId': customer_id,
        },
    )
    return membership


def _handle_checkout_session_completed(session_object):
    metadata = session_object.get('metadata') or {}
    checkout_request_id = metadata.get('checkout_request_id')
    if checkout_request_id:
        checkout_request = CheckoutRequest.objects.select_related('user').filter(id=checkout_request_id).first()
    else:
        checkout_request = CheckoutRequest.objects.select_related('user').filter(provider_session_id=session_object.get('id')).first()

    if not checkout_request:
        return None

    update_fields = []
    if checkout_request.provider_session_id != session_object.get('id'):
        checkout_request.provider_session_id = session_object.get('id', '')
        update_fields.append('provider_session_id')

    if checkout_request.provider_customer_id != (session_object.get('customer') or ''):
        checkout_request.provider_customer_id = session_object.get('customer', '') or ''
        update_fields.append('provider_customer_id')

    if checkout_request.provider_subscription_id != (session_object.get('subscription') or ''):
        checkout_request.provider_subscription_id = session_object.get('subscription', '') or ''
        update_fields.append('provider_subscription_id')

    payment_status = (session_object.get('payment_status') or '').strip()
    if checkout_request.provider_payment_status != payment_status:
        checkout_request.provider_payment_status = payment_status
        update_fields.append('provider_payment_status')

    if checkout_request.completed_at is None:
        checkout_request.completed_at = timezone.now()
        update_fields.append('completed_at')

    if checkout_request.status != 'Paid':
        checkout_request.status = 'Paid'
        update_fields.append('status')

    if checkout_request.provider != 'stripe':
        checkout_request.provider = 'stripe'
        update_fields.append('provider')

    expected_billing_mode = _get_checkout_billing_mode(checkout_request)
    if checkout_request.billing_mode != expected_billing_mode:
        checkout_request.billing_mode = expected_billing_mode
        update_fields.append('billing_mode')

    _activate_membership_for_checkout(
        checkout_request,
        customer_id=session_object.get('customer'),
        subscription_id=session_object.get('subscription'),
        recurring_status='active' if expected_billing_mode == 'subscription' else '',
    )

    membership = _get_or_create_membership(checkout_request.user)
    _record_billing_event(
        event_type='checkout.session.completed',
        event_status=payment_status,
        summary='Stripe checkout completed and membership entitlements were applied.',
        membership=membership,
        checkout_request=checkout_request,
        reference=checkout_request.reference,
        metadata={
            'billingMode': expected_billing_mode,
            'subscriptionId': session_object.get('subscription') or '',
            'customerId': session_object.get('customer') or '',
        },
    )

    if update_fields:
        checkout_request.save(update_fields=update_fields)

    return checkout_request


class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return


@method_decorator(csrf_exempt, name='dispatch')
class SignupAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        login(request._request, user)
        return Response({
            'message': 'Account created successfully.',
            'user': _serialize_auth_user(user),
        }, status=status.HTTP_201_CREATED)


@method_decorator(csrf_exempt, name='dispatch')
class LoginAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request._request, user)
        return Response({
            'message': 'Signed in successfully.',
            'user': _serialize_auth_user(user),
        })


@method_decorator(csrf_exempt, name='dispatch')
class LogoutAPIView(APIView):
    def post(self, request):
        logout(request._request)
        return Response({'message': 'Signed out successfully.'})


class SessionAPIView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'authenticated': False, 'user': None})

        return Response({
            'authenticated': True,
            'user': _serialize_auth_user(request.user),
        })


@method_decorator(csrf_exempt, name='dispatch')
class ConsultancyProfileAPIView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = ConsultancyProfileUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        expert = _get_or_create_user_expert_profile(request.user)
        expert.consultancy_mode = serializer.validated_data['consultancy_mode']
        expert.consultation_rate = serializer.validated_data['consultation_rate']
        expert.consultancy_bio = serializer.validated_data['consultancy_bio']
        if not expert.name:
            expert.name = build_user_display_name(request.user)
        if not expert.initials:
            expert.initials = _build_initials(expert.name)
        if not expert.member_since:
            expert.member_since = request.user.date_joined.date()
        expert.save(update_fields=['consultancy_mode', 'consultation_rate', 'consultancy_bio', 'name', 'initials', 'member_since'])

        return Response({
            'message': 'Consultancy profile updated successfully.',
            'profile': ExpertSerializer(expert).data,
        })


@method_decorator(csrf_exempt, name='dispatch')
class CheckoutRequestCreateAPIView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = CheckoutRequestCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.build_payload()

        checkout_request = CheckoutRequest.objects.create(
            user=request.user,
            plan_key=payload['plan_key'],
            plan_name=payload['plan_name'],
            amount_display=payload['amount_display'],
            reference=_build_checkout_reference(),
            source=payload['source'],
            notes=payload['notes'],
        )

        return Response({
            'checkoutRequest': CheckoutRequestSerializer(checkout_request).data,
            'message': 'Checkout request created successfully.',
            'nextStep': 'Our team can now review and activate the requested plan from the recorded checkout request.',
        }, status=status.HTTP_201_CREATED)


@method_decorator(csrf_exempt, name='dispatch')
class StripeCheckoutSessionAPIView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not settings.STRIPE_SECRET_KEY:
            return Response({'detail': 'Stripe checkout is not configured yet. Add STRIPE_SECRET_KEY to continue.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        serializer = CheckoutRequestCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.build_payload()

        checkout_request = CheckoutRequest.objects.create(
            user=request.user,
            plan_key=payload['plan_key'],
            plan_name=payload['plan_name'],
            amount_display=payload['amount_display'],
            reference=_build_checkout_reference(),
            provider='stripe',
            billing_mode=payload['billing_mode'],
            provider_payment_status='unpaid',
            source=payload['source'],
            notes=payload['notes'],
            status='Awaiting Payment',
        )

        stripe.api_key = settings.STRIPE_SECRET_KEY
        success_url, cancel_url = _get_checkout_redirect_urls(checkout_request.reference)

        try:
            line_item = {
                'quantity': 1,
                'price_data': {
                    'currency': 'eur',
                    'unit_amount': payload['unit_amount'],
                    'product_data': {
                        'name': payload['plan_name'],
                        'description': payload['description'],
                    },
                },
            }
            if payload['billing_mode'] == 'subscription':
                line_item['price_data']['recurring'] = {'interval': payload['interval'] or 'year'}

            session = stripe.checkout.Session.create(
                mode=payload['billing_mode'],
                success_url=success_url,
                cancel_url=cancel_url,
                customer_email=request.user.email,
                metadata={
                    'checkout_request_id': str(checkout_request.id),
                    'user_id': str(request.user.id),
                    'plan_key': payload['plan_key'],
                    'reference': checkout_request.reference,
                },
                line_items=[line_item],
            )
        except Exception as error:
            checkout_request.status = 'Checkout Error'
            checkout_request.notes = (checkout_request.notes + '\nStripe error: ' + str(error)).strip()
            checkout_request.save(update_fields=['status', 'notes'])
            return Response({'detail': 'Unable to start Stripe checkout right now.'}, status=status.HTTP_502_BAD_GATEWAY)

        checkout_request.provider_session_id = session.id
        checkout_request.save(update_fields=['provider_session_id'])

        return Response({
            'checkoutRequest': CheckoutRequestSerializer(checkout_request).data,
            'checkoutUrl': session.url,
            'message': 'Stripe checkout session created successfully.',
        }, status=status.HTTP_201_CREATED)


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookAPIView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        if not settings.STRIPE_SECRET_KEY or not settings.STRIPE_WEBHOOK_SECRET:
            return Response({'detail': 'Stripe webhook is not configured.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        stripe.api_key = settings.STRIPE_SECRET_KEY

        try:
            event = stripe.Webhook.construct_event(
                payload=request.body,
                sig_header=request.META.get('HTTP_STRIPE_SIGNATURE', ''),
                secret=settings.STRIPE_WEBHOOK_SECRET,
            )
        except ValueError:
            return Response({'detail': 'Invalid Stripe payload.'}, status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError:
            return Response({'detail': 'Invalid Stripe signature.'}, status=status.HTTP_400_BAD_REQUEST)

        event_type = event.get('type')
        session_object = (event.get('data') or {}).get('object') or {}

        if event_type == 'checkout.session.completed':
            _handle_checkout_session_completed(session_object)
        elif event_type == 'customer.subscription.updated':
            _sync_membership_from_subscription(session_object, event_type=event_type)
        elif event_type == 'customer.subscription.deleted':
            _sync_membership_from_subscription(session_object, event_type=event_type)
        elif event_type == 'checkout.session.expired':
            checkout_request = CheckoutRequest.objects.filter(provider_session_id=session_object.get('id')).first()
            if checkout_request and checkout_request.status != 'Paid':
                checkout_request.status = 'Checkout Expired'
                checkout_request.provider_payment_status = session_object.get('payment_status', '') or checkout_request.provider_payment_status
                checkout_request.save(update_fields=['status', 'provider_payment_status'])
                _record_billing_event(
                    event_type='checkout.session.expired',
                    event_status=checkout_request.provider_payment_status,
                    summary='Stripe checkout expired before payment completed.',
                    membership=getattr(checkout_request.user, 'membership', None),
                    checkout_request=checkout_request,
                    reference=checkout_request.reference,
                )

        return Response({'received': True})


class CheckoutRequestStatusAPIView(APIView):
    def get(self, request, reference):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        checkout_request = CheckoutRequest.objects.filter(user=request.user, reference=reference).first()
        if not checkout_request:
            return Response({'detail': 'Checkout request not found.'}, status=status.HTTP_404_NOT_FOUND)

        membership = _get_or_create_membership(request.user)
        return Response({
            'checkoutRequest': CheckoutRequestSerializer(checkout_request).data,
            'membership': MembershipSerializer(membership).data,
        })


@method_decorator(csrf_exempt, name='dispatch')
class MembershipBillingPortalAPIView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        membership = _get_or_create_membership(request.user)
        if not membership.stripe_customer_id or not membership.recurring_plan_key:
            return Response({'detail': 'No active recurring subscription is available to manage.'}, status=status.HTTP_400_BAD_REQUEST)

        if not settings.STRIPE_SECRET_KEY:
            return Response({'detail': 'Stripe billing portal is not configured yet.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        stripe.api_key = settings.STRIPE_SECRET_KEY
        try:
            session = stripe.billing_portal.Session.create(
                customer=membership.stripe_customer_id,
                return_url=f'{settings.APP_BASE_URL}/dashboard?billing=return',
            )
        except Exception:
            return Response({'detail': 'Unable to open the Stripe billing portal right now.'}, status=status.HTTP_502_BAD_GATEWAY)

        _record_billing_event(
            event_type='billing.portal.opened',
            event_status='created',
            summary='Member opened the Stripe billing portal from the dashboard.',
            membership=membership,
            reference=membership.stripe_customer_id,
        )

        return Response({'portalUrl': session.url, 'message': 'Stripe billing portal session created.'})


@method_decorator(csrf_exempt, name='dispatch')
class MembershipCancelRecurringAPIView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        membership = _get_or_create_membership(request.user)
        if not membership.stripe_subscription_id or not membership.recurring_plan_key:
            return Response({'detail': 'No recurring subscription is active for this account.'}, status=status.HTTP_400_BAD_REQUEST)

        if not settings.STRIPE_SECRET_KEY:
            return Response({'detail': 'Stripe subscription management is not configured yet.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        stripe.api_key = settings.STRIPE_SECRET_KEY
        try:
            subscription = stripe.Subscription.modify(membership.stripe_subscription_id, cancel_at_period_end=True)
        except Exception:
            return Response({'detail': 'Unable to schedule cancellation right now.'}, status=status.HTTP_502_BAD_GATEWAY)

        membership.recurring_status = 'cancel_at_period_end'
        current_period_end = getattr(subscription, 'current_period_end', None)
        if current_period_end:
            membership.end_date = datetime.fromtimestamp(current_period_end, tz=dt_timezone.utc).date()
            membership.save(update_fields=['recurring_status', 'end_date', 'updated_at'])
        else:
            membership.save(update_fields=['recurring_status', 'updated_at'])

        _record_billing_event(
            event_type='customer.subscription.cancel_requested',
            event_status='cancel_at_period_end',
            summary='Member scheduled cancellation at period end from the dashboard.',
            membership=membership,
            reference=membership.stripe_subscription_id,
            metadata={'subscriptionId': membership.stripe_subscription_id},
        )

        return Response({
            'membership': MembershipSerializer(membership).data,
            'message': 'Recurring subscription will cancel at the end of the current billing period.',
        })


class OperationsOverviewAPIView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not _user_can_manage_operations(request.user):
            return Response({'detail': 'Operations access required.'}, status=status.HTTP_403_FORBIDDEN)

        checkout_requests = CheckoutRequest.objects.select_related('user', 'user__membership').order_by('-created_at', '-id')[:50]
        memberships = Membership.objects.select_related('user').order_by('user__email')[:50]
        billing_events = BillingEvent.objects.select_related('membership__user', 'checkout_request__user').order_by('-created_at', '-id')[:50]
        engagement = _build_engagement_overview()

        return Response({
            'stats': {
                'totalRequests': CheckoutRequest.objects.count(),
                'awaitingPayment': CheckoutRequest.objects.filter(status='Awaiting Payment').count(),
                'paidRequests': CheckoutRequest.objects.filter(status='Paid').count(),
                'activeMemberships': Membership.objects.filter(status=Membership.STATUS_ACTIVE).count(),
                'failedRenewals': Membership.objects.filter(recurring_status__in=['past_due', 'unpaid', 'incomplete']).count(),
                'scheduledCancellations': Membership.objects.filter(recurring_status='cancel_at_period_end').count(),
                'activeUsersNow': engagement['activeUsersLastFiveMinutes'],
                'eventsLastHour': engagement['eventsLastHour'],
            },
            'checkoutRequests': OperationsCheckoutRequestSerializer(checkout_requests, many=True).data,
            'memberships': [{
                'email': membership.user.email,
                'name': membership.user.get_full_name().strip() or membership.user.username,
                'tier': membership.tier,
                'status': membership.status,
                'recurringPlanKey': membership.recurring_plan_key,
                'recurringStatus': membership.recurring_status,
                'prioritySlotsTotal': membership.priority_slots_total,
                'prioritySlotsUsed': membership.priority_slots_used,
                'expiresAt': membership.end_date.isoformat() if membership.end_date else None,
            } for membership in memberships],
            'billingEvents': BillingEventSerializer(billing_events, many=True).data,
            'engagement': engagement,
        })


@method_decorator(csrf_exempt, name='dispatch')
class EngagementTrackAPIView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]

    def post(self, request):
        serializer = EngagementTrackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated = serializer.validated_data
        session_key = _get_request_session_key(request)
        event_type = validated.get('eventType', UserEngagementEvent.EVENT_PAGE_VIEW)
        path = validated['path']
        user = request.user if request.user.is_authenticated else None

        if event_type == UserEngagementEvent.EVENT_HEARTBEAT:
            heartbeat_cutoff = timezone.now() - timedelta(seconds=90)
            existing_heartbeat = UserEngagementEvent.objects.filter(
                user=user,
                session_key=session_key,
                path=path,
                event_type=UserEngagementEvent.EVENT_HEARTBEAT,
                created_at__gte=heartbeat_cutoff,
            ).first()
            if existing_heartbeat:
                return Response({'recorded': False, 'deduplicated': True}, status=status.HTTP_200_OK)

        event = UserEngagementEvent.objects.create(
            user=user,
            session_key=session_key,
            path=path,
            event_type=event_type,
            metadata=validated.get('metadata') or {},
        )

        return Response({'recorded': True, 'eventId': event.id}, status=status.HTTP_201_CREATED)


@method_decorator(csrf_exempt, name='dispatch')
class OperationsActivateCheckoutAPIView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]

    def post(self, request, reference):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not _user_can_manage_operations(request.user):
            return Response({'detail': 'Operations access required.'}, status=status.HTTP_403_FORBIDDEN)

        checkout_request = CheckoutRequest.objects.select_related('user').filter(reference=reference).first()
        if not checkout_request:
            return Response({'detail': 'Checkout request not found.'}, status=status.HTTP_404_NOT_FOUND)

        if checkout_request.completed_at is None:
            checkout_request.completed_at = timezone.now()

        if not checkout_request.provider_payment_status:
            checkout_request.provider_payment_status = 'manual-approved'

        checkout_request.status = 'Manually Activated'
        checkout_request.save(update_fields=['completed_at', 'provider_payment_status', 'status'])
        membership = _activate_membership_for_checkout(checkout_request)

        return Response({
            'checkoutRequest': OperationsCheckoutRequestSerializer(checkout_request).data,
            'membership': MembershipSerializer(membership).data,
            'message': 'Membership activated from operations.',
        })


def _derive_trip_price(budget_text):
    if not budget_text:
        return Decimal('0.00')

    matches = re.findall(r'\d[\d,.]*', budget_text)
    if not matches:
        return Decimal('0.00')

    normalized = matches[0].replace(',', '')
    try:
        return Decimal(normalized)
    except InvalidOperation:
        return Decimal('0.00')


def _derive_classifications(style_text):
    if not style_text:
        return ['AI Generated']

    items = []
    for raw_item in re.split(r'[,+/]', style_text):
        cleaned = raw_item.strip()
        if cleaned:
            items.append(cleaned.title())

    return items or ['AI Generated']


def _derive_duration(start_date, end_date):
    if start_date and end_date:
        total_days = (end_date - start_date).days + 1
        if total_days <= 1:
            return '1 day'
        return f'{total_days} days'

    return 'Flexible duration'


def _build_ai_trip_title(destination, start_date, option_label='AI Trip'):
    suffix = start_date.strftime('%b %Y') if start_date else timezone.now().strftime('%b %Y')
    return f'{destination} {option_label} Blueprint ({suffix})'[:120]


def _build_trip_option_strategies(option_count):
    strategies = [
        {
            'label': 'Balanced Explorer',
            'comparison_focus': 'Best overall pacing',
            'planning_note': 'Build a balanced itinerary with signature highlights, efficient routing, and moderate pacing.',
        },
        {
            'label': 'Fast Track Highlights',
            'comparison_focus': 'Most ambitious sightseeing coverage',
            'planning_note': 'Build a denser itinerary that prioritizes major highlights and efficient sequencing for travelers who want to see more.',
        },
        {
            'label': 'Slow Travel Comfort',
            'comparison_focus': 'Lowest pace and highest flexibility',
            'planning_note': 'Build a slower itinerary with fewer transitions, more neighborhood depth, and recovery time between activities.',
        },
        {
            'label': 'Value Maximizer',
            'comparison_focus': 'Strongest value for budget',
            'planning_note': 'Build a value-focused itinerary that keeps costs under control while preserving standout experiences.',
        },
    ]
    return strategies[:option_count]


def _build_option_fallback_itinerary(destination, style, transport, goals, strategy):
    return [
        {
            'day': 'Day 1',
            'title': 'Arrival and setup',
            'description': f"Arrive in {destination}, settle in, and start with a {strategy['label'].lower()} approach that fits {style or 'your preferred travel style'}.",
        },
        {
            'day': 'Day 2',
            'title': 'Core routing block',
            'description': f"Structure the main experiences around {strategy['comparison_focus'].lower()} with {transport or 'a practical transport mix'} and realistic transfer times.",
        },
        {
            'day': 'Day 3',
            'title': 'Local depth and alternatives',
            'description': goals or f"Keep the final day aligned to {strategy['label'].lower()} priorities with flexible alternatives, local food, and pacing that still feels realistic.",
        },
    ]


def _build_option_scores(strategy_label):
    presets = {
        'Balanced Explorer': {'pace': 8, 'value': 7, 'flexibility': 7},
        'Fast Track Highlights': {'pace': 9, 'value': 6, 'flexibility': 4},
        'Slow Travel Comfort': {'pace': 5, 'value': 7, 'flexibility': 9},
        'Value Maximizer': {'pace': 7, 'value': 9, 'flexibility': 7},
    }
    base = presets.get(strategy_label, {'pace': 7, 'value': 7, 'flexibility': 7})
    base['overall'] = round((base['pace'] + base['value'] + base['flexibility']) / 3, 1)
    return base


class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.select_related('expert').prefetch_related('reviews', 'itinerary').all()
    serializer_class = TripSerializer


class HomeAPIView(APIView):
    def get(self, request):
        featured_trips = Trip.objects.select_related('expert').filter(featured=True, is_ai_generated=False).order_by('-views', '-date')[:3]
        featured_experts = Expert.objects.order_by('-star_rating', '-trip_count_display')[:3]
        all_trips = Trip.objects.filter(is_ai_generated=False)
        unique_countries = set()
        for trip in all_trips:
            if trip.countries:
                unique_countries.update(trip.countries)
            elif trip.country:
                unique_countries.add(trip.country)

        return Response({
            'stats': {
                'documentedTrips': all_trips.count(),
                'registeredMembers': Expert.objects.count(),
                'countriesCovered': len(unique_countries),
            },
            'featuredTrips': HomeTripSerializer(featured_trips, many=True).data,
            'featuredExperts': HomeExpertSerializer(featured_experts, many=True).data,
        })


class MemberDirectoryAPIView(APIView):
    def get(self, request):
        search = request.query_params.get('search', '').strip().lower()
        country = request.query_params.get('country', 'All countries')
        classification = request.query_params.get('classification', 'All classifications')
        viewer_access = _resolve_member_directory_viewer_access(request)
        experts = list(Expert.objects.all())

        countries = sorted({country_name for expert in experts for country_name in expert.countries_visited})
        classifications = sorted({item for expert in experts for item in expert.specializations})

        filtered = []
        for expert in experts:
            matches_search = not search or search in expert.name.lower()
            matches_country = country == 'All countries' or country in expert.countries_visited
            matches_classification = classification == 'All classifications' or classification in expert.specializations
            if matches_search and matches_country and matches_classification:
                filtered.append(expert)

        return Response({
            'count': len(filtered),
            'countries': ['All countries'] + countries,
            'classifications': ['All classifications'] + classifications,
            'viewerAccess': viewer_access,
            'results': MemberDirectorySerializer(filtered, many=True, context={'viewerAccess': viewer_access}).data,
        })


class MessageThreadListAPIView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        messages = list(
            DirectMessage.objects.filter(Q(sender=request.user) | Q(recipient=request.user))
            .select_related('sender__expert_profile', 'recipient__expert_profile')
            .order_by('-created_at', '-id')
        )

        threads = {}
        for message in messages:
            other_user = message.recipient if message.sender_id == request.user.id else message.sender
            entry = threads.get(other_user.id)
            if entry is None:
                entry = _build_message_thread_payload(request.user, other_user, latest_message=message, unread_count=0)
                threads[other_user.id] = entry

            if message.recipient_id == request.user.id and message.read_at is None:
                entry['unreadCount'] += 1

        payload = list(threads.values())
        payload.sort(key=lambda item: item['updatedAt'] or timezone.make_aware(datetime.min), reverse=True)
        return Response({'threads': MessageThreadSerializer(payload, many=True).data})


class MessageSummaryAPIView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        return Response(_build_message_summary(request.user))


@method_decorator(csrf_exempt, name='dispatch')
class MessageThreadDetailAPIView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]

    def get(self, request, user_id):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        other_user = User.objects.filter(id=user_id).select_related('expert_profile').first()
        if not other_user or other_user.id == request.user.id:
            return Response({'detail': 'Message thread not found.'}, status=status.HTTP_404_NOT_FOUND)

        unread_qs = DirectMessage.objects.filter(sender=other_user, recipient=request.user, read_at__isnull=True)
        marked_read = unread_qs.count()
        unread_qs.update(read_at=timezone.now())

        conversation = DirectMessage.objects.filter(
            Q(sender=request.user, recipient=other_user) | Q(sender=other_user, recipient=request.user)
        ).select_related('sender').order_by('created_at', 'id')

        thread_payload = _build_message_thread_payload(request.user, other_user, latest_message=conversation.last(), unread_count=0)
        if marked_read:
            _push_message_summary_event(request.user, 'message.read', thread_payload)

        return Response({
            'thread': MessageThreadSerializer(thread_payload).data,
            'messages': DirectMessageSerializer(conversation, many=True, context={'request': request}).data,
        })

    def post(self, request, user_id):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        other_user = User.objects.filter(id=user_id).select_related('expert_profile').first()
        if not other_user or other_user.id == request.user.id:
            return Response({'detail': 'Message recipient not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = DirectMessageComposerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message = DirectMessage.objects.create(
            sender=request.user,
            recipient=other_user,
            body=serializer.validated_data['body'],
        )
        _refresh_expert_message_count(other_user)
        recipient_unread_count = DirectMessage.objects.filter(sender=request.user, recipient=other_user, read_at__isnull=True).count()
        sender_thread = _build_message_thread_payload(request.user, other_user, latest_message=message, unread_count=0)
        recipient_thread = _build_message_thread_payload(other_user, request.user, latest_message=message, unread_count=recipient_unread_count)
        _push_message_summary_event(request.user, 'message.created', sender_thread)
        _push_message_summary_event(other_user, 'message.created', recipient_thread)

        return Response({
            'message': DirectMessageSerializer(message, context={'request': request}).data,
            'thread': MessageThreadSerializer(sender_thread).data,
        }, status=status.HTTP_201_CREATED)


class LeaderboardAPIView(APIView):
    def get(self, request):
        country = request.query_params.get('country', 'All Countries')
        classification = request.query_params.get('classification', 'All Classifications')
        trips = list(Trip.objects.select_related('expert').filter(is_ai_generated=False).order_by('-views', '-date'))
        experts = list(Expert.objects.all().order_by('-trip_count_display', '-profile_views'))

        countries = sorted({country_name for trip in trips for country_name in (trip.countries or ([trip.country] if trip.country else []))})
        classifications = sorted({item for trip in trips for item in (trip.classifications or ([trip.classification] if trip.classification else []))})

        filtered_trips = []
        for trip in trips:
            trip_countries = trip.countries or ([trip.country] if trip.country else [])
            trip_classifications = trip.classifications or ([trip.classification] if trip.classification else [])
            matches_country = country == 'All Countries' or country in trip_countries
            matches_classification = classification == 'All Classifications' or classification in trip_classifications
            if matches_country and matches_classification:
                filtered_trips.append(trip)

        trip_payload = []
        for index, trip in enumerate(filtered_trips[:5], start=1):
            trip_payload.append({
                'id': trip.id,
                'rank': index,
                'title': trip.title,
                'author': trip.expert.name if trip.expert else '',
                'countries': trip.countries or ([trip.country] if trip.country else []),
                'classifications': trip.classifications or ([trip.classification] if trip.classification else []),
                'views': f"{trip.views:,}".replace(',', ' '),
            })

        author_payload = []
        for index, expert in enumerate(experts[:5], start=1):
            author_payload.append({
                'rank': index,
                'name': expert.name,
                'contribution': f"{expert.trip_count_display} trips",
                'metric': expert.author_metric or 'Documented contribution',
            })

        return Response({
            'countries': ['All Countries'] + countries,
            'classifications': ['All Classifications'] + classifications,
            'tripLeaderboard': trip_payload,
            'authorLeaderboard': author_payload,
        })


class DashboardAPIView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        membership = _get_or_create_membership(request.user)
        expert = _get_expert_for_user(request.user)
        if not expert:
            return Response({'detail': 'No dashboard profile available.'}, status=status.HTTP_404_NOT_FOUND)

        user_trips = Trip.objects.select_related('expert').filter(expert=expert, is_ai_generated=False).order_by('-date')
        ai_trips = list(Trip.objects.select_related('expert').filter(expert=expert, is_ai_generated=True).order_by('-date'))
        checkout_requests = CheckoutRequest.objects.filter(user=request.user)
        ai_trips.sort(key=lambda trip: (trip.status != 'Preferred', -trip.date.toordinal(), -trip.id))
        profile_payload = ExpertSerializer(expert).data
        profile_payload['membership'] = MembershipSerializer(membership).data

        return Response({
            'profile': profile_payload,
            'stats': {
                'tripsDocumented': user_trips.count(),
                'countriesVisited': len(expert.countries_visited),
                'messages': expert.messages_count,
                'profileViews': expert.profile_views,
            },
            'quickActions': [
                {'title': 'View Profile', 'description': 'See your public profile as others see it.'},
                {'title': 'Messages', 'description': 'View and send private messages.'},
                {'title': 'New Trip', 'description': 'Document a new travel experience.'},
                {'title': 'AI Trip Builder', 'description': 'Generate a complete travel plan with AI.'},
                {'title': '⭐ Subscription & Priority', 'description': 'Subscribe, boost trips, or get both in one checkout.'},
            ],
            'pricingOptions': [
                {
                    'title': 'Premium Subscription — €35/year',
                    'description': 'Unlock full access to member profiles, detailed itineraries, travel maps, contact information, and private messaging.',
                    'button': 'Subscribe — €35/year',
                    'featured': False,
                },
                {
                    'title': 'Priority Listing — €35/slot/year',
                    'description': 'Boost your trips to the top of search results. Each slot covers up to 2 countries and 2 classifications. Fully independent from subscription.',
                    'button': 'Get Priority Listing — €35/slot',
                    'featured': False,
                },
                {
                    'title': 'Both — From €100/year',
                    'description': 'Get subscription + priority listing in a single checkout. Full access plus top search placement.',
                    'button': 'Get Both',
                    'featured': True,
                },
            ],
            'trips': DashboardTripSerializer(user_trips, many=True).data,
            'aiTrips': DashboardTripSerializer(ai_trips, many=True).data,
            'checkoutRequests': CheckoutRequestSerializer(checkout_requests, many=True).data,
        })


@method_decorator(csrf_exempt, name='dispatch')
class DocumentTripCreateAPIView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = DocumentTripRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data

        expert = _get_expert_for_user(request.user)
        if not expert:
            return Response({'detail': 'No dashboard profile available.'}, status=status.HTTP_404_NOT_FOUND)

        countries = [validated['destinationCountry']] + validated.get('additionalCountries', [])
        visibility = validated.get('visibility', 'Member')
        trip_status = 'Draft' if visibility == 'Private' else 'Published'

        with transaction.atomic():
            trip = Trip.objects.create(
                title=validated['title'],
                classification=validated['classifications'][0],
                classifications=validated['classifications'],
                country=validated['destinationCountry'],
                countries=countries,
                city=validated['destinationCity'],
                duration=_derive_duration(validated.get('travelStart'), validated.get('travelEnd')),
                expert=expert,
                members=validated.get('travelerCount', 1),
                rating=0,
                price=validated.get('estimatedTotalPrice') or Decimal('0.00'),
                budget_range=validated.get('budgetRange') or 'Budget not specified',
                date=validated['travelStart'],
                status=trip_status,
                visibility=visibility,
                views=0,
                icon='',
                is_ai_generated=False,
                featured=False,
                summary=validated['summary'],
            )

            ItineraryItem.objects.bulk_create([
                ItineraryItem(trip=trip, day=item['day'], description=item['description'])
                for item in validated['itinerary']
            ])

        return Response({
            'createdTrip': DashboardTripSerializer(trip).data,
            'detailPath': f'/trips/{trip.id}',
            'message': 'Trip documented successfully.',
        }, status=status.HTTP_201_CREATED)


@method_decorator(csrf_exempt, name='dispatch')
class AITripBuilderPreviewAPIView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = AITripBuilderRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data

        destination = validated.get('destinationCountry', '').strip()
        departure = validated.get('departureCountry', '').strip()
        start_date = validated.get('travelStart')
        end_date = validated.get('travelEnd')
        option_count = validated.get('optionCount', 1)
        budget = validated.get('budget', '').strip()
        style = validated.get('travelStyle', '').strip()
        transport = validated.get('transportPreference', '').strip()
        accommodation = validated.get('accommodationLevel', '').strip()
        goals = validated.get('tripGoals', '').strip()
        classifications = _derive_classifications(style)
        duration = _derive_duration(start_date, end_date)
        trip_price = _derive_trip_price(budget)
        trip_owner = _get_expert_for_user(request.user)

        summary = {
            'route': f"{departure or 'Departure location'} to {destination}",
            'budget': budget or 'Budget not specified',
            'style': style or 'General travel',
            'transport': transport or 'Best-fit transport mix',
            'accommodation': accommodation or 'Balanced accommodation mix',
            'dates': f"{start_date.isoformat() if start_date else 'Flexible start'} to {end_date.isoformat() if end_date else 'Flexible end'}",
        }
        trip_options = []

        with transaction.atomic():
            for index, strategy in enumerate(_build_trip_option_strategies(option_count), start=1):
                option_summary = {
                    **summary,
                    'strategy': strategy['label'],
                    'comparisonFocus': strategy['comparison_focus'],
                }
                fallback_itinerary = _build_option_fallback_itinerary(destination, style, transport, goals, strategy)
                fallback_summary_text = ' · '.join([
                    option_summary['route'],
                    strategy['label'],
                    option_summary['style'],
                    option_summary['budget'],
                    option_summary['transport'],
                    option_summary['accommodation'],
                ])

                plan = generate_trip_plan(
                    departure=departure,
                    destination=destination,
                    start_date=start_date,
                    end_date=end_date,
                    budget=budget,
                    style=style,
                    transport=transport,
                    accommodation=accommodation,
                    goals=goals,
                    fallback_title=_build_ai_trip_title(destination, start_date, strategy['label']),
                    fallback_summary_text=fallback_summary_text,
                    fallback_itinerary=fallback_itinerary,
                    fallback_classifications=classifications,
                    option_prompt=strategy['planning_note'],
                )

                option_classifications = plan['classifications']
                itinerary = plan['itinerary']
                trip = Trip.objects.create(
                    title=plan['title'],
                    classification=option_classifications[0],
                    classifications=option_classifications,
                    country=destination,
                    countries=[destination],
                    city=destination,
                    duration=duration,
                    expert=trip_owner,
                    members=1,
                    rating=0,
                    price=trip_price,
                    budget_range=budget or 'Budget not specified',
                    date=start_date or timezone.now().date(),
                    status='Generated',
                    visibility='Private',
                    views=0,
                    icon='',
                    is_ai_generated=True,
                    featured=False,
                    summary=plan['summary_text'],
                )

                ItineraryItem.objects.bulk_create([
                    ItineraryItem(trip=trip, day=item['day'], description=item['description'])
                    for item in itinerary
                ])

                trip_options.append({
                    'optionNumber': index,
                    'summary': option_summary,
                    'itinerary': itinerary,
                    'savedTrip': DashboardTripSerializer(trip).data,
                    'title': plan['title'],
                    'compare': {
                        'focus': strategy['comparison_focus'],
                        'duration': duration,
                        'budget': option_summary['budget'],
                        'style': option_summary['style'],
                        'transport': option_summary['transport'],
                        'accommodation': option_summary['accommodation'],
                        'classifications': option_classifications,
                        'scores': _build_option_scores(strategy['label']),
                    },
                })

        primary_option = trip_options[0]

        return Response({
            'summary': primary_option['summary'],
            'itinerary': primary_option['itinerary'],
            'savedTrip': primary_option['savedTrip'],
            'tripOptions': trip_options,
            'comparison': {
                'destination': destination,
                'optionCount': len(trip_options),
            },
        }, status=status.HTTP_201_CREATED)


@method_decorator(csrf_exempt, name='dispatch')
class AITripBuilderSelectAPIView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = AITripSelectionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        trip = Trip.objects.select_related('expert').filter(id=serializer.validated_data['tripId'], is_ai_generated=True).first()
        if not trip:
            return Response({'detail': 'AI trip not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not trip.expert_id:
            return Response({'detail': 'AI trip does not have an archive owner.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            Trip.objects.filter(expert_id=trip.expert_id, is_ai_generated=True, status='Preferred').exclude(id=trip.id).update(status='Generated')
            if trip.status != 'Preferred':
                trip.status = 'Preferred'
                trip.save(update_fields=['status'])

        return Response({
            'selectedTrip': DashboardTripSerializer(trip).data,
            'message': 'Preferred AI trip updated.',
        }, status=status.HTTP_200_OK)
