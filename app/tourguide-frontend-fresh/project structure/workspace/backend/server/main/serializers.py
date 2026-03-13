from django.contrib.auth import authenticate, get_user_model
from django.utils import timezone
from rest_framework import serializers
from .models import BillingEvent, CheckoutRequest, Membership, Trip, Expert, Review, ItineraryItem, DirectMessage


User = get_user_model()


def build_user_display_name(user):
    if not user:
        return 'Member'

    full_name = user.get_full_name().strip()
    if full_name:
        return full_name

    return user.username.split('@')[0].replace('.', ' ').replace('_', ' ').title()

CHECKOUT_PLANS = {
    'subscription': {
        'planName': 'Premium Membership',
        'amountDisplay': 'EUR 35/year',
        'unitAmount': 3500,
        'billingMode': 'subscription',
        'interval': 'year',
        'description': 'Unlock member profiles, detailed itineraries, maps, and private contact paths.',
    },
    'priority': {
        'planName': 'Priority Listing',
        'amountDisplay': 'EUR 35/slot/year',
        'unitAmount': 3500,
        'billingMode': 'payment',
        'interval': None,
        'description': 'Boost your documented trips higher in search and visibility flows.',
    },
    'bundle': {
        'planName': 'Subscribe + Boost',
        'amountDisplay': 'From EUR 70/year',
        'unitAmount': 7000,
        'billingMode': 'subscription',
        'interval': 'year',
        'description': 'Combine membership access and one priority listing slot in a single payment.',
    },
}


STAR_CATEGORY_WEIGHTS = {
    'trip_quality': 0.30,
    'itinerary_detail': 0.25,
    'contact_responsiveness': 0.20,
    'community_ratings': 0.15,
    'account_age': 0.10,
}


def _clamp_star_score(value):
    return max(1.0, min(5.0, round(value * 2) / 2))


def build_star_breakdown(expert):
    base_score = max(1.0, min(5.0, float(expert.star_rating or 1)))
    trip_count = expert.trip_count_display or 0
    specialization_count = len(expert.specializations or [])
    profile_views = expert.profile_views or 0
    messages_count = expert.messages_count or 0
    consultancy_mode = (expert.consultancy_mode or '').strip().lower()

    if expert.member_since:
        years_active = max((timezone.now().date() - expert.member_since).days / 365.25, 0)
    else:
        years_active = 0

    trip_quality = _clamp_star_score(base_score - 0.5 + (0.5 if trip_count >= 15 else 0) + (0.5 if trip_count >= 30 else 0))
    itinerary_detail = _clamp_star_score(base_score - 0.5 + (0.5 if specialization_count >= 4 else 0) + (0.5 if trip_count >= 20 else 0))
    contact_responsiveness = _clamp_star_score(base_score - 1 + (1 if consultancy_mode != 'no consultancy' else 0) + (0.5 if messages_count >= 1 else 0) + (0.5 if messages_count >= 3 else 0))
    community_ratings = _clamp_star_score(base_score - 0.5 + (0.5 if profile_views >= 100 else 0) + (0.5 if trip_count >= 20 else 0))

    if years_active >= 4:
        account_age = 5.0
    elif years_active >= 3:
        account_age = 4.0
    elif years_active >= 2:
        account_age = 3.5
    elif years_active >= 1:
        account_age = 3.0
    else:
        account_age = 2.5

    categories = [
        {
            'key': 'trip_quality',
            'label': 'Trip Quality',
            'score': trip_quality,
            'weight': STAR_CATEGORY_WEIGHTS['trip_quality'],
        },
        {
            'key': 'itinerary_detail',
            'label': 'Itinerary Detail',
            'score': itinerary_detail,
            'weight': STAR_CATEGORY_WEIGHTS['itinerary_detail'],
        },
        {
            'key': 'contact_responsiveness',
            'label': 'Contact Responsiveness',
            'score': contact_responsiveness,
            'weight': STAR_CATEGORY_WEIGHTS['contact_responsiveness'],
        },
        {
            'key': 'community_ratings',
            'label': 'Community Ratings',
            'score': community_ratings,
            'weight': STAR_CATEGORY_WEIGHTS['community_ratings'],
        },
        {
            'key': 'account_age',
            'label': 'Account Age',
            'score': account_age,
            'weight': STAR_CATEGORY_WEIGHTS['account_age'],
        },
    ]

    overall = round(sum(item['score'] * item['weight'] for item in categories), 1)

    return {
        'overall': overall,
        'display': int(round(overall)),
        'categories': categories,
        'explanation': 'Star ratings combine trip quality, itinerary detail, contact responsiveness, community ratings, and account age. The overall star rating is a weighted average of these five signals and is recalculated from member activity and profile history.',
    }


