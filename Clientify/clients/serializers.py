from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Client

User = get_user_model()


class ClientSerializer(serializers.ModelSerializer):
    assigned_manager_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    project_count = serializers.SerializerMethodField()
    invoice_count = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_assigned_manager_name(self, obj):
        if obj.assigned_manager:
            return obj.assigned_manager.full_name
        return None

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.full_name
        return None

    def get_project_count(self, obj):
        return obj.projects.count()

    def get_invoice_count(self, obj):
        return obj.invoices.count()


class ClientListSerializer(serializers.ModelSerializer):
    assigned_manager_name = serializers.SerializerMethodField()
    project_count = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            'id', 'name', 'company_name', 'email', 'phone',
            'status', 'industry', 'city', 'country', 'currency', 'currency_symbol',
            'assigned_manager', 'assigned_manager_name', 'project_count',
            'created_at'
        ]

    def get_assigned_manager_name(self, obj):
        if obj.assigned_manager:
            return obj.assigned_manager.full_name
        return None

    def get_project_count(self, obj):
        return obj.projects.count()
