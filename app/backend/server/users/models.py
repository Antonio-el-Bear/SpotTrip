from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    roles = models.JSONField(default=list)  # e.g. ["customer", "guide", "admin"]

    def __str__(self):
        return self.username
