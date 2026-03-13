from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0007_membership'),
    ]

    operations = [
        migrations.AddField(
            model_name='checkoutrequest',
            name='completed_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='checkoutrequest',
            name='provider',
            field=models.CharField(default='manual', max_length=40),
        ),
        migrations.AddField(
            model_name='checkoutrequest',
            name='provider_payment_status',
            field=models.CharField(blank=True, max_length=40),
        ),
        migrations.AddField(
            model_name='checkoutrequest',
            name='provider_session_id',
            field=models.CharField(blank=True, max_length=120),
        ),
    ]