from django.db import migrations


TRIP_TITLES = [
    'Tokyo & Kyoto Explorer',
    'Inca Trail & Sacred Valley',
    'Fjords & Northern Lights',
    'Culinary Heritage Trail: Northern Spain',
    'East African Rift Valley Expedition',
    'Silk Road Heritage: Uzbekistan Corridor',
    'Sustainable Communities of the Peruvian Highlands',
    'Mekong Delta Community Tourism Assessment',
]


def seed_trip_detail_content(apps, schema_editor):
    Trip = apps.get_model('main', 'Trip')
    Review = apps.get_model('main', 'Review')
    ItineraryItem = apps.get_model('main', 'ItineraryItem')

    trips = Trip.objects.filter(title__in=TRIP_TITLES).select_related('expert')

    for trip in trips:
        ItineraryItem.objects.filter(trip=trip, day__in=['Day 1', 'Day 2', 'Day 3']).delete()
        Review.objects.filter(trip=trip, user__in=['TravelRecord Seed Reviewer A', 'TravelRecord Seed Reviewer B']).delete()

        ItineraryItem.objects.bulk_create([
            ItineraryItem(
                trip=trip,
                day='Day 1',
                description=f'Arrival in {trip.city}, orientation around {trip.country}, and a practical setup day based on the documented route for {trip.title}.',
            ),
            ItineraryItem(
                trip=trip,
                day='Day 2',
                description=f'Core fieldwork and primary experiences for {trip.classification.lower()} with realistic transit timing and sequencing.',
            ),
            ItineraryItem(
                trip=trip,
                day='Day 3',
                description='Adaptive local exploration with budget-aware alternatives, food stops, and contingency options drawn from the trip record.',
            ),
        ])

        Review.objects.bulk_create([
            Review(
                trip=trip,
                user='TravelRecord Seed Reviewer A',
                rating=5,
                text='Clear logistics, practical pacing, and strong local context. The route felt realistic from start to finish.',
            ),
            Review(
                trip=trip,
                user='TravelRecord Seed Reviewer B',
                rating=4,
                text='Useful detail and strong planning structure. Good coverage of transport, budget, and timing constraints.',
            ),
        ])


def reverse_seed_trip_detail_content(apps, schema_editor):
    Trip = apps.get_model('main', 'Trip')
    Review = apps.get_model('main', 'Review')
    ItineraryItem = apps.get_model('main', 'ItineraryItem')

    trips = Trip.objects.filter(title__in=TRIP_TITLES)
    Review.objects.filter(trip__in=trips, user__in=['TravelRecord Seed Reviewer A', 'TravelRecord Seed Reviewer B']).delete()
    ItineraryItem.objects.filter(trip__in=trips, day__in=['Day 1', 'Day 2', 'Day 3']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0003_seed_directory_data'),
    ]

    operations = [
        migrations.RunPython(seed_trip_detail_content, reverse_seed_trip_detail_content),
    ]