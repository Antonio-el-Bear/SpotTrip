from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

	dependencies = [
		migrations.swappable_dependency(settings.AUTH_USER_MODEL),
		("main", "0012_membership_legal_acceptance"),
	]

	operations = [
		migrations.CreateModel(
			name="UserEngagementEvent",
			fields=[
				("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
				("session_key", models.CharField(blank=True, db_index=True, max_length=64)),
				("path", models.CharField(default="/", max_length=240)),
				("event_type", models.CharField(choices=[("page_view", "Page view"), ("heartbeat", "Heartbeat")], default="page_view", max_length=32)),
				("metadata", models.JSONField(blank=True, default=dict)),
				("created_at", models.DateTimeField(auto_now_add=True)),
				("user", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="engagement_events", to=settings.AUTH_USER_MODEL)),
			],
			options={
				"ordering": ["-created_at", "-id"],
			},
		),
		migrations.AddIndex(
			model_name="userengagementevent",
			index=models.Index(fields=["created_at"], name="main_useren_created_592661_idx"),
		),
		migrations.AddIndex(
			model_name="userengagementevent",
			index=models.Index(fields=["event_type", "created_at"], name="main_useren_event_t_5021d7_idx"),
		),
	]