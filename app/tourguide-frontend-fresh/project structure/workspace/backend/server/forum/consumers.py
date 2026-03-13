import json
from channels.generic.websocket import AsyncWebsocketConsumer

from .channel_names import build_notification_group_name

class ForumConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add('forum', self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard('forum', self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        user = data.get('user', 'Anonymous')
        # Broadcast to group
        await self.channel_layer.group_send(
            'forum',
            {
                'type': 'forum_message',
                'message': data['message'],
                'user': user
            }
        )
        # Notify all users except sender (demo: hardcoded users)
        notify_users = ['Alice', 'Bob', 'Chloe', 'You']
        for username in notify_users:
            if username != user:
                await self.channel_layer.group_send(
                    build_notification_group_name(username),
                    {
                        'type': 'notify',
                        'notification': {
                            'text': f'New forum post from {user}',
                            'from': user,
                            'message': data['message']
                        }
                    }
                )

    async def forum_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'user': event['user']
        }))
