from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0008_checkoutrequest_payment_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='checkoutrequest',
            name='billing_mode',
            field=models.CharField(default='payment', max_length=40),
        ),
        migrations.AddField(
            model_name='checkoutrequest',
            name='provider_customer_id',
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name='checkoutrequest',
            name='provider_subscription_id',
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name='membership',
            name='billing_provider',
            field=models.CharField(blank=True, max_length=40),
        ),
        migrations.AddField(
            model_name='membership',
            name='recurring_plan_key',
            field=models.CharField(blank=True, max_length=40),
        ),
        migrations.AddField(
            model_name='membership',
            name='recurring_status',
            field=models.CharField(blank=True, max_length=40),
        ),
        migrations.AddField(
            model_name='membership',
            name='stripe_customer_id',
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name='membership',
            name='stripe_subscription_id',
            field=models.CharField(blank=True, max_length=120),
        ),
    ]