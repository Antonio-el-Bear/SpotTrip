from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0011_expert_user_directmessage"),
    ]

    operations = [
        migrations.AddField(
            model_name="membership",
            name="disclaimer_accepted_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="membership",
            name="terms_accepted_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]