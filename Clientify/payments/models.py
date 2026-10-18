from django.db import models
from django.conf import settings
from clients.models import Client
from projects.models import Project
from invoices.models import Invoice


class Payment(models.Model):
    METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('bank_transfer', 'Bank Transfer'),
        ('upi', 'UPI'),
        ('card', 'Card'),
        ('cheque', 'Cheque'),
        ('other', 'Other'),
    ]

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='payments')
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='bank_transfer')
    transaction_id = models.CharField(max_length=200, blank=True)
    payment_date = models.DateField()
    currency = models.CharField(max_length=10, default='USD')
    currency_symbol = models.CharField(max_length=5, default='$')
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='recorded_payments'
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'payments'
        ordering = ['-payment_date', '-created_at']

    def __str__(self):
        return f"Payment of {self.currency_symbol}{self.amount} from {self.client.name}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update invoice paid amount
        if self.invoice:
            invoice = self.invoice
            total_paid = sum(p.amount for p in invoice.payments.all())
            invoice.paid_amount = total_paid
            invoice.update_status()
