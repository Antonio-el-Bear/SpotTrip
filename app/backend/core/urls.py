from django.urls import path
from .ai_trip_builder import ai_trip_builder

urlpatterns = [
    path('ai-trip-builder/', ai_trip_builder, name='ai-trip-builder'),
]
