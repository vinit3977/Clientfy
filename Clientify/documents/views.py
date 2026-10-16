from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q

from .models import Document
from .serializers import DocumentSerializer
from accounts.permissions import IsAdmin, IsAdminOrManager, IsActiveUser


class DocumentViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['document_type', 'client', 'project']
    search_fields = ['name', 'description', 'client__name', 'project__name']
    ordering_fields = ['name', 'document_type', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['destroy']:
            return [IsAuthenticated(), IsAdminOrManager()]
        return [IsAuthenticated(), IsActiveUser()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Document.objects.all()
        elif user.role == 'manager':
            return Document.objects.filter(
                Q(client__assigned_manager=user) |
                Q(project__project_manager=user) |
                Q(project__assigned_team=user)
            ).distinct()
        elif user.role == 'accountant':
            return Document.objects.filter(document_type='invoice')
        else:  # employee
            return Document.objects.filter(
                Q(project__assigned_team=user) |
                Q(uploaded_by=user)
            ).distinct()

    def get_serializer_class(self):
        return DocumentSerializer

    def perform_create(self, serializer):
        from activities.utils import log_activity
        doc = serializer.save(uploaded_by=self.request.user)
        log_activity(
            user=self.request.user,
            action='uploaded',
            entity_type='document',
            entity_id=doc.id,
            entity_name=doc.name,
            description=f"Uploaded document: {doc.name}"
        )
