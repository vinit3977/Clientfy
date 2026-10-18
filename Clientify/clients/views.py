from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q

from .models import Client
from .serializers import ClientSerializer, ClientListSerializer
from accounts.permissions import IsAdmin, IsAdminOrManager, IsActiveUser


class ClientViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'industry', 'assigned_manager']
    search_fields = ['name', 'company_name', 'email', 'phone', 'city', 'country']
    ordering_fields = ['name', 'company_name', 'status', 'created_at']
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
            return Client.objects.all()
        elif user.role == 'manager':
            return Client.objects.filter(
                Q(assigned_manager=user) | Q(created_by=user)
            )
        else:  # employee
            # Employees see clients of projects they're assigned to
            return Client.objects.filter(
                projects__assigned_team=user
            ).distinct()

    def get_serializer_class(self):
        if self.action == 'list':
            return ClientListSerializer
        return ClientSerializer

    def perform_create(self, serializer):
        from activities.utils import log_activity
        client = serializer.save(created_by=self.request.user)
        log_activity(
            user=self.request.user,
            action='created',
            entity_type='client',
            entity_id=client.id,
            entity_name=client.name,
            description=f"Created new client: {client.name}"
        )

    def perform_update(self, serializer):
        from activities.utils import log_activity
        client = serializer.save()
        log_activity(
            user=self.request.user,
            action='updated',
            entity_type='client',
            entity_id=client.id,
            entity_name=client.name,
            description=f"Updated client: {client.name}"
        )

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        client = self.get_object()
        client.status = 'archived'
        client.save()
        return Response({'detail': 'Client archived successfully.'})

    @action(detail=True, methods=['get'])
    def projects(self, request, pk=None):
        # pyrefly: ignore[missing-import]
        from projects.serializers import ProjectListSerializer
        client = self.get_object()
        projects = client.projects.all()
        serializer = ProjectListSerializer(projects, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def invoices(self, request, pk=None):
        from invoices.serializers import InvoiceListSerializer
        client = self.get_object()
        invoices = client.invoices.all()
        serializer = InvoiceListSerializer(invoices, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def payments(self, request, pk=None):
        # pyrefly: ignore[missing-import]
        from payments.serializers import PaymentSerializer
        client = self.get_object()
        payments = client.payments.all()
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def activities(self, request, pk=None):
        from activities.models import Activity
        from activities.serializers import ActivitySerializer
        activities = Activity.objects.filter(entity_type='client', entity_id=pk)
        serializer = ActivitySerializer(activities, many=True)
        return Response(serializer.data)
