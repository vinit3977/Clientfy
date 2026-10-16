from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Invoice
from .serializers import InvoiceSerializer, InvoiceListSerializer
from accounts.permissions import IsAdmin, IsAdminOrAccountant, IsAdminOrManagerOrAccountant, IsActiveUser


class InvoiceViewSet(viewsets.ModelViewSet):
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'client', 'project']
    search_fields = ['invoice_number', 'client__name', 'project__name']
    ordering_fields = ['invoice_number', 'invoice_date', 'due_date', 'total', 'status']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['destroy']:
            return [IsAuthenticated(), IsAdmin()]
        if self.action in ['create', 'update', 'partial_update']:
            return [IsAuthenticated(), IsAdminOrAccountant()]
        return [IsAuthenticated(), IsAdminOrManagerOrAccountant()]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'accountant']:
            return Invoice.objects.all()
        elif user.role == 'manager':
            return Invoice.objects.filter(
                client__assigned_manager=user
            )
        return Invoice.objects.none()

    def get_serializer_class(self):
        if self.action == 'list':
            return InvoiceListSerializer
        return InvoiceSerializer

    def perform_create(self, serializer):
        from activities.utils import log_activity
        invoice = serializer.save(created_by=self.request.user)
        log_activity(
            user=self.request.user,
            action='created',
            entity_type='invoice',
            entity_id=invoice.id,
            entity_name=invoice.invoice_number,
            description=f"Created invoice {invoice.invoice_number} for {invoice.client.name}"
        )

    @action(detail=True, methods=['post'])
    def mark_sent(self, request, pk=None):
        invoice = self.get_object()
        invoice.status = 'sent'
        invoice.save()
        return Response({'detail': 'Invoice marked as sent.'})

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        invoice = self.get_object()
        invoice.status = 'cancelled'
        invoice.save()
        return Response({'detail': 'Invoice cancelled.'})
