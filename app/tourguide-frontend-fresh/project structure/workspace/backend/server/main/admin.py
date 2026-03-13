from django.contrib import admin
from .models import Expert, ItineraryItem, Review, Trip

admin.site.register(Expert)
admin.site.register(Review)
admin.site.register(ItineraryItem)
admin.site.register(Trip)
