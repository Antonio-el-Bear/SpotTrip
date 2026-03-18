from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('server.users.urls')),
    path('api/core/', include('core.urls')),
    path('api-auth/', include('rest_framework.urls')),
]
