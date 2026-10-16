from .models import Notification


def create_notification(recipient, notification_type, title, message, related_entity_type='', related_entity_id=None):
    """Helper to create notifications throughout the system"""
    Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        title=title,
        message=message,
        related_entity_type=related_entity_type,
        related_entity_id=related_entity_id
    )
