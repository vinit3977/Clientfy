from django.db import models
from django.conf import settings


class Client(models.Model):
    STATUS_CHOICES = [
        ('lead', 'Lead'),
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('completed', 'Completed'),
        ('archived', 'Archived'),
    ]

    INDUSTRY_CHOICES = [
        ('technology', 'Technology'),
        ('healthcare', 'Healthcare'),
        ('finance', 'Finance'),
        ('education', 'Education'),
        ('retail', 'Retail'),
        ('manufacturing', 'Manufacturing'),
        ('real_estate', 'Real Estate'),
        ('media', 'Media & Entertainment'),
        ('hospitality', 'Hospitality'),
        ('consulting', 'Consulting'),
        ('legal', 'Legal'),
        ('nonprofit', 'Non-Profit'),
        ('government', 'Government'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=200)
    company_name = models.CharField(max_length=200, blank=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    alternate_phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    currency = models.CharField(max_length=10, default='USD')
    currency_symbol = models.CharField(max_length=5, default='$')
    website = models.URLField(blank=True)
    industry = models.CharField(max_length=50, choices=INDUSTRY_CHOICES, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='lead')
    assigned_manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='managed_clients',
        limit_choices_to={'role__in': ['admin', 'manager']}
    )
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_clients'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'clients'
        ordering = ['-created_at']

    def __str__(self):
        return self.name