class OptionalDateField(serializers.DateField):
    def to_internal_value(self, value):
        if value in ('', None):
            return None
        return super().to_internal_value(value)


class AITripBuilderRequestSerializer(serializers.Serializer):
    departureCountry = serializers.CharField(required=False, allow_blank=True, max_length=80)
    destinationCountry = serializers.CharField(required=True, allow_blank=False, max_length=80)
    travelStart = OptionalDateField(required=False, allow_null=True)
    travelEnd = OptionalDateField(required=False, allow_null=True)
    optionCount = serializers.IntegerField(required=False, min_value=1, max_value=4, default=1)
    budget = serializers.CharField(required=False, allow_blank=True, max_length=80)
    travelStyle = serializers.CharField(required=False, allow_blank=True, max_length=120)
    transportPreference = serializers.CharField(required=False, allow_blank=True, max_length=120)
    accommodationLevel = serializers.CharField(required=False, allow_blank=True, max_length=120)
    tripGoals = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        start_date = attrs.get('travelStart')
        end_date = attrs.get('travelEnd')

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({'travelEnd': 'Travel end date cannot be earlier than travel start date.'})

        return attrs


class AITripSelectionSerializer(serializers.Serializer):
    tripId = serializers.IntegerField(required=True, min_value=1)


class EngagementTrackSerializer(serializers.Serializer):
    path = serializers.CharField(required=True, allow_blank=False, max_length=240)
    eventType = serializers.ChoiceField(required=False, choices=['page_view', 'heartbeat'], default='page_view')
    metadata = serializers.JSONField(required=False)

    def validate_path(self, value):
        path = value.strip()
        if not path:
            raise serializers.ValidationError('Path is required.')

        if '://' in path:
            raise serializers.ValidationError('Path must be a relative app route.')

        return path if path.startswith('/') else '/' + path


class DocumentTripItineraryItemSerializer(serializers.Serializer):
    day = serializers.CharField(required=True, allow_blank=False, max_length=40)
    description = serializers.CharField(required=True, allow_blank=False)


class DocumentTripRequestSerializer(serializers.Serializer):
    title = serializers.CharField(required=True, allow_blank=False, max_length=120)
    destinationCountry = serializers.CharField(required=True, allow_blank=False, max_length=80)
    destinationCity = serializers.CharField(required=True, allow_blank=False, max_length=80)
    additionalCountries = serializers.ListField(child=serializers.CharField(max_length=80), required=False, default=list)
    travelStart = OptionalDateField(required=True)
    travelEnd = OptionalDateField(required=True)
    classifications = serializers.ListField(child=serializers.CharField(max_length=80), required=True, allow_empty=False)
    summary = serializers.CharField(required=True, allow_blank=False)
    budgetRange = serializers.CharField(required=False, allow_blank=True, max_length=80)
    estimatedTotalPrice = serializers.DecimalField(required=False, max_digits=8, decimal_places=2, min_value=0, default='0.00')
    travelerCount = serializers.IntegerField(required=False, min_value=1, default=1)
    visibility = serializers.ChoiceField(required=False, choices=['Public', 'Member', 'Private'], default='Member')
    itinerary = DocumentTripItineraryItemSerializer(many=True, required=True, allow_empty=False)

    def validate(self, attrs):
        start_date = attrs.get('travelStart')
        end_date = attrs.get('travelEnd')

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({'travelEnd': 'Travel end date cannot be earlier than travel start date.'})

        attrs['title'] = attrs['title'].strip()
        attrs['destinationCountry'] = attrs['destinationCountry'].strip()
        attrs['destinationCity'] = attrs['destinationCity'].strip()
        attrs['summary'] = attrs['summary'].strip()
        attrs['budgetRange'] = attrs.get('budgetRange', '').strip()

        attrs['classifications'] = [item.strip() for item in attrs.get('classifications', []) if item and item.strip()]
        if not attrs['classifications']:
            raise serializers.ValidationError({'classifications': 'Add at least one trip classification or theme.'})

        primary_country = attrs['destinationCountry']
        extra_countries = []
        for item in attrs.get('additionalCountries', []):
            cleaned = item.strip()
            if cleaned and cleaned.lower() != primary_country.lower() and cleaned not in extra_countries:
                extra_countries.append(cleaned)
        attrs['additionalCountries'] = extra_countries

        if not attrs['summary']:
            raise serializers.ValidationError({'summary': 'Trip summary is required.'})

        return attrs


