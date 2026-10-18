from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Project
from clients.models import Client

User = get_user_model()


class ProjectSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    manager_name = serializers.SerializerMethodField()
    team_members = serializers.SerializerMethodField()
    task_count = serializers.SerializerMethodField()
    completed_tasks = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_client_name(self, obj):
        return obj.client.name if obj.client else None

    def get_manager_name(self, obj):
        return obj.project_manager.full_name if obj.project_manager else None

    def get_team_members(self, obj):
        from accounts.serializers import UserListSerializer
        return UserListSerializer(obj.assigned_team.all(), many=True).data

    def get_task_count(self, obj):
        return obj.tasks.count()

    def get_completed_tasks(self, obj):
        return obj.tasks.filter(status='completed').count()


class ProjectListSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    manager_name = serializers.SerializerMethodField()
    task_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'client', 'client_name', 'project_manager',
            'manager_name', 'status', 'priority', 'progress',
            'start_date', 'deadline', 'budget', 'currency', 'currency_symbol',
            'task_count', 'created_at'
        ]

    def get_client_name(self, obj):
        return obj.client.name if obj.client else None

    def get_manager_name(self, obj):
        return obj.project_manager.full_name if obj.project_manager else None

    def get_task_count(self, obj):
        return obj.tasks.count()
