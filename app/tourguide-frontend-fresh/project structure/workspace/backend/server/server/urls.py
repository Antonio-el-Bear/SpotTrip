
from django.http import HttpResponseRedirect
"""
URL configuration for server project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""


from django.contrib import admin
from django.urls import path, include
from main.views import home
from django.shortcuts import render

def upgrade(request):
    return render(request, 'upgrade.html')

def destinations(request):
    return render(request, 'destinations.html')

def forum(request):
    return render(request, 'forum.html')

def travel_tools(request):
    return render(request, 'travel_tools.html')

def pricing(request):
    return render(request, 'pricing.html')

urlpatterns = [
    path('', home, name='home'),
    path('upgrade/', upgrade, name='upgrade'),
    path('upgrade.html', lambda request: HttpResponseRedirect('/upgrade/')),
    path('destinations/', destinations, name='destinations'),
    path('forum/', forum, name='forum'),
    path('travel-tools/', travel_tools, name='travel_tools'),
    path('pricing/', pricing, name='pricing'),
    path('admin/', admin.site.urls),
    path('api/', include('main.api_urls')),
]
