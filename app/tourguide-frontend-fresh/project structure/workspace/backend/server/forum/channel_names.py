import hashlib
import re


def _normalize_channel_segment(value, max_length=80):
    normalized = re.sub(r'[^A-Za-z0-9_.-]', '_', (value or '').strip())
    if not normalized:
        normalized = 'anonymous'

    if len(normalized) <= max_length:
        return normalized

    digest = hashlib.sha1(normalized.encode('utf-8')).hexdigest()[:12]
    return f"{normalized[:max_length - 13]}_{digest}"


def build_notification_group_name(username):
    return f"notifications_{_normalize_channel_segment(username, max_length=85)}"


def build_direct_message_room_name(user1, user2):
    parts = sorted([
        _normalize_channel_segment(user1, max_length=40),
        _normalize_channel_segment(user2, max_length=40),
    ])
    return 'dm_' + '_'.join(parts)