class SignupSerializer(serializers.Serializer):
    name = serializers.CharField(required=True, allow_blank=False, max_length=150)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, allow_blank=False, min_length=8, write_only=True)
    confirmPassword = serializers.CharField(required=True, allow_blank=False, write_only=True)
    acceptedLegal = serializers.BooleanField(required=True, write_only=True)

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return email

    def validate(self, attrs):
        name = attrs['name'].strip()
        if not name:
            raise serializers.ValidationError({'name': 'Full name is required.'})

        if attrs['password'] != attrs['confirmPassword']:
            raise serializers.ValidationError({'confirmPassword': 'Passwords must match.'})

        if not attrs.get('acceptedLegal'):
            raise serializers.ValidationError({'acceptedLegal': 'You must accept the Terms of Use and Disclaimer.'})

        attrs['name'] = name
        return attrs

    def create(self, validated_data):
        email = validated_data['email']
        name = validated_data['name']
        first_name, _, last_name = name.partition(' ')
        user = User.objects.create_user(
            username=email,
            email=email,
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name.strip(),
        )
        membership, _ = Membership.objects.get_or_create(
            user=user,
            defaults={'start_date': timezone.now().date()},
        )
        acceptance_time = timezone.now()
        membership.terms_accepted_at = acceptance_time
        membership.disclaimer_accepted_at = acceptance_time
        membership.save(update_fields=['terms_accepted_at', 'disclaimer_accepted_at', 'updated_at'])
        Expert.objects.get_or_create(
            user=user,
            defaults={
                'name': name,
                'initials': ''.join(part[0].upper() for part in name.split()[:2]) or 'TR',
                'member_since': timezone.now().date(),
                'consultancy_mode': 'Free & Paid',
                'consultation_rate': 'Rate not set',
                'consultancy_bio': 'No consultancy bio added yet.',
            },
        )
        return user


class ConsultancyProfileUpdateSerializer(serializers.Serializer):
    consultancy_mode = serializers.CharField(required=True, allow_blank=False, max_length=40)
    consultation_rate = serializers.CharField(required=True, allow_blank=False, max_length=40)
    consultancy_bio = serializers.CharField(required=True, allow_blank=False)

    def validate_consultancy_mode(self, value):
        return value.strip()

    def validate_consultation_rate(self, value):
        return value.strip()

    def validate_consultancy_bio(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Consultancy bio cannot be blank.')
        return value


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, allow_blank=False, write_only=True)

    def validate(self, attrs):
        email = attrs['email'].strip().lower()
        password = attrs['password']
        matched_user = User.objects.filter(email__iexact=email).first()
        username = matched_user.get_username() if matched_user else email
        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError({'detail': 'Invalid email or password.'})

        attrs['email'] = email
        attrs['user'] = user
        return attrs


class CheckoutRequestCreateSerializer(serializers.Serializer):
    planKey = serializers.ChoiceField(required=True, choices=sorted(CHECKOUT_PLANS.keys()))
    source = serializers.CharField(required=False, allow_blank=True, max_length=40, default='pricing-page')
    notes = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_notes(self, value):
        return value.strip()

    def build_payload(self):
        validated = self.validated_data
        plan = CHECKOUT_PLANS[validated['planKey']]
        return {
            'plan_key': validated['planKey'],
            'plan_name': plan['planName'],
            'amount_display': plan['amountDisplay'],
            'unit_amount': plan['unitAmount'],
            'billing_mode': plan['billingMode'],
            'interval': plan['interval'],
            'description': plan['description'],
            'source': validated.get('source', 'pricing-page').strip(),
            'notes': validated.get('notes', ''),
        }


