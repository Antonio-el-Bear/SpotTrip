from django.shortcuts import render
from .models import Trip
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import TripSerializer

def home(request):
	trips = Trip.objects.all()
	return render(request, 'index.html', {'trips': trips})

# Trip detail API view
class TripDetailAPIView(APIView):
	def get(self, request, trip_id):
		try:
			trip = Trip.objects.select_related('expert').prefetch_related('reviews', 'itinerary').get(id=trip_id)
		except Trip.DoesNotExist:
			return Response({'error': 'Trip not found'}, status=status.HTTP_404_NOT_FOUND)
		serializer = TripSerializer(trip)
		return Response(serializer.data)

# Trip list API view for mapping names to IDs
class TripListAPIView(APIView):
	def get(self, request):
		trips = Trip.objects.select_related('expert').all()
		# Return id, title, and expert name for mapping
		data = [{"id": t.id, "title": t.title, "expert": t.expert.name if t.expert else ""} for t in trips]
		return Response(data)
