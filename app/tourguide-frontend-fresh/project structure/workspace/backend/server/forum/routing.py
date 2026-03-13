from django.urls import re_path
from . import consumers
from .dm_consumers import DirectMessageConsumer
from .notification_consumers import NotificationConsumer

websocket_urlpatterns = [
    re_path(r'ws/forum/$', consumers.ForumConsumer.as_asgi()),
    re_path(r'ws/dm/(?P<username>[^/]+)/$', DirectMessageConsumer.as_asgi()),
    re_path(r'ws/notifications/$', NotificationConsumer.as_asgi()),
]
