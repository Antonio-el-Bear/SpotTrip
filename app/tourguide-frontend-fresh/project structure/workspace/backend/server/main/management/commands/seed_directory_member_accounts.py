from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from main.models import Expert, Membership


User = get_user_model()


DIRECTORY_ACCOUNTS = [
    {
        'expert_name': 'Dr. Helena Vasquez',
        'email': 'helena.vasquez@travelrecord.local',
        'username': 'helena-vasquez',
        'first_name': 'Helena',
        'last_name': 'Vasquez',
        'tier': Membership.TIER_BUNDLE,
    },
    {
        'expert_name': 'James Worthington',
        'email': 'james.worthington@travelrecord.local',
        'username': 'james-worthington',
        'first_name': 'James',
        'last_name': 'Worthington',
        'tier': Membership.TIER_PRIORITY,
    },
    {
        'expert_name': 'Akiko Tanaka',
        'email': 'akiko.tanaka@travelrecord.local',
        'username': 'akiko-tanaka',
        'first_name': 'Akiko',
        'last_name': 'Tanaka',
        'tier': Membership.TIER_SUBSCRIBER,
    },
    {
        'expert_name': 'Marcus Okafor',
        'email': 'marcus.okafor@travelrecord.local',
        'username': 'marcus-okafor',
        'first_name': 'Marcus',
        'last_name': 'Okafor',
        'tier': Membership.TIER_MEMBER,
    },
]


class Command(BaseCommand):
    help = 'Create auth accounts for seeded directory experts and link each Expert profile to a real user.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--password',
            default='ExpertDemo123!',
            help='Password to assign to all seeded directory member accounts.',
        )

    def handle(self, *args, **options):
        password = options['password']
        today = timezone.now().date()

        self.stdout.write('Seeding TravelRecord directory member accounts...')

        for account in DIRECTORY_ACCOUNTS:
            expert = Expert.objects.filter(name=account['expert_name']).first()
            if not expert:
                raise CommandError(f"Expert profile not found: {account['expert_name']}")

            user, created = User.objects.get_or_create(
                email=account['email'],
                defaults={
                    'username': account['username'],
                    'first_name': account['first_name'],
                    'last_name': account['last_name'],
                },
            )

            update_fields = []
            if user.username != account['username']:
                user.username = account['username']
                update_fields.append('username')
            if user.first_name != account['first_name']:
                user.first_name = account['first_name']
                update_fields.append('first_name')
            if user.last_name != account['last_name']:
                user.last_name = account['last_name']
                update_fields.append('last_name')

            user.set_password(password)
            update_fields.append('password')
            user.save(update_fields=sorted(set(update_fields)))

            membership, _ = Membership.objects.get_or_create(
                user=user,
                defaults={'start_date': today},
            )
            membership.tier = account['tier']
            membership.status = Membership.STATUS_ACTIVE
            membership.start_date = membership.start_date or today
            membership.notes = 'Seeded directory member account for profile-linked messaging.'
            membership.save(update_fields=['tier', 'status', 'start_date', 'notes', 'updated_at'])

            if expert.user_id != user.id:
                expert.user = user
                expert.save(update_fields=['user'])

            verb = 'Created' if created else 'Updated'
            self.stdout.write(self.style.SUCCESS(f"{verb}: {account['expert_name']} -> {account['email']} ({membership.tier})"))

        self.stdout.write('')
        self.stdout.write(self.style.WARNING('Directory member password for all seeded accounts: ' + password))