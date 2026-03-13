from django.conf import settings
from django.db import models

class Expert(models.Model):
	name = models.CharField(max_length=80)
	user = models.OneToOneField(settings.AUTH_USER_MODEL, related_name='expert_profile', on_delete=models.SET_NULL, null=True, blank=True)
	initials = models.CharField(max_length=10, blank=True)
	profile = models.URLField(blank=True)
	bio = models.TextField(blank=True)
	member_since = models.DateField(null=True, blank=True)
	consultancy_mode = models.CharField(max_length=40, blank=True)
	consultation_rate = models.CharField(max_length=40, blank=True)
	consultancy_bio = models.TextField(blank=True)
	countries_visited = models.JSONField(default=list, blank=True)
	specializations = models.JSONField(default=list, blank=True)
	specialty = models.CharField(max_length=120, blank=True)
	star_rating = models.PositiveSmallIntegerField(default=0)
	profile_views = models.PositiveIntegerField(default=0)
	messages_count = models.PositiveIntegerField(default=0)
	trip_count_display = models.PositiveIntegerField(default=0)
	author_metric = models.CharField(max_length=120, blank=True)
	is_dashboard_profile = models.BooleanField(default=False)

	def __str__(self):
		return self.name

class Review(models.Model):
	user = models.CharField(max_length=80)
	rating = models.IntegerField()
	text = models.TextField()
	trip = models.ForeignKey('Trip', related_name='reviews', on_delete=models.CASCADE)

class ItineraryItem(models.Model):
	day = models.CharField(max_length=40)
	description = models.TextField()
	trip = models.ForeignKey('Trip', related_name='itinerary', on_delete=models.CASCADE)

class Trip(models.Model):
	title = models.CharField(max_length=120)
	classification = models.CharField(max_length=80)
	classifications = models.JSONField(default=list, blank=True)
	country = models.CharField(max_length=80)
	countries = models.JSONField(default=list, blank=True)
	city = models.CharField(max_length=80)
	duration = models.CharField(max_length=40)
	expert = models.ForeignKey(Expert, related_name='trips', on_delete=models.SET_NULL, null=True)
	members = models.IntegerField()
	rating = models.FloatField()
	price = models.DecimalField(max_digits=8, decimal_places=2)
	budget_range = models.CharField(max_length=80, blank=True)
	date = models.DateField()
	status = models.CharField(max_length=40)
	visibility = models.CharField(max_length=40, default='Member')
	views = models.PositiveIntegerField(default=0)
	icon = models.CharField(max_length=10, blank=True)
	is_ai_generated = models.BooleanField(default=False)
	featured = models.BooleanField(default=False)
	summary = models.TextField(blank=True)

	def __str__(self):
		return self.title


