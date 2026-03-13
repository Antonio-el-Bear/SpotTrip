from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from main.models import Membership


User = get_user_model()


TIER_ACCOUNTS = [
    {
        'email': 'member.demo@travelrecord.local',
        'username': 'member-demo',
        'first_name': 'Member',
        'last_name': 'Demo',
        'tier': Membership.TIER_MEMBER,
        'status': Membership.STATUS_ACTIVE,
        'priority_slots_total': 0,
        'priority_slots_used': 0,
        'recurring_plan_key': '',
        'recurring_status': '',
        'is_staff': False,
        'is_superuser': False,
    },
    {
        'email': 'subscriber.demo@travelrecord.local',
        'username': 'subscriber-demo',
        'first_name': 'Subscriber',
        'last_name': 'Demo',
        'tier': Membership.TIER_SUBSCRIBER,
        'status': Membership.STATUS_ACTIVE,
        'priority_slots_total': 0,
        'priority_slots_used': 0,
        'recurring_plan_key': 'subscription',
        'recurring_status': 'active',
        'is_staff': False,
        'is_superuser': False,
    },
    {
        'email': 'priority.demo@travelrecord.local',
        'username': 'priority-demo',
        'first_name': 'Priority',
        'last_name': 'Demo',
        'tier': Membership.TIER_PRIORITY,
        'status': Membership.STATUS_ACTIVE,
        'priority_slots_total': 1,
        'priority_slots_used': 0,
        'recurring_plan_key': '',
        'recurring_status': '',
        'is_staff': False,
        'is_superuser': False,
    },
    {
        'email': 'bundle.demo@travelrecord.local',
        'username': 'bundle-demo',
        'first_name': 'Bundle',
        'last_name': 'Demo',
        'tier': Membership.TIER_BUNDLE,
        'status': Membership.STATUS_ACTIVE,
        'priority_slots_total': 1,
        'priority_slots_used': 0,
        'recurring_plan_key': 'bundle',
        'recurring_status': 'active',
        'is_staff': False,
        'is_superuser': False,
    },
    {
        'email': 'admin.demo@travelrecord.local',
        'username': 'admin-demo',
        'first_name': 'Admin',
        'last_name': 'Demo',
        'tier': Membership.TIER_ADMIN,
        'status': Membership.STATUS_ACTIVE,
        'priority_slots_total': 0,
        'priority_slots_used': 0,
        'recurring_plan_key': '',
        'recurring_status': '',
        'is_staff': True,
        'is_superuser': True,
    },
]


class Command(BaseCommand):
    help = 'Create or update one demo account for each TravelRecord tier.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--password',
            default='TierDemo123!',
            help='Password to assign to all seeded demo accounts.',
        )

    def handle(self, *args, **options):
        password = options['password']
        today = timezone.now().date()
        expires_at = today + timedelta(days=365)

        self.stdout.write('Seeding TravelRecord tier accounts...')

        for account in TIER_ACCOUNTS:
            user, created = User.objects.get_or_create(
                email=account['email'],
                defaults={
                    'username': account['username'],
                    'first_name': account['first_name'],
                    'last_name': account['last_name'],
                },
            )

            updates = []
            if user.username != account['username']:
                user.username = account['username']
                updates.append('username')
            if user.first_name != account['first_name']:
                user.first_name = account['first_name']
                updates.append('first_name')
            if user.last_name != account['last_name']:
                user.last_name = account['last_name']
                updates.append('last_name')
            if user.is_staff != account['is_staff']:
                user.is_staff = account['is_staff']
                updates.append('is_staff')
            if user.is_superuser != account['is_superuser']:
                user.is_superuser = account['is_superuser']
                updates.append('is_superuser')

            user.set_password(password)
            updates.append('password')
            user.save(update_fields=sorted(set(updates)))

            membership, _ = Membership.objects.get_or_create(
                user=user,
                defaults={'start_date': today},
            )
            membership.tier = account['tier']
            membership.status = account['status']
            membership.start_date = membership.start_date or today
            membership.end_date = expires_at if account['recurring_plan_key'] else None
            membership.priority_slots_total = account['priority_slots_total']
            membership.priority_slots_used = account['priority_slots_used']
            membership.recurring_plan_key = account['recurring_plan_key']
            membership.recurring_status = account['recurring_status']
            membership.billing_provider = 'stripe' if account['recurring_plan_key'] else ''
            membership.notes = 'Seeded demo tier account for product evaluation.'
            membership.save(
                update_fields=[
                    'tier',
                    'status',
                    'start_date',
                    'end_date',
                    'priority_slots_total',
                    'priority_slots_used',
                    'recurring_plan_key',
                    'recurring_status',
                    'billing_provider',
                    'notes',
                    'updated_at',
                ]
            )

            verb = 'Created' if created else 'Updated'
            self.stdout.write(
                self.style.SUCCESS(
                    f"{verb}: {account['email']} -> {membership.tier} ({membership.status})"
                )
            )

        self.stdout.write('')
        self.stdout.write(self.style.WARNING('Demo password for all seeded accounts: ' + password))
