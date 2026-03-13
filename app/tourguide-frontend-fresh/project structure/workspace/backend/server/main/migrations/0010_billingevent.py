from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0009_membership_recurring_fields'),
    ]

    operations = [
        migrations.CreateModel(
            name='BillingEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('provider', models.CharField(default='stripe', max_length=40)),
                ('event_type', models.CharField(max_length=80)),
                ('event_status', models.CharField(blank=True, max_length=40)),
                ('reference', models.CharField(blank=True, max_length=120)),
                ('summary', models.TextField(blank=True)),
                ('metadata', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('checkout_request', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='billing_events', to='main.checkoutrequest')),
                ('membership', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='billing_events', to='main.membership')),
            ],
            options={
                'ordering': ['-created_at', '-id'],
            },
        ),
    ]
