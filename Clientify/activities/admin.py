from django.contrib import admin
from .models import Activity

@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'entity_type', 'entity_name', 'created_at']
    list_filter = ['action', 'entity_type']
    search_fields = ['description', 'user__email']
    readonly_fields = ['user', 'action', 'entity_type', 'entity_id', 'entity_name', 'description', 'created_at']