class CheckoutRequestSerializer(serializers.ModelSerializer):
    planKey = serializers.CharField(source='plan_key', read_only=True)
    planName = serializers.CharField(source='plan_name', read_only=True)
    amountDisplay = serializers.CharField(source='amount_display', read_only=True)
    billingMode = serializers.CharField(source='billing_mode', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = CheckoutRequest
        fields = ['id', 'reference', 'planKey', 'planName', 'amountDisplay', 'billingMode', 'status', 'source', 'notes', 'createdAt']


class MembershipSerializer(serializers.ModelSerializer):
    startedAt = serializers.DateField(source='start_date', read_only=True)
    expiresAt = serializers.DateField(source='end_date', read_only=True)
    prioritySlotsTotal = serializers.IntegerField(source='priority_slots_total', read_only=True)
    prioritySlotsUsed = serializers.IntegerField(source='priority_slots_used', read_only=True)
    canViewStarBreakdown = serializers.BooleanField(source='can_view_star_breakdown', read_only=True)
    hasPriorityListing = serializers.BooleanField(source='has_priority_listing', read_only=True)
    recurringPlanKey = serializers.CharField(source='recurring_plan_key', read_only=True)
    recurringStatus = serializers.CharField(source='recurring_status', read_only=True)

    class Meta:
        model = Membership
        fields = [
            'tier',
            'status',
            'startedAt',
            'expiresAt',
            'prioritySlotsTotal',
            'prioritySlotsUsed',
            'canViewStarBreakdown',
            'hasPriorityListing',
            'recurringPlanKey',
            'recurringStatus',
        ]


class OperationsCheckoutRequestSerializer(serializers.ModelSerializer):
    planKey = serializers.CharField(source='plan_key', read_only=True)
    planName = serializers.CharField(source='plan_name', read_only=True)
    amountDisplay = serializers.CharField(source='amount_display', read_only=True)
    billingMode = serializers.CharField(source='billing_mode', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    completedAt = serializers.DateTimeField(source='completed_at', read_only=True)
    userName = serializers.SerializerMethodField()
    userEmail = serializers.EmailField(source='user.email', read_only=True)
    membershipTier = serializers.SerializerMethodField()

    class Meta:
        model = CheckoutRequest
        fields = [
            'id',
            'reference',
            'planKey',
            'planName',
            'amountDisplay',
            'billingMode',
            'status',
            'provider',
            'provider_session_id',
            'provider_customer_id',
            'provider_subscription_id',
            'provider_payment_status',
            'source',
            'notes',
            'createdAt',
            'completedAt',
            'userName',
            'userEmail',
            'membershipTier',
        ]

    def get_userName(self, obj):
        full_name = obj.user.get_full_name().strip()
        if full_name:
            return full_name
        return obj.user.username.split('@')[0].replace('.', ' ').replace('_', ' ').title()

    def get_membershipTier(self, obj):
        membership = getattr(obj.user, 'membership', None)
        return membership.tier if membership else 'Member'


class BillingEventSerializer(serializers.ModelSerializer):
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    userName = serializers.SerializerMethodField()
    userEmail = serializers.SerializerMethodField()

    class Meta:
        model = BillingEvent
        fields = [
            'id',
            'provider',
            'event_type',
            'event_status',
            'reference',
            'summary',
            'createdAt',
            'userName',
            'userEmail',
        ]

    def get_userName(self, obj):
        membership = getattr(obj, 'membership', None)
        user = membership.user if membership else None
        if not user and getattr(obj, 'checkout_request', None):
            user = obj.checkout_request.user
        if not user:
            return 'Unknown member'
        full_name = user.get_full_name().strip()
        if full_name:
            return full_name
        return user.username.split('@')[0].replace('.', ' ').replace('_', ' ').title()

    def get_userEmail(self, obj):
        membership = getattr(obj, 'membership', None)
        user = membership.user if membership else None
        if not user and getattr(obj, 'checkout_request', None):
            user = obj.checkout_request.user
        return user.email if user else ''

class ExpertSerializer(serializers.ModelSerializer):
    star_breakdown = serializers.SerializerMethodField()
    linked_user_id = serializers.IntegerField(source='user_id', read_only=True)

    class Meta:
        model = Expert
        fields = [
            'id', 'name', 'initials', 'profile', 'bio', 'member_since', 'consultancy_mode',
            'consultation_rate', 'consultancy_bio', 'countries_visited', 'specializations',
            'specialty', 'star_rating', 'profile_views', 'messages_count',
            'trip_count_display', 'author_metric', 'is_dashboard_profile', 'linked_user_id', 'star_breakdown'
        ]

    def get_star_breakdown(self, obj):
        return build_star_breakdown(obj)

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['user', 'rating', 'text']

class ItineraryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItineraryItem
        fields = ['day', 'description']

class TripSerializer(serializers.ModelSerializer):
    expert = ExpertSerializer(read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    itinerary = ItineraryItemSerializer(many=True, read_only=True)
    isPreferred = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = [
            'id', 'title', 'classification', 'classifications', 'country', 'countries', 'city',
            'duration', 'expert', 'members', 'rating', 'price', 'budget_range', 'date', 'status',
            'visibility', 'views', 'icon', 'is_ai_generated', 'featured', 'summary', 'reviews', 'itinerary', 'isPreferred'
        ]

    def get_isPreferred(self, obj):
        return obj.status == 'Preferred'


class HomeTripSerializer(serializers.ModelSerializer):
    type_label = serializers.SerializerMethodField()
    month_label = serializers.SerializerMethodField()
    author = serializers.CharField(source='expert.name', default='', read_only=True)

    class Meta:
        model = Trip
        fields = ['id', 'icon', 'country', 'title', 'duration', 'type_label', 'month_label', 'author']

    def get_type_label(self, obj):
        if obj.classifications:
            return obj.classifications[0]
        return obj.classification

    def get_month_label(self, obj):
        return obj.date.strftime('%b %Y')


class HomeExpertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expert
        fields = ['id', 'initials', 'name', 'trip_count_display', 'star_rating', 'specialty']


class MemberDirectorySerializer(serializers.ModelSerializer):
    star_breakdown = serializers.SerializerMethodField()
    chat_target = serializers.SerializerMethodField()

    class Meta:
        model = Expert
        fields = [
            'id', 'initials', 'name', 'countries_visited', 'trip_count_display', 'bio',
            'consultancy_mode', 'consultation_rate', 'consultancy_bio', 'specializations',
            'member_since', 'star_rating', 'star_breakdown', 'chat_target'
        ]

    def get_star_breakdown(self, obj):
        viewer_access = self.context.get('viewerAccess') or {}
        if not viewer_access.get('canViewStarBreakdown'):
            return None
        return build_star_breakdown(obj)

    def get_chat_target(self, obj):
        if not obj.user_id:
            return None

        return {
            'userId': obj.user_id,
            'expertId': obj.id,
            'name': obj.name,
        }


class DirectMessageComposerSerializer(serializers.Serializer):
    body = serializers.CharField(required=True, allow_blank=False)

    def validate_body(self, value):
        body = value.strip()
        if not body:
            raise serializers.ValidationError('Message body is required.')
        return body


class DirectMessageSerializer(serializers.ModelSerializer):
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    direction = serializers.SerializerMethodField()
    senderName = serializers.SerializerMethodField()

    class Meta:
        model = DirectMessage
        fields = ['id', 'body', 'createdAt', 'direction', 'senderName']

    def get_direction(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and obj.sender_id == request.user.id:
            return 'outgoing'
        return 'incoming'

    def get_senderName(self, obj):
        return build_user_display_name(obj.sender)


class MessageThreadSerializer(serializers.Serializer):
    userId = serializers.IntegerField()
    expertId = serializers.IntegerField(allow_null=True)
    memberName = serializers.CharField()
    initials = serializers.CharField()
    latestMessage = serializers.CharField(allow_blank=True)
    updatedAt = serializers.DateTimeField(allow_null=True)
    unreadCount = serializers.IntegerField()


class DashboardTripSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='expert.name', default='', read_only=True)
    isPreferred = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = [
            'id', 'title', 'visibility', 'author', 'countries', 'duration', 'budget_range', 'classifications', 'status', 'isPreferred'
        ]

    def get_isPreferred(self, obj):
        return obj.status == 'Preferred'
