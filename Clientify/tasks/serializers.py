from rest_framework import serializers
from .models import Task, TaskComment
from django.contrib.auth import get_user_model

User = get_user_model()


class TaskCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_avatar = serializers.SerializerMethodField()

    class Meta:
        model = TaskComment
        fields = ['id', 'task', 'user', 'user_name', 'user_avatar', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_user_name(self, obj):
        return obj.user.full_name

    def get_user_avatar(self, obj):
        return obj.user.avatar.url if obj.user.avatar else None


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    project_name = serializers.SerializerMethodField()
    client_name = serializers.SerializerMethodField()
    comments = TaskCommentSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_assigned_to_name(self, obj):
        return obj.assigned_to.full_name if obj.assigned_to else None

    def get_created_by_name(self, obj):
        return obj.created_by.full_name if obj.created_by else None

    def get_project_name(self, obj):
        return obj.project.name if obj.project else None

    def get_client_name(self, obj):
        return obj.client.name if obj.client else None


class TaskListSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.SerializerMethodField()
    project_name = serializers.SerializerMethodField()
    client_name = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'project', 'project_name', 'client', 'client_name',
            'assigned_to', 'assigned_to_name', 'priority', 'status',
            'due_date', 'created_at'
        ]

    def get_assigned_to_name(self, obj):
        return obj.assigned_to.full_name if obj.assigned_to else None

    def get_project_name(self, obj):
        return obj.project.name if obj.project else None

    def get_client_name(self, obj):
        return obj.client.name if obj.client else None
