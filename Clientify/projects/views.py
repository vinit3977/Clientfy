from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q

from .models import Project
from .serializers import ProjectSerializer, ProjectListSerializer
from accounts.permissions import IsAdmin, IsAdminOrManager, IsActiveUser


class ProjectViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'priority', 'client', 'project_manager']
    search_fields = ['name', 'description', 'client__name']
    ordering_fields = ['name', 'status', 'priority', 'deadline', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['destroy']:
            return [IsAuthenticated(), IsAdmin()]
        if self.action in ['create', 'update', 'partial_update']:
            return [IsAuthenticated(), IsAdminOrManager()]
        return [IsAuthenticated(), IsActiveUser()]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'accountant']:
            return Project.objects.all()
        elif user.role == 'manager':
            return Project.objects.filter(
                Q(project_manager=user) | Q(created_by=user) | Q(assigned_team=user)
            ).distinct()
        else:  # employee
            return Project.objects.filter(assigned_team=user)

    def get_serializer_class(self):
        if self.action == 'list':
            return ProjectListSerializer
        return ProjectSerializer

    def perform_create(self, serializer):
        from activities.utils import log_activity
        project = serializer.save(created_by=self.request.user)
        log_activity(
            user=self.request.user,
            action='created',
            entity_type='project',
            entity_id=project.id,
            entity_name=project.name,
            description=f"Created new project: {project.name}"
        )

    def perform_update(self, serializer):
        from activities.utils import log_activity
        old_status = self.get_object().status
        project = serializer.save()
        if old_status != project.status:
            log_activity(
                user=self.request.user,
                action='status_changed',
                entity_type='project',
                entity_id=project.id,
                entity_name=project.name,
                description=f"Project '{project.name}' status changed from {old_status} to {project.status}"
            )
        else:
            log_activity(
                user=self.request.user,
                action='updated',
                entity_type='project',
                entity_id=project.id,
                entity_name=project.name,
                description=f"Updated project: {project.name}"
            )

    @action(detail=True, methods=['get'])
    def tasks(self, request, pk=None):
        from tasks.serializers import TaskSerializer
        project = self.get_object()
        tasks = project.tasks.all()
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        from documents.serializers import DocumentSerializer
        project = self.get_object()
        docs = project.documents.all()
        serializer = DocumentSerializer(docs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def assign_team(self, request, pk=None):
        project = self.get_object()
        user_ids = request.data.get('user_ids', [])
        project.assigned_team.set(user_ids)
        return Response({'detail': 'Team updated successfully.'})

    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        project = self.get_object()
        progress = project.calculate_progress()
        project.progress = progress
        project.save()
        return Response({'progress': progress})
