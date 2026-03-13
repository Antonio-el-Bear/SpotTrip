import json
from channels.generic.websocket import AsyncWebsocketConsumer

from .channel_names import build_notification_group_name

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if self.user.is_anonymous:
            await self.close()
        else:
            self.group_name = build_notification_group_name(self.user.username)
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        # Notifications are usually sent from backend, not client
        pass

    async def notify(self, event):
        await self.send(text_data=json.dumps(event['notification']))
