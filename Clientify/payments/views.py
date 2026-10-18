from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Payment
from .serializers import PaymentSerializer
from accounts.permissions import IsAdmin, IsAdminOrAccountant, IsAdminOrManagerOrAccountant, IsActiveUser


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['client', 'project', 'invoice', 'payment_method']
    search_fields = ['client__name', 'transaction_id', 'notes']
    ordering_fields = ['payment_date', 'amount', 'created_at']
    ordering = ['-payment_date']

    def get_permissions(self):
        if self.action in ['destroy']:
            return [IsAuthenticated(), IsAdmin()]
        if self.action in ['create', 'update', 'partial_update']:
            return [IsAuthenticated(), IsAdminOrAccountant()]
        return [IsAuthenticated(), IsAdminOrManagerOrAccountant()]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'accountant']:
            return Payment.objects.all()
        elif user.role == 'manager':
            return Payment.objects.filter(client__assigned_manager=user)
        return Payment.objects.none()

    def perform_create(self, serializer):
        from activities.utils import log_activity
        payment = serializer.save(recorded_by=self.request.user)
        log_activity(
            user=self.request.user,
            action='created',
            entity_type='payment',
            entity_id=payment.id,
            entity_name=f"Payment #{payment.id}",
            description=f"Recorded payment of {payment.currency_symbol}{payment.amount} from {payment.client.name}"
        )
