from django.db import models
from django.conf import settings


class Activity(models.Model):
    ACTION_CHOICES = [
        ('created', 'Created'),
        ('updated', 'Updated'),
        ('deleted', 'Deleted'),
        ('status_changed', 'Status Changed'),
        ('assigned', 'Assigned'),
        ('uploaded', 'Uploaded'),
        ('logged_in', 'Logged In'),
        ('logged_out', 'Logged Out'),
        ('other', 'Other'),
    ]

    ENTITY_CHOICES = [
        ('user', 'User'),
        ('client', 'Client'),
        ('project', 'Project'),
        ('task', 'Task'),
        ('invoice', 'Invoice'),
        ('payment', 'Payment'),
        ('document', 'Document'),
        ('notification', 'Notification'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='activities'
    )
    action = models.CharField(max_length=30, choices=ACTION_CHOICES, default='other')
    entity_type = models.CharField(max_length=30, choices=ENTITY_CHOICES, blank=True)
    entity_id = models.IntegerField(null=True, blank=True)
    entity_name = models.CharField(max_length=300, blank=True)
    description = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'activities'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} - {self.action} - {self.description[:50]}"
