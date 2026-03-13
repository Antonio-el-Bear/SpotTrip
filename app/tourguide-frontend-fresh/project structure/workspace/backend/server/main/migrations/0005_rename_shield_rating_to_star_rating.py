from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0004_seed_trip_detail_content'),
    ]

    operations = [
        migrations.RenameField(
            model_name='expert',
            old_name='shield_rating',
            new_name='star_rating',
        ),
    ]