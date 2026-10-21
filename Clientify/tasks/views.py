from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q
from django.utils import timezone

from .models import Task, TaskComment
from .serializers import TaskSerializer, TaskListSerializer, TaskCommentSerializer
from accounts.permissions import IsAdmin, IsAdminOrManager, IsActiveUser


class TaskViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'priority', 'project', 'assigned_to', 'client']
    search_fields = ['title', 'description', 'project__name']
    ordering_fields = ['title', 'status', 'priority', 'due_date', 'created_at']
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
            return Task.objects.all()
        elif user.role == 'manager':
            return Task.objects.filter(
                Q(project__project_manager=user) |
                Q(project__assigned_team=user) |
                Q(assigned_to=user) |
                Q(created_by=user)
            ).distinct()
        else:  # employee
            return Task.objects.filter(assigned_to=user)

    def get_serializer_class(self):
        if self.action == 'list':
            return TaskListSerializer
        return TaskSerializer

    def perform_create(self, serializer):
        from activities.utils import log_activity
        from notifications.utils import create_notification
        task = serializer.save(
            created_by=self.request.user,
            client=serializer.validated_data.get('project').client
        )
        log_activity(
            user=self.request.user,
            action='created',
            entity_type='task',
            entity_id=task.id,
            entity_name=task.title,
            description=f"Created task: {task.title}"
        )
        if task.assigned_to and task.assigned_to != self.request.user:
            create_notification(
                recipient=task.assigned_to,
                notification_type='task_assigned',
                title='New Task Assigned',
                message=f'You have been assigned a new task: {task.title}',
                related_entity_type='task',
                related_entity_id=task.id
            )

    def perform_update(self, serializer):
        from activities.utils import log_activity
        old_status = self.get_object().status
        task = serializer.save()
        log_activity(
            user=self.request.user,
            action='updated',
            entity_type='task',
            entity_id=task.id,
            entity_name=task.title,
            description=f"Updated task: {task.title} - Status: {task.status}"
        )
        # Update project progress when task status changes
        if old_status != task.status:
            project = task.project
            project.progress = project.calculate_progress()
            project.save()

    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        task = self.get_object()
        serializer = TaskCommentSerializer(data={
            'task': task.id,
            'comment': request.data.get('comment', '')
        })
        if serializer.is_valid():
            serializer.save(user=request.user, task=task)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        task = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(Task.STATUS_CHOICES):
            return Response({'detail': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)
        task.status = new_status
        if new_status == 'completed':
            task.completion_date = timezone.now().date()
        task.save()
        # Update project progress
        project = task.project
        project.progress = project.calculate_progress()
        project.save()
        return Response({'status': new_status, 'detail': 'Task status updated.'})


class TaskCommentViewSet(viewsets.ModelViewSet):
    queryset = TaskComment.objects.all()
    serializer_class = TaskCommentSerializer
    permission_classes = [IsAuthenticated, IsActiveUser]

    def get_queryset(self):
        task_id = self.kwargs.get('task_pk')
        if task_id:
            return TaskComment.objects.filter(task_id=task_id)
        return TaskComment.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
