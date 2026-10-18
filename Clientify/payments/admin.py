from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['client', 'amount', 'payment_method', 'payment_date', 'recorded_by']
    list_filter = ['payment_method']
    search_fields = ['client__name', 'transaction_id']
