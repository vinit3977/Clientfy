from django.db import models
from django.conf import settings


class Notification(models.Model):
    TYPE_CHOICES = [
        ('task_assigned', 'Task Assigned'),
        ('task_due', 'Task Due'),
        ('task_completed', 'Task Completed'),
        ('project_assigned', 'Project Assigned'),
        ('project_status', 'Project Status Changed'),
        ('client_created', 'Client Created'),
        ('invoice_created', 'Invoice Created'),
        ('payment_received', 'Payment Received'),
        ('payment_overdue', 'Payment Overdue'),
        ('system', 'System Update'),
    ]

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    related_entity_type = models.CharField(max_length=30, blank=True)
    related_entity_id = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} -> {self.recipient.full_name}"
