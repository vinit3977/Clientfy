from django.contrib import admin
from .models import Document

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['name', 'document_type', 'client', 'project', 'uploaded_by', 'created_at']
    list_filter = ['document_type']
    search_fields = ['name', 'client__name', 'project__name']
