from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0006_checkoutrequest'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Membership',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tier', models.CharField(choices=[('Member', 'Member'), ('Subscriber', 'Subscriber'), ('Priority', 'Priority'), ('Bundle', 'Bundle'), ('Admin', 'Admin')], default='Member', max_length=40)),
                ('status', models.CharField(choices=[('Active', 'Active'), ('Pending', 'Pending'), ('Expired', 'Expired'), ('Suspended', 'Suspended')], default='Active', max_length=40)),
                ('start_date', models.DateField(blank=True, null=True)),
                ('end_date', models.DateField(blank=True, null=True)),
                ('priority_slots_total', models.PositiveIntegerField(default=0)),
                ('priority_slots_used', models.PositiveIntegerField(default=0)),
                ('notes', models.TextField(blank=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=models.deletion.CASCADE, related_name='membership', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['user_id'],
            },
        ),
    ]