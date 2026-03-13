from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0005_rename_shield_rating_to_star_rating'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='CheckoutRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('plan_key', models.CharField(max_length=40)),
                ('plan_name', models.CharField(max_length=120)),
                ('amount_display', models.CharField(max_length=40)),
                ('status', models.CharField(default='Pending Review', max_length=40)),
                ('reference', models.CharField(max_length=24, unique=True)),
                ('source', models.CharField(blank=True, max_length=40)),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=models.deletion.CASCADE, related_name='checkout_requests', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at', '-id'],
            },
        ),
    ]