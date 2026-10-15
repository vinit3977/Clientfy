from django.contrib import admin
from .models import Invoice

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'client', 'total', 'paid_amount', 'status', 'due_date']
    list_filter = ['status']
    search_fields = ['invoice_number', 'client__name']
