from rest_framework import serializers
from .models import Activity


class ActivitySerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_avatar = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = [
            'id', 'user', 'user_name', 'user_avatar', 'user_role',
            'action', 'entity_type', 'entity_id', 'entity_name',
            'description', 'created_at'
        ]

    def get_user_name(self, obj):
        return obj.user.full_name if obj.user else 'System'

    def get_user_avatar(self, obj):
        return obj.user.avatar.url if obj.user and obj.user.avatar else None

    def get_user_role(self, obj):
        return obj.user.role if obj.user else None
