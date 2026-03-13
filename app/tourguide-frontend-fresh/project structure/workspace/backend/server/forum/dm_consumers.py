import json
from channels.generic.websocket import AsyncWebsocketConsumer

from .channel_names import build_direct_message_room_name, build_notification_group_name

class DirectMessageConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        self.other_user = self.scope['url_route']['kwargs']['username']
        self.room_name = build_direct_message_room_name(self.user.username, self.other_user)
        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        # Send DM to room
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': 'dm_message',
                'message': data['message'],
                'user': self.user.username
            }
        )
        # Send notification to recipient
        await self.channel_layer.group_send(
            build_notification_group_name(self.other_user),
            {
                'type': 'notify',
                'notification': {
                    'text': f'New message from {self.user.username}',
                    'from': self.user.username,
                    'message': data['message']
                }
            }
        )

    async def dm_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'user': event['user']
        }))
