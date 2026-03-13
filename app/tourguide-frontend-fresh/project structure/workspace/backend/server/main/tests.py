import json
from types import SimpleNamespace

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.test import Client
from django.test.utils import override_settings
from rest_framework.test import APIClient
from unittest.mock import patch

from .models import BillingEvent, CheckoutRequest, DirectMessage, Expert, Membership, Trip, UserEngagementEvent


User = get_user_model()


class ApiContractTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.user = User.objects.create_user(
			username='apitest@example.com',
			email='apitest@example.com',
			password='StrongPass123!',
			first_name='Api',
			last_name='Tester',
		)

	def test_home_contract_matches_frontend_expectations(self):
		response = self.client.get('/api/home/')

		self.assertEqual(response.status_code, 200)
		self.assertEqual(set(response.data.keys()), {'stats', 'featuredTrips', 'featuredExperts'})
		self.assertEqual(set(response.data['stats'].keys()), {'documentedTrips', 'registeredMembers', 'countriesCovered'})
		self.assertTrue(response.data['featuredTrips'])
		self.assertEqual(
			set(response.data['featuredTrips'][0].keys()),
			{'id', 'icon', 'country', 'title', 'duration', 'type_label', 'month_label', 'author'}
		)

	def test_member_directory_contract_matches_frontend_expectations(self):
		membership, _ = Membership.objects.get_or_create(user=self.user, defaults={'start_date': self.user.date_joined.date()})
		membership.tier = 'Subscriber'
		membership.save(update_fields=['tier'])
		self.client.force_authenticate(user=self.user)

		response = self.client.get('/api/members/', {
			'search': '',
			'country': 'All countries',
			'classification': 'All classifications',
		})

		self.assertEqual(response.status_code, 200)
		self.assertEqual(set(response.data.keys()), {'count', 'countries', 'classifications', 'viewerAccess', 'results'})
		self.assertEqual(set(response.data['viewerAccess'].keys()), {'tier', 'canViewStarBreakdown'})
		self.assertTrue(response.data['results'])
		self.assertEqual(
			set(response.data['results'][0].keys()),
			{
				'id', 'initials', 'name', 'countries_visited', 'trip_count_display',
				'bio', 'consultancy_mode', 'consultation_rate', 'consultancy_bio', 'specializations',
				'member_since', 'star_rating', 'star_breakdown', 'chat_target'
			}
		)
		self.assertEqual(set(response.data['results'][0]['star_breakdown'].keys()), {'overall', 'display', 'categories', 'explanation'})
		self.assertEqual(len(response.data['results'][0]['star_breakdown']['categories']), 5)

	def test_member_directory_viewer_access_blocks_star_panel_for_public_tier(self):
		response = self.client.get('/api/members/', {
			'search': '',
			'country': 'All countries',
			'classification': 'All classifications',
		})

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data['viewerAccess']['tier'], 'Public')
		self.assertFalse(response.data['viewerAccess']['canViewStarBreakdown'])
		self.assertIsNone(response.data['results'][0]['star_breakdown'])

	def test_member_directory_ignores_spoofed_viewer_tier_for_public_requests(self):
		response = self.client.get('/api/members/', {
			'search': '',
			'country': 'All countries',
			'classification': 'All classifications',
			'viewerTier': 'subscriber',
		})

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data['viewerAccess']['tier'], 'Public')
		self.assertFalse(response.data['viewerAccess']['canViewStarBreakdown'])
		self.assertIsNone(response.data['results'][0]['star_breakdown'])

	def test_leaderboard_contract_matches_frontend_expectations(self):
		response = self.client.get('/api/leaderboard/', {
			'country': 'All Countries',
			'classification': 'All Classifications',
		})

		self.assertEqual(response.status_code, 200)
		self.assertEqual(set(response.data.keys()), {'countries', 'classifications', 'tripLeaderboard', 'authorLeaderboard'})
		self.assertTrue(response.data['tripLeaderboard'])
		self.assertEqual(
			set(response.data['tripLeaderboard'][0].keys()),
			{'id', 'rank', 'title', 'author', 'countries', 'classifications', 'views'}
		)
		self.assertTrue(response.data['authorLeaderboard'])
		self.assertEqual(
			set(response.data['authorLeaderboard'][0].keys()),
			{'rank', 'name', 'contribution', 'metric'}
		)

	def test_dashboard_contract_matches_frontend_expectations(self):
		self.client.force_authenticate(user=self.user)
		CheckoutRequest.objects.create(
			user=self.user,
			plan_key='subscription',
			plan_name='Subscription',
			amount_display='USD 10',
			status='Pending Review',
			reference='CHK-TEST01',
			source='dashboard',
			notes='Dashboard contract verification.',
		)
		response = self.client.get('/api/dashboard/')

		self.assertEqual(response.status_code, 200)
		self.assertEqual(set(response.data.keys()), {'profile', 'stats', 'quickActions', 'pricingOptions', 'checkoutRequests', 'trips', 'aiTrips'})
		self.assertEqual(
			set(response.data['stats'].keys()),
			{'tripsDocumented', 'countriesVisited', 'messages', 'profileViews'}
		)
		self.assertEqual(
			set(response.data['profile']['membership'].keys()),
			{'tier', 'status', 'startedAt', 'expiresAt', 'prioritySlotsTotal', 'prioritySlotsUsed', 'canViewStarBreakdown', 'hasPriorityListing', 'recurringPlanKey', 'recurringStatus'}
		)
		self.assertEqual(response.data['profile']['membership']['tier'], 'Member')
		self.assertEqual(len(response.data['checkoutRequests']), 1)
		self.assertEqual(
			set(response.data['checkoutRequests'][0].keys()),
			{'id', 'reference', 'planKey', 'planName', 'amountDisplay', 'billingMode', 'status', 'source', 'notes', 'createdAt'}
		)
		self.assertTrue(response.data['trips'])
		self.assertEqual(
			set(response.data['trips'][0].keys()),
			{'id', 'title', 'visibility', 'author', 'countries', 'duration', 'budget_range', 'classifications', 'status', 'isPreferred'}
		)

	def test_dashboard_requires_authentication(self):
		response = self.client.get('/api/dashboard/')

		self.assertEqual(response.status_code, 401)
		self.assertEqual(response.data['detail'], 'Authentication required.')

	def test_auth_endpoints_create_session_and_support_logout(self):
		browser = Client()
		signup_response = browser.post('/api/auth/signup/', data=json.dumps({
			'name': 'Session Smoke',
			'email': 'session-smoke@example.com',
			'password': 'StrongPass123!',
			'confirmPassword': 'StrongPass123!',
			'acceptedLegal': True,
		}), content_type='application/json')

		self.assertEqual(signup_response.status_code, 201)
		signup_payload = json.loads(signup_response.content)
		self.assertEqual(set(signup_payload.keys()), {'message', 'user'})
		self.assertEqual(signup_payload['user']['email'], 'session-smoke@example.com')
		self.assertFalse(signup_payload['user']['canManageOperations'])
		self.assertEqual(
			set(signup_payload['user']['membership'].keys()),
			{'tier', 'status', 'startedAt', 'expiresAt', 'prioritySlotsTotal', 'prioritySlotsUsed', 'canViewStarBreakdown', 'hasPriorityListing', 'recurringPlanKey', 'recurringStatus'}
		)
		self.assertEqual(signup_payload['user']['membership']['tier'], 'Member')
		created_user = User.objects.get(email='session-smoke@example.com')
		membership = Membership.objects.get(user=created_user)
		expert = Expert.objects.get(user=created_user)
		self.assertEqual(membership.tier, 'Member')
		self.assertIsNotNone(membership.terms_accepted_at)
		self.assertIsNotNone(membership.disclaimer_accepted_at)
		self.assertEqual(expert.name, 'Session Smoke')
		browser.force_login(created_user)

		session_response = browser.get('/api/auth/session/')
		self.assertEqual(session_response.status_code, 200)
		session_payload = json.loads(session_response.content)
		self.assertTrue(session_payload['authenticated'])
		self.assertFalse(session_payload['user']['canManageOperations'])
		self.assertEqual(session_payload['user']['membership']['status'], 'Active')

		dashboard_response = browser.get('/api/dashboard/')
		self.assertEqual(dashboard_response.status_code, 200)

		logout_response = browser.post('/api/auth/logout/', data='{}', content_type='application/json')
		self.assertEqual(logout_response.status_code, 200)

		post_logout_session = browser.get('/api/auth/session/')
		self.assertEqual(post_logout_session.status_code, 200)
		self.assertFalse(json.loads(post_logout_session.content)['authenticated'])

		locked_dashboard = browser.get('/api/dashboard/')
		self.assertEqual(locked_dashboard.status_code, 401)

	def test_signup_requires_legal_acceptance(self):
		response = self.client.post('/api/auth/signup/', data=json.dumps({
			'name': 'No Consent',
			'email': 'noconsent@example.com',
			'password': 'StrongPass123!',
			'confirmPassword': 'StrongPass123!',
			'acceptedLegal': False,
		}), content_type='application/json')

		self.assertEqual(response.status_code, 400)
		payload = json.loads(response.content)
		self.assertIn('acceptedLegal', payload)

	def test_login_accepts_email_when_username_differs(self):
		legacy_user = User.objects.create_user(
			username='legacy-admin-name',
			email='legacy-admin@example.com',
			password='StrongPass123!',
		)

		response = self.client.post('/api/auth/login/', {
			'email': 'legacy-admin@example.com',
			'password': 'StrongPass123!',
		}, format='json')

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data['user']['email'], 'legacy-admin@example.com')

	def test_checkout_request_persists_backend_record(self):
		self.client.force_authenticate(user=self.user)
		response = self.client.post('/api/checkout/request/', {
			'planKey': 'bundle',
			'source': 'pricing-page',
			'notes': 'Checkout test request.',
		}, format='json')

		self.assertEqual(response.status_code, 201)
		self.assertEqual(set(response.data.keys()), {'checkoutRequest', 'message', 'nextStep'})
		self.assertEqual(set(response.data['checkoutRequest'].keys()), {'id', 'reference', 'planKey', 'planName', 'amountDisplay', 'billingMode', 'status', 'source', 'notes', 'createdAt'})
		self.assertEqual(response.data['checkoutRequest']['planKey'], 'bundle')
		self.assertEqual(response.data['checkoutRequest']['billingMode'], 'payment')
		self.assertEqual(response.data['checkoutRequest']['status'], 'Pending Review')

		checkout_request = CheckoutRequest.objects.get(id=response.data['checkoutRequest']['id'])
		self.assertEqual(checkout_request.user, self.user)
		self.assertEqual(checkout_request.plan_key, 'bundle')
		self.assertEqual(checkout_request.source, 'pricing-page')

	def test_consultancy_profile_update_creates_and_updates_user_expert_profile(self):
		self.client.force_authenticate(user=self.user)

		response = self.client.post('/api/profile/consultancy/', {
			'consultancy_mode': 'Paid only',
			'consultation_rate': 'USD 90/session',
			'consultancy_bio': 'Focused on itinerary planning and tourism operations advisory.',
		}, format='json')

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data['message'], 'Consultancy profile updated successfully.')
		self.assertEqual(response.data['profile']['consultancy_mode'], 'Paid only')
		self.assertEqual(response.data['profile']['consultation_rate'], 'USD 90/session')
		self.assertEqual(response.data['profile']['consultancy_bio'], 'Focused on itinerary planning and tourism operations advisory.')

		expert = Expert.objects.get(user=self.user)
		self.assertEqual(expert.consultancy_mode, 'Paid only')
		self.assertEqual(expert.consultation_rate, 'USD 90/session')
		self.assertEqual(expert.consultancy_bio, 'Focused on itinerary planning and tourism operations advisory.')

	def test_checkout_request_requires_authentication(self):
		response = self.client.post('/api/checkout/request/', {
			'planKey': 'subscription',
			'source': 'pricing-page',
		}, format='json')

		self.assertEqual(response.status_code, 401)
		self.assertEqual(response.data['detail'], 'Authentication required.')

	@override_settings(STRIPE_SECRET_KEY='sk_test_123', APP_BASE_URL='http://localhost:3000')
	@patch('main.api_views.stripe.checkout.Session.create')
	def test_stripe_checkout_session_persists_request_and_returns_redirect_url(self, mock_create):
		mock_create.return_value = SimpleNamespace(id='cs_test_123', url='https://checkout.stripe.test/session/cs_test_123')
		self.client.force_authenticate(user=self.user)

		response = self.client.post('/api/checkout/stripe/session/', {
			'planKey': 'subscription',
			'source': 'pricing-page',
			'notes': 'Stripe checkout test.',
		}, format='json')

		self.assertEqual(response.status_code, 201)
		self.assertEqual(set(response.data.keys()), {'checkoutRequest', 'checkoutUrl', 'message'})
		self.assertEqual(response.data['checkoutUrl'], 'https://checkout.stripe.test/session/cs_test_123')
		checkout_request = CheckoutRequest.objects.get(id=response.data['checkoutRequest']['id'])
		self.assertEqual(checkout_request.provider, 'stripe')
		self.assertEqual(checkout_request.billing_mode, 'subscription')
		self.assertEqual(checkout_request.provider_session_id, 'cs_test_123')
		self.assertEqual(checkout_request.status, 'Awaiting Payment')

	def test_stripe_checkout_session_requires_authentication(self):
		response = self.client.post('/api/checkout/stripe/session/', {
			'planKey': 'subscription',
			'source': 'pricing-page',
		}, format='json')

		self.assertEqual(response.status_code, 401)
		self.assertEqual(response.data['detail'], 'Authentication required.')

	@override_settings(STRIPE_SECRET_KEY='sk_test_123', STRIPE_WEBHOOK_SECRET='whsec_test_123')
	@patch('main.api_views.stripe.Webhook.construct_event')
	def test_stripe_webhook_completes_payment_and_activates_membership(self, mock_construct_event):
		checkout_request = CheckoutRequest.objects.create(
			user=self.user,
			plan_key='subscription',
			plan_name='Premium Membership',
			amount_display='EUR 35/year',
			reference='TR-STRIPE01',
			provider='stripe',
			provider_session_id='cs_test_123',
			provider_payment_status='unpaid',
			status='Awaiting Payment',
			source='pricing-page',
		)
		mock_construct_event.return_value = {
			'type': 'checkout.session.completed',
			'data': {
				'object': {
					'id': 'cs_test_123',
					'customer': 'cus_test_123',
					'subscription': 'sub_test_123',
					'payment_status': 'paid',
					'metadata': {
						'checkout_request_id': str(checkout_request.id),
					},
				},
			},
		}

		response = self.client.post(
			'/api/checkout/stripe/webhook/',
			data=json.dumps({'type': 'checkout.session.completed'}),
			content_type='application/json',
			HTTP_STRIPE_SIGNATURE='sig_test_123',
		)

		self.assertEqual(response.status_code, 200)
		checkout_request.refresh_from_db()
		membership = Membership.objects.get(user=self.user)
		self.assertEqual(checkout_request.status, 'Paid')
		self.assertEqual(checkout_request.provider_payment_status, 'paid')
		self.assertEqual(checkout_request.provider_subscription_id, 'sub_test_123')
		self.assertEqual(membership.tier, 'Subscriber')
		self.assertEqual(membership.status, 'Active')
		self.assertEqual(membership.recurring_plan_key, 'subscription')
		self.assertEqual(membership.stripe_subscription_id, 'sub_test_123')
		self.assertEqual(membership.stripe_customer_id, 'cus_test_123')

	@override_settings(STRIPE_SECRET_KEY='sk_test_123', STRIPE_WEBHOOK_SECRET='whsec_test_123')
	@patch('main.api_views.stripe.Webhook.construct_event')
	def test_subscription_deleted_webhook_expires_recurring_membership(self, mock_construct_event):
		membership, _ = Membership.objects.get_or_create(user=self.user, defaults={'start_date': self.user.date_joined.date()})
		membership.tier = 'Subscriber'
		membership.status = 'Active'
		membership.billing_provider = 'stripe'
		membership.stripe_customer_id = 'cus_test_123'
		membership.stripe_subscription_id = 'sub_test_123'
		membership.recurring_plan_key = 'subscription'
		membership.recurring_status = 'active'
		membership.save(update_fields=['tier', 'status', 'billing_provider', 'stripe_customer_id', 'stripe_subscription_id', 'recurring_plan_key', 'recurring_status'])

		mock_construct_event.return_value = {
			'type': 'customer.subscription.deleted',
			'data': {
				'object': {
					'id': 'sub_test_123',
					'customer': 'cus_test_123',
					'status': 'canceled',
				},
			},
		}

		response = self.client.post(
			'/api/checkout/stripe/webhook/',
			data=json.dumps({'type': 'customer.subscription.deleted'}),
			content_type='application/json',
			HTTP_STRIPE_SIGNATURE='sig_test_123',
		)

		self.assertEqual(response.status_code, 200)
		membership.refresh_from_db()
		self.assertEqual(membership.status, 'Expired')
		self.assertEqual(membership.tier, 'Member')
		self.assertEqual(membership.recurring_plan_key, '')
		self.assertEqual(membership.stripe_subscription_id, '')

	def test_checkout_request_status_returns_request_and_membership(self):
		self.client.force_authenticate(user=self.user)
		checkout_request = CheckoutRequest.objects.create(
			user=self.user,
			plan_key='bundle',
			plan_name='Subscribe + Boost',
			amount_display='EUR 70/year',
			reference='TR-STATUS01',
			provider='stripe',
			status='Awaiting Payment',
			source='pricing-page',
		)

		response = self.client.get(f'/api/checkout/request/{checkout_request.reference}/')

		self.assertEqual(response.status_code, 200)
		self.assertEqual(set(response.data.keys()), {'checkoutRequest', 'membership'})
		self.assertEqual(response.data['checkoutRequest']['reference'], 'TR-STATUS01')
		self.assertEqual(response.data['membership']['tier'], 'Member')

	def test_checkout_request_status_requires_matching_user(self):
		other_user = User.objects.create_user(
			username='other@example.com',
			email='other@example.com',
			password='StrongPass123!',
		)
		checkout_request = CheckoutRequest.objects.create(
			user=other_user,
			plan_key='subscription',
			plan_name='Premium Membership',
			amount_display='EUR 35/year',
			reference='TR-HIDDEN01',
		)
		self.client.force_authenticate(user=self.user)

		response = self.client.get(f'/api/checkout/request/{checkout_request.reference}/')

		self.assertEqual(response.status_code, 404)

	@override_settings(STRIPE_SECRET_KEY='sk_test_123', APP_BASE_URL='http://localhost:3000')
	@patch('main.api_views.stripe.billing_portal.Session.create')
	def test_member_can_open_billing_portal_for_recurring_subscription(self, mock_create):
		mock_create.return_value = SimpleNamespace(url='https://billing.stripe.test/session/portal_123')
		membership, _ = Membership.objects.get_or_create(user=self.user, defaults={'start_date': self.user.date_joined.date()})
		membership.tier = 'Subscriber'
		membership.stripe_customer_id = 'cus_test_123'
		membership.recurring_plan_key = 'subscription'
		membership.recurring_status = 'active'
		membership.save(update_fields=['tier', 'stripe_customer_id', 'recurring_plan_key', 'recurring_status'])
		self.client.force_authenticate(user=self.user)

		response = self.client.post('/api/membership/recurring/portal/', {}, format='json')

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data['portalUrl'], 'https://billing.stripe.test/session/portal_123')
		self.assertTrue(BillingEvent.objects.filter(event_type='billing.portal.opened', membership=membership).exists())

	@override_settings(STRIPE_SECRET_KEY='sk_test_123')
	@patch('main.api_views.stripe.Subscription.modify')
	def test_member_can_schedule_recurring_cancellation(self, mock_modify):
		mock_modify.return_value = SimpleNamespace(current_period_end=1794096000)
		membership, _ = Membership.objects.get_or_create(user=self.user, defaults={'start_date': self.user.date_joined.date()})
		membership.tier = 'Subscriber'
		membership.stripe_subscription_id = 'sub_test_123'
		membership.stripe_customer_id = 'cus_test_123'
		membership.recurring_plan_key = 'subscription'
		membership.recurring_status = 'active'
		membership.save(update_fields=['tier', 'stripe_subscription_id', 'stripe_customer_id', 'recurring_plan_key', 'recurring_status'])
		self.client.force_authenticate(user=self.user)

		response = self.client.post('/api/membership/recurring/cancel/', {}, format='json')

		self.assertEqual(response.status_code, 200)
		membership.refresh_from_db()
		self.assertEqual(membership.recurring_status, 'cancel_at_period_end')
		self.assertEqual(response.data['membership']['recurringStatus'], 'cancel_at_period_end')
		self.assertTrue(BillingEvent.objects.filter(event_type='customer.subscription.cancel_requested', membership=membership).exists())

	def test_operations_overview_requires_admin_access(self):
		self.client.force_authenticate(user=self.user)

		response = self.client.get('/api/operations/overview/')

		self.assertEqual(response.status_code, 403)
		self.assertEqual(response.data['detail'], 'Operations access required.')

	def test_superuser_session_is_marked_as_operations_admin(self):
		admin_user = User.objects.create_superuser(
			username='owner@example.com',
			email='owner@example.com',
			password='StrongPass123!',
		)
		browser = Client()
		browser.force_login(admin_user)

		response = browser.get('/api/auth/session/')

		self.assertEqual(response.status_code, 200)
		payload = json.loads(response.content)
		self.assertTrue(payload['authenticated'])
		self.assertTrue(payload['user']['canManageOperations'])
		self.assertEqual(payload['user']['membership']['tier'], 'Admin')

	def test_operations_overview_allows_superuser_without_preexisting_membership(self):
		admin_user = User.objects.create_superuser(
			username='root@example.com',
			email='root@example.com',
			password='StrongPass123!',
		)
		self.client.force_authenticate(user=admin_user)

		response = self.client.get('/api/operations/overview/')

		self.assertEqual(response.status_code, 200)
		membership = Membership.objects.get(user=admin_user)
		self.assertEqual(membership.tier, 'Admin')

	def test_operations_overview_returns_checkout_and_membership_data_for_admin(self):
		membership, _ = Membership.objects.get_or_create(user=self.user, defaults={'start_date': self.user.date_joined.date()})
		membership.tier = 'Admin'
		membership.recurring_plan_key = 'subscription'
		membership.recurring_status = 'past_due'
		membership.save(update_fields=['tier', 'recurring_plan_key', 'recurring_status'])
		checkout_request = CheckoutRequest.objects.create(
			user=self.user,
			plan_key='priority',
			plan_name='Priority Listing',
			amount_display='EUR 35/slot/year',
			reference='TR-OPS001',
			provider='stripe',
			provider_payment_status='paid',
			status='Paid',
			source='pricing-page',
		)
		BillingEvent.objects.create(
			membership=membership,
			checkout_request=checkout_request,
			provider='stripe',
			event_type='customer.subscription.updated',
			event_status='past_due',
			reference='sub_ops_123',
			summary='Recurring payment needs attention.',
		)
		self.client.force_authenticate(user=self.user)
		UserEngagementEvent.objects.create(user=self.user, session_key='ops-admin', path='/dashboard', event_type='page_view')

		response = self.client.get('/api/operations/overview/')

		self.assertEqual(response.status_code, 200)
		self.assertEqual(set(response.data.keys()), {'stats', 'checkoutRequests', 'memberships', 'billingEvents', 'engagement'})
		self.assertTrue(response.data['checkoutRequests'])
		self.assertEqual(response.data['checkoutRequests'][0]['reference'], 'TR-OPS001')
		self.assertEqual(response.data['checkoutRequests'][0]['membershipTier'], 'Admin')
		self.assertEqual(response.data['checkoutRequests'][0]['billingMode'], 'payment')
		self.assertEqual(response.data['stats']['failedRenewals'], 1)
		self.assertEqual(response.data['stats']['activeUsersNow'], 1)
		self.assertTrue(response.data['billingEvents'])
		self.assertEqual(response.data['billingEvents'][0]['event_status'], 'past_due')
		self.assertTrue(response.data['engagement']['recentActivity'])
		self.assertEqual(response.data['engagement']['recentActivity'][0]['path'], '/dashboard')

	def test_engagement_tracking_records_page_view_for_authenticated_user(self):
		self.client.force_authenticate(user=self.user)

		response = self.client.post('/api/engagement/track/', {
			'path': '/members',
			'eventType': 'page_view',
			'metadata': {'source': 'app-shell'},
		}, format='json')

		self.assertEqual(response.status_code, 201)
		event = UserEngagementEvent.objects.get()
		self.assertEqual(event.user, self.user)
		self.assertEqual(event.path, '/members')
		self.assertEqual(event.event_type, 'page_view')
		self.assertEqual(event.metadata['source'], 'app-shell')

	def test_engagement_tracking_deduplicates_recent_heartbeat(self):
		self.client.force_authenticate(user=self.user)

		first = self.client.post('/api/engagement/track/', {
			'path': '/operations',
			'eventType': 'heartbeat',
		}, format='json')
		second = self.client.post('/api/engagement/track/', {
			'path': '/operations',
			'eventType': 'heartbeat',
		}, format='json')

		self.assertEqual(first.status_code, 201)
		self.assertEqual(second.status_code, 200)
		self.assertEqual(UserEngagementEvent.objects.count(), 1)

	def test_operations_can_manually_activate_checkout(self):
		membership, _ = Membership.objects.get_or_create(user=self.user, defaults={'start_date': self.user.date_joined.date()})
		membership.tier = 'Admin'
		membership.save(update_fields=['tier'])
		other_user = User.objects.create_user(
			username='member@example.com',
			email='member@example.com',
			password='StrongPass123!',
		)
		checkout_request = CheckoutRequest.objects.create(
			user=other_user,
			plan_key='bundle',
			plan_name='Subscribe + Boost',
			amount_display='EUR 70/year',
			reference='TR-MANUAL1',
			provider='manual',
			status='Pending Review',
			source='operations',
		)
		self.client.force_authenticate(user=self.user)

		response = self.client.post(f'/api/operations/checkout/{checkout_request.reference}/activate/', {}, format='json')

		self.assertEqual(response.status_code, 200)
		checkout_request.refresh_from_db()
		member_membership = Membership.objects.get(user=other_user)
		self.assertEqual(checkout_request.status, 'Manually Activated')
		self.assertEqual(member_membership.tier, 'Bundle')
		self.assertEqual(member_membership.status, 'Active')

	def test_document_trip_persists_manual_trip_and_dashboard_archive(self):
		self.client.force_authenticate(user=self.user)
		response = self.client.post('/api/trips/document/', {
			'title': 'Cape Town Coastal Food & Culture Week',
			'destinationCountry': 'South Africa',
			'destinationCity': 'Cape Town',
			'additionalCountries': [],
			'travelStart': '2026-02-10',
			'travelEnd': '2026-02-16',
			'classifications': ['Cultural', 'Food'],
			'summary': 'A week-long record of neighborhoods, food markets, coastal routes, and practical transport notes.',
			'budgetRange': 'USD 1,000 – 1,800',
			'estimatedTotalPrice': '1450.00',
			'travelerCount': 2,
			'visibility': 'Public',
			'itinerary': [
				{'day': 'Day 1', 'description': 'Arrival, check-in, and an evening walk through the V&A Waterfront.'},
				{'day': 'Day 2', 'description': 'Bo-Kaap food stops, city center architecture, and local market research.'},
			],
		}, format='json')

		self.assertEqual(response.status_code, 201)
		self.assertEqual(set(response.data.keys()), {'createdTrip', 'detailPath', 'message'})
		created_trip = Trip.objects.get(id=response.data['createdTrip']['id'])
		self.assertFalse(created_trip.is_ai_generated)
		self.assertEqual(created_trip.visibility, 'Public')
		self.assertEqual(created_trip.status, 'Published')
		self.assertEqual(created_trip.country, 'South Africa')
		self.assertEqual(created_trip.city, 'Cape Town')
		self.assertEqual(created_trip.members, 2)
		self.assertEqual(created_trip.itinerary.count(), 2)

		self.client.force_authenticate(user=self.user)
		dashboard_response = self.client.get('/api/dashboard/')
		self.assertEqual(dashboard_response.status_code, 200)
		self.assertTrue(any(item['id'] == created_trip.id for item in dashboard_response.data['trips']))

	def test_document_trip_requires_authentication(self):
		response = self.client.post('/api/trips/document/', {
			'title': 'Protected flow test',
			'destinationCountry': 'South Africa',
			'destinationCity': 'Cape Town',
			'additionalCountries': [],
			'travelStart': '2026-02-10',
			'travelEnd': '2026-02-16',
			'classifications': ['Cultural'],
			'summary': 'Unauthorized request should fail.',
			'budgetRange': 'USD 1,000 - 1,800',
			'estimatedTotalPrice': '1450.00',
			'travelerCount': 2,
			'visibility': 'Public',
			'itinerary': [
				{'day': 'Day 1', 'description': 'Unauthorized request.'},
			],
		}, format='json')

		self.assertEqual(response.status_code, 401)
		self.assertEqual(response.data['detail'], 'Authentication required.')

	def test_trip_detail_contract_matches_frontend_expectations(self):
		trip = Trip.objects.order_by('id').first()

		response = self.client.get(f'/api/trips/{trip.id}/')

		self.assertEqual(response.status_code, 200)
		self.assertEqual(
			set(response.data.keys()),
			{
				'id', 'title', 'classification', 'classifications', 'country', 'countries', 'city',
				'duration', 'expert', 'members', 'rating', 'price', 'budget_range', 'date', 'status',
				'visibility', 'views', 'icon', 'is_ai_generated', 'featured', 'summary', 'reviews', 'itinerary', 'isPreferred'
			}
		)
		self.assertEqual(set(response.data['expert'].keys()), {
			'id', 'name', 'initials', 'profile', 'bio', 'member_since', 'consultancy_mode',
			'consultation_rate', 'consultancy_bio', 'countries_visited', 'specializations',
			'specialty', 'star_rating', 'profile_views', 'messages_count',
			'trip_count_display', 'author_metric', 'is_dashboard_profile', 'linked_user_id', 'star_breakdown'
		})
		self.assertTrue(response.data['itinerary'])
		self.assertTrue(response.data['reviews'])
		self.assertEqual(set(response.data['itinerary'][0].keys()), {'day', 'description'})
		self.assertEqual(set(response.data['reviews'][0].keys()), {'user', 'rating', 'text'})

	def test_ai_trip_builder_persists_trip_and_dashboard_archive(self):
		self.client.force_authenticate(user=self.user)
		response = self.client.post('/api/ai-trip-builder/preview/', {
			'departureCountry': 'Angola',
			'destinationCountry': 'Japan',
			'optionCount': 1,
			'travelStart': '2026-04-10',
			'travelEnd': '2026-04-15',
			'budget': 'EUR 2500',
			'travelStyle': 'Cultural + food',
			'transportPreference': 'Flight + rail',
			'accommodationLevel': 'Mid-range boutique',
			'tripGoals': 'Focus on temples, food neighborhoods, and realistic pacing.',
		}, format='json')

		self.assertEqual(response.status_code, 201)
		self.assertEqual(set(response.data.keys()), {'summary', 'itinerary', 'savedTrip', 'tripOptions', 'comparison'})
		self.assertEqual(set(response.data['savedTrip'].keys()), {
			'id', 'title', 'visibility', 'author', 'countries', 'duration', 'budget_range', 'classifications', 'status', 'isPreferred'
		})
		self.assertEqual(len(response.data['tripOptions']), 1)
		self.assertEqual(response.data['tripOptions'][0]['compare']['scores']['overall'], 7.3)

		saved_trip = Trip.objects.get(id=response.data['savedTrip']['id'])
		self.assertTrue(saved_trip.is_ai_generated)
		self.assertEqual(saved_trip.visibility, 'Private')
		self.assertEqual(saved_trip.country, 'Japan')
		self.assertEqual(saved_trip.itinerary.count(), 3)

		self.client.force_authenticate(user=self.user)
		dashboard_response = self.client.get('/api/dashboard/')
		self.assertEqual(dashboard_response.status_code, 200)
		self.assertTrue(any(item['id'] == saved_trip.id for item in dashboard_response.data['aiTrips']))

	def test_ai_trip_builder_requires_authentication(self):
		response = self.client.post('/api/ai-trip-builder/preview/', {
			'departureCountry': 'Angola',
			'destinationCountry': 'Japan',
			'optionCount': 1,
			'travelStart': '2026-04-10',
			'travelEnd': '2026-04-15',
			'budget': 'EUR 2500',
			'travelStyle': 'Cultural + food',
			'transportPreference': 'Flight + rail',
			'accommodationLevel': 'Mid-range boutique',
			'tripGoals': 'Protected route test.',
		}, format='json')

		self.assertEqual(response.status_code, 401)
		self.assertEqual(response.data['detail'], 'Authentication required.')

	def test_member_directory_includes_chat_target_when_expert_is_linked(self):
		recipient = User.objects.create_user(
			username='recipient@example.com',
			email='recipient@example.com',
			password='StrongPass123!',
			first_name='Recipient',
			last_name='Member',
		)
		expert = Expert.objects.order_by('id').first()
		expert.user = recipient
		expert.save(update_fields=['user'])

		response = self.client.get('/api/members/', {
			'search': expert.name,
			'country': 'All countries',
			'classification': 'All classifications',
		})

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data['results'][0]['chat_target']['userId'], recipient.id)
		self.assertEqual(response.data['results'][0]['chat_target']['expertId'], expert.id)

	def test_message_thread_api_lists_and_sends_messages(self):
		recipient = User.objects.create_user(
			username='helena@example.com',
			email='helena@example.com',
			password='StrongPass123!',
			first_name='Helena',
			last_name='Vasquez',
		)
		expert = Expert.objects.order_by('id').first()
		expert.user = recipient
		expert.save(update_fields=['user'])

		DirectMessage.objects.create(sender=recipient, recipient=self.user, body='Hello from Helena.')
		self.client.force_authenticate(user=self.user)

		list_response = self.client.get('/api/messages/threads/')

		self.assertEqual(list_response.status_code, 200)
		self.assertEqual(set(list_response.data.keys()), {'threads'})
		self.assertTrue(list_response.data['threads'])
		thread = list_response.data['threads'][0]
		self.assertEqual(set(thread.keys()), {'userId', 'expertId', 'memberName', 'initials', 'latestMessage', 'updatedAt', 'unreadCount'})
		self.assertEqual(thread['userId'], recipient.id)
		self.assertEqual(thread['expertId'], expert.id)
		self.assertEqual(thread['unreadCount'], 1)

		detail_response = self.client.get(f'/api/messages/thread/{recipient.id}/')

		self.assertEqual(detail_response.status_code, 200)
		self.assertEqual(set(detail_response.data.keys()), {'thread', 'messages'})
		self.assertEqual(detail_response.data['thread']['userId'], recipient.id)
		self.assertEqual(len(detail_response.data['messages']), 1)
		self.assertEqual(set(detail_response.data['messages'][0].keys()), {'id', 'body', 'createdAt', 'direction', 'senderName'})
		self.assertEqual(detail_response.data['messages'][0]['direction'], 'incoming')

		send_response = self.client.post(f'/api/messages/thread/{recipient.id}/', {
			'body': 'Thanks, I would like to learn more about your Peru routes.',
		}, format='json')

		self.assertEqual(send_response.status_code, 201)
		self.assertEqual(set(send_response.data.keys()), {'message', 'thread'})
		self.assertEqual(send_response.data['message']['direction'], 'outgoing')
		expert.refresh_from_db()
		self.assertEqual(expert.messages_count, 1)

	def test_message_summary_api_returns_unread_and_thread_totals(self):
		recipient = User.objects.create_user(
			username='summary-recipient@example.com',
			email='summary-recipient@example.com',
			password='StrongPass123!',
		)
		other = User.objects.create_user(
			username='summary-other@example.com',
			email='summary-other@example.com',
			password='StrongPass123!',
		)
		DirectMessage.objects.create(sender=recipient, recipient=self.user, body='Unread one')
		DirectMessage.objects.create(sender=recipient, recipient=self.user, body='Unread two')
		DirectMessage.objects.create(sender=self.user, recipient=recipient, body='Outgoing')
		DirectMessage.objects.create(sender=other, recipient=self.user, body='Another thread')

		self.client.force_authenticate(user=self.user)
		response = self.client.get('/api/messages/summary/')

		self.assertEqual(response.status_code, 200)
		self.assertEqual(set(response.data.keys()), {'unreadMessages', 'totalThreads', 'totalMessages'})
		self.assertEqual(response.data['unreadMessages'], 3)
		self.assertEqual(response.data['totalThreads'], 2)
		self.assertEqual(response.data['totalMessages'], 4)

	def test_ai_trip_builder_accepts_blank_dates(self):
		self.client.force_authenticate(user=self.user)
		response = self.client.post('/api/ai-trip-builder/preview/', {
			'departureCountry': 'Angola',
			'destinationCountry': 'Japan',
			'optionCount': 1,
			'travelStart': '',
			'travelEnd': '',
			'budget': 'EUR 2500',
			'travelStyle': 'Cultural + food',
			'transportPreference': 'Flight + rail',
			'accommodationLevel': 'Mid-range boutique',
			'tripGoals': 'Flexible timing test.',
		}, format='json')

		self.assertEqual(response.status_code, 201)
		saved_trip = Trip.objects.get(id=response.data['savedTrip']['id'])
		self.assertEqual(saved_trip.duration, 'Flexible duration')
		self.assertIn('Flexible start', response.data['summary']['dates'])

	@patch('main.api_views.generate_trip_plan')
	def test_ai_trip_builder_uses_generated_plan_output(self, mock_generate_trip_plan):
		mock_generate_trip_plan.return_value = {
			'title': 'OpenAI Kyoto Food Blueprint',
			'summary_text': 'AI-crafted Kyoto food and culture route.',
			'classifications': ['Food', 'Cultural'],
			'itinerary': [
				{'day': 'Day 1', 'title': 'Arrival tasting route', 'description': 'Check in and start with a guided market crawl.'},
				{'day': 'Day 2', 'title': 'Temple district circuit', 'description': 'Pair shrine visits with neighborhood dining stops.'},
				{'day': 'Day 3', 'title': 'Flexible local discoveries', 'description': 'Use the final day for chef counters and low-key wandering.'},
			],
		}

		self.client.force_authenticate(user=self.user)
		response = self.client.post('/api/ai-trip-builder/preview/', {
			'departureCountry': 'Angola',
			'destinationCountry': 'Japan',
			'optionCount': 1,
			'travelStart': '2026-04-10',
			'travelEnd': '2026-04-15',
			'budget': 'EUR 2500',
			'travelStyle': 'Cultural + food',
			'transportPreference': 'Flight + rail',
			'accommodationLevel': 'Mid-range boutique',
			'tripGoals': 'Focus on temples and food neighborhoods.',
		}, format='json')

		self.assertEqual(response.status_code, 201)
		saved_trip = Trip.objects.get(id=response.data['savedTrip']['id'])
		self.assertEqual(saved_trip.title, 'OpenAI Kyoto Food Blueprint')
		self.assertEqual(saved_trip.classification, 'Food')
		self.assertEqual(saved_trip.summary, 'AI-crafted Kyoto food and culture route.')
		self.assertEqual(saved_trip.itinerary.first().description, 'Check in and start with a guided market crawl.')

	def test_ai_trip_builder_can_create_multiple_comparable_trip_options(self):
		self.client.force_authenticate(user=self.user)
		response = self.client.post('/api/ai-trip-builder/preview/', {
			'departureCountry': 'Angola',
			'destinationCountry': 'Japan',
			'optionCount': 3,
			'travelStart': '2026-04-10',
			'travelEnd': '2026-04-15',
			'budget': 'EUR 2500',
			'travelStyle': 'Cultural + food',
			'transportPreference': 'Flight + rail',
			'accommodationLevel': 'Mid-range boutique',
			'tripGoals': 'Compare pace, value, and flexibility.',
		}, format='json')

		self.assertEqual(response.status_code, 201)
		self.assertEqual(response.data['comparison']['optionCount'], 3)
		self.assertEqual(len(response.data['tripOptions']), 3)
		self.assertEqual(Trip.objects.filter(is_ai_generated=True, country='Japan').count(), 3)
		self.assertTrue(all(option['savedTrip']['id'] for option in response.data['tripOptions']))
		self.assertTrue(all(option['compare']['focus'] for option in response.data['tripOptions']))
		self.assertTrue(all(option['compare']['scores']['pace'] >= 1 for option in response.data['tripOptions']))

	def test_ai_trip_builder_can_mark_a_preferred_winner(self):
		self.client.force_authenticate(user=self.user)
		preview_response = self.client.post('/api/ai-trip-builder/preview/', {
			'departureCountry': 'Angola',
			'destinationCountry': 'Japan',
			'optionCount': 3,
			'travelStart': '2026-04-10',
			'travelEnd': '2026-04-15',
			'budget': 'EUR 2500',
			'travelStyle': 'Cultural + food',
			'transportPreference': 'Flight + rail',
			'accommodationLevel': 'Mid-range boutique',
			'tripGoals': 'Compare pace, value, and flexibility.',
		}, format='json')

		winner_id = preview_response.data['tripOptions'][1]['savedTrip']['id']
		select_response = self.client.post('/api/ai-trip-builder/select/', {'tripId': winner_id}, format='json')

		self.assertEqual(select_response.status_code, 200)
		self.assertEqual(select_response.data['selectedTrip']['id'], winner_id)
		self.assertTrue(select_response.data['selectedTrip']['isPreferred'])

		preferred_trip = Trip.objects.get(id=winner_id)
		self.assertEqual(preferred_trip.status, 'Preferred')

	def test_ai_trip_builder_select_requires_authentication(self):
		response = self.client.post('/api/ai-trip-builder/select/', {'tripId': 1}, format='json')

		self.assertEqual(response.status_code, 401)
		self.assertEqual(response.data['detail'], 'Authentication required.')
		self.assertEqual(Trip.objects.filter(is_ai_generated=True, status='Preferred').count(), 0)
