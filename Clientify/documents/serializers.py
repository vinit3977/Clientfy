from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    project_name = serializers.SerializerMethodField()
    uploaded_by_name = serializers.SerializerMethodField()
    file_size_display = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['id', 'uploaded_by', 'file_size', 'file_type', 'created_at', 'updated_at']

    def get_client_name(self, obj):
        return obj.client.name if obj.client else None

    def get_project_name(self, obj):
        return obj.project.name if obj.project else None

    def get_uploaded_by_name(self, obj):
        return obj.uploaded_by.full_name if obj.uploaded_by else None

    def get_file_size_display(self, obj):
        size = obj.file_size
        if size < 1024:
            return f"{size} B"
        elif size < 1024 * 1024:
            return f"{size / 1024:.1f} KB"
        else:
            return f"{size / (1024 * 1024):.1f} MB"

    def validate_file(self, value):
        max_size = 50 * 1024 * 1024  # 50MB
        if value.size > max_size:
            raise serializers.ValidationError("File size cannot exceed 50MB.")
        return value