class Membership(models.Model):
	TIER_MEMBER = 'Member'
	TIER_SUBSCRIBER = 'Subscriber'
	TIER_PRIORITY = 'Priority'
	TIER_BUNDLE = 'Bundle'
	TIER_ADMIN = 'Admin'

	STATUS_ACTIVE = 'Active'
	STATUS_PENDING = 'Pending'
	STATUS_EXPIRED = 'Expired'
	STATUS_SUSPENDED = 'Suspended'

	TIER_CHOICES = [
		(TIER_MEMBER, 'Member'),
		(TIER_SUBSCRIBER, 'Subscriber'),
		(TIER_PRIORITY, 'Priority'),
		(TIER_BUNDLE, 'Bundle'),
		(TIER_ADMIN, 'Admin'),
	]

	STATUS_CHOICES = [
		(STATUS_ACTIVE, 'Active'),
		(STATUS_PENDING, 'Pending'),
		(STATUS_EXPIRED, 'Expired'),
		(STATUS_SUSPENDED, 'Suspended'),
	]

	user = models.OneToOneField(settings.AUTH_USER_MODEL, related_name='membership', on_delete=models.CASCADE)
	tier = models.CharField(max_length=40, choices=TIER_CHOICES, default=TIER_MEMBER)
	status = models.CharField(max_length=40, choices=STATUS_CHOICES, default=STATUS_ACTIVE)
	start_date = models.DateField(null=True, blank=True)
	end_date = models.DateField(null=True, blank=True)
	priority_slots_total = models.PositiveIntegerField(default=0)
	priority_slots_used = models.PositiveIntegerField(default=0)
	billing_provider = models.CharField(max_length=40, blank=True)
	stripe_customer_id = models.CharField(max_length=120, blank=True)
	stripe_subscription_id = models.CharField(max_length=120, blank=True)
	recurring_plan_key = models.CharField(max_length=40, blank=True)
	recurring_status = models.CharField(max_length=40, blank=True)
	terms_accepted_at = models.DateTimeField(null=True, blank=True)
	disclaimer_accepted_at = models.DateTimeField(null=True, blank=True)
	notes = models.TextField(blank=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['user_id']

	def __str__(self):
		return f'{self.user_id}:{self.tier}'

	@property
	def can_view_star_breakdown(self):
		return self.tier in {self.TIER_SUBSCRIBER, self.TIER_BUNDLE, self.TIER_ADMIN}

	@property
	def has_priority_listing(self):
		return self.tier in {self.TIER_PRIORITY, self.TIER_BUNDLE, self.TIER_ADMIN}


class CheckoutRequest(models.Model):
	user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='checkout_requests', on_delete=models.CASCADE)
	plan_key = models.CharField(max_length=40)
	plan_name = models.CharField(max_length=120)
	amount_display = models.CharField(max_length=40)
	status = models.CharField(max_length=40, default='Pending Review')
	reference = models.CharField(max_length=24, unique=True)
	provider = models.CharField(max_length=40, default='manual')
	billing_mode = models.CharField(max_length=40, default='payment')
	provider_session_id = models.CharField(max_length=120, blank=True)
	provider_customer_id = models.CharField(max_length=120, blank=True)
	provider_subscription_id = models.CharField(max_length=120, blank=True)
	provider_payment_status = models.CharField(max_length=40, blank=True)
	source = models.CharField(max_length=40, blank=True)
	notes = models.TextField(blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	completed_at = models.DateTimeField(null=True, blank=True)

	class Meta:
		ordering = ['-created_at', '-id']

	def __str__(self):
		return self.reference


class BillingEvent(models.Model):
	membership = models.ForeignKey(Membership, related_name='billing_events', on_delete=models.SET_NULL, null=True, blank=True)
	checkout_request = models.ForeignKey(CheckoutRequest, related_name='billing_events', on_delete=models.SET_NULL, null=True, blank=True)
	provider = models.CharField(max_length=40, default='stripe')
	event_type = models.CharField(max_length=80)
	event_status = models.CharField(max_length=40, blank=True)
	reference = models.CharField(max_length=120, blank=True)
	summary = models.TextField(blank=True)
	metadata = models.JSONField(default=dict, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['-created_at', '-id']

	def __str__(self):
		return f'{self.provider}:{self.event_type}:{self.reference or self.id}'


class DirectMessage(models.Model):
	sender = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='sent_direct_messages', on_delete=models.CASCADE)
	recipient = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='received_direct_messages', on_delete=models.CASCADE)
	body = models.TextField()
	created_at = models.DateTimeField(auto_now_add=True)
	read_at = models.DateTimeField(null=True, blank=True)

	class Meta:
		ordering = ['created_at', 'id']

	def __str__(self):
		return f'{self.sender_id}->{self.recipient_id}:{self.id}'


class UserEngagementEvent(models.Model):
	EVENT_PAGE_VIEW = 'page_view'
	EVENT_HEARTBEAT = 'heartbeat'

	EVENT_CHOICES = [
		(EVENT_PAGE_VIEW, 'Page view'),
		(EVENT_HEARTBEAT, 'Heartbeat'),
	]

	user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='engagement_events', on_delete=models.SET_NULL, null=True, blank=True)
	session_key = models.CharField(max_length=64, blank=True, db_index=True)
	path = models.CharField(max_length=240, default='/')
	event_type = models.CharField(max_length=32, choices=EVENT_CHOICES, default=EVENT_PAGE_VIEW)
	metadata = models.JSONField(default=dict, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['-created_at', '-id']
		indexes = [
			models.Index(fields=['created_at']),
			models.Index(fields=['event_type', 'created_at']),
		]

	def __str__(self):
		return f'{self.event_type}:{self.path}:{self.user_id or self.session_key or self.id}'
