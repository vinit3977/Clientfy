from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta, date
import calendar

from accounts.models import User
from clients.models import Client
from projects.models import Project
from tasks.models import Task
from invoices.models import Invoice
from payments.models import Payment
from activities.models import Activity
from accounts.permissions import IsAdmin, IsAdminOrManagerOrAccountant, IsActiveUser


class DashboardView(APIView):
    """Role-based dashboard data"""
    permission_classes = [IsAuthenticated, IsActiveUser]

    def get(self, request):
        user = request.user
        role = user.role

        if role == 'admin':
            return Response(self._admin_dashboard())
        elif role == 'manager':
            return Response(self._manager_dashboard(user))
        elif role == 'accountant':
            return Response(self._accountant_dashboard())
        else:
            return Response(self._employee_dashboard(user))

    def _admin_dashboard(self):
        now = timezone.now()
        this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        total_revenue = Payment.objects.aggregate(total=Sum('amount'))['total'] or 0
        pending_payments = Invoice.objects.filter(
            status__in=['sent', 'partially_paid']
        ).aggregate(total=Sum('total'))['total'] or 0
        overdue_payments = Invoice.objects.filter(
            status='overdue'
        ).aggregate(total=Sum('total'))['total'] or 0

        # Monthly revenue for last 6 months
        monthly_revenue = []
        for i in range(5, -1, -1):
            month_date = (now - timedelta(days=30 * i))
            month_start = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            if month_date.month == 12:
                month_end = month_date.replace(year=month_date.year + 1, month=1, day=1)
            else:
                month_end = month_date.replace(month=month_date.month + 1, day=1)

            rev = Payment.objects.filter(
                created_at__gte=month_start,
                created_at__lt=month_end
            ).aggregate(total=Sum('amount'))['total'] or 0

            monthly_revenue.append({
                'month': month_date.strftime('%b %Y'),
                'revenue': float(rev)
            })

        # Project status distribution
        project_stats = {}
        for status_choice in Project.STATUS_CHOICES:
            project_stats[status_choice[0]] = Project.objects.filter(status=status_choice[0]).count()

        recent_activities = Activity.objects.select_related('user').all()[:10]
        from activities.serializers import ActivitySerializer
        activities_data = ActivitySerializer(recent_activities, many=True).data

        return {
            'role': 'admin',
            'stats': {
                'total_clients': Client.objects.count(),
                'active_clients': Client.objects.filter(status='active').count(),
                'lead_clients': Client.objects.filter(status='lead').count(),
                'total_projects': Project.objects.count(),
                'active_projects': Project.objects.filter(status='in_progress').count(),
                'completed_projects': Project.objects.filter(status='completed').count(),
                'pending_tasks': Task.objects.filter(status__in=['pending', 'in_progress']).count(),
                'completed_tasks': Task.objects.filter(status='completed').count(),
                'total_team': User.objects.filter(status='active').count(),
                'total_revenue': float(total_revenue),
                'pending_payments': float(pending_payments),
                'overdue_payments': float(overdue_payments),
                'total_invoices': Invoice.objects.count(),
                'paid_invoices': Invoice.objects.filter(status='paid').count(),
                'unpaid_invoices': Invoice.objects.filter(status__in=['sent', 'draft']).count(),
            },
            'monthly_revenue': monthly_revenue,
            'project_status_chart': project_stats,
            'recent_activities': activities_data,
            'recent_clients': self._recent_clients(),
            'recent_projects': self._recent_projects(),
        }

    def _manager_dashboard(self, user):
        my_projects = Project.objects.filter(
            Q(project_manager=user) | Q(assigned_team=user)
        ).distinct()
        my_clients = Client.objects.filter(assigned_manager=user)

        from activities.serializers import ActivitySerializer
        activities_data = ActivitySerializer(
            Activity.objects.filter(user=user)[:10], many=True
        ).data

        return {
            'role': 'manager',
            'stats': {
                'assigned_clients': my_clients.count(),
                'active_projects': my_projects.filter(status='in_progress').count(),
                'total_projects': my_projects.count(),
                'pending_tasks': Task.objects.filter(
                    project__in=my_projects, status__in=['pending', 'in_progress']
                ).count(),
                'completed_tasks': Task.objects.filter(
                    project__in=my_projects, status='completed'
                ).count(),
                'overdue_tasks': Task.objects.filter(
                    project__in=my_projects,
                    status__in=['pending', 'in_progress'],
                    due_date__lt=timezone.now().date()
                ).count(),
            },
            'recent_activities': activities_data,
            'my_projects': self._recent_projects(manager=user),
        }

    def _accountant_dashboard(self):
        total_revenue = Payment.objects.aggregate(total=Sum('amount'))['total'] or 0
        pending = Invoice.objects.filter(
            status__in=['sent', 'partially_paid']
        ).aggregate(total=Sum('total'))['total'] or 0
        overdue = Invoice.objects.filter(status='overdue').aggregate(total=Sum('total'))['total'] or 0

        now = timezone.now()
        monthly_revenue = []
        for i in range(5, -1, -1):
            month_date = (now - timedelta(days=30 * i))
            month_start = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            if month_date.month == 12:
                month_end = month_date.replace(year=month_date.year + 1, month=1, day=1)
            else:
                month_end = month_date.replace(month=month_date.month + 1, day=1)

            rev = Payment.objects.filter(
                created_at__gte=month_start,
                created_at__lt=month_end
            ).aggregate(total=Sum('amount'))['total'] or 0
            monthly_revenue.append({
                'month': month_date.strftime('%b %Y'),
                'revenue': float(rev)
            })

        return {
            'role': 'accountant',
            'stats': {
                'total_revenue': float(total_revenue),
                'pending_payments': float(pending),
                'overdue_payments': float(overdue),
                'paid_invoices': Invoice.objects.filter(status='paid').count(),
                'unpaid_invoices': Invoice.objects.filter(status__in=['sent', 'draft', 'partially_paid']).count(),
                'total_invoices': Invoice.objects.count(),
            },
            'monthly_revenue': monthly_revenue,
        }

    def _employee_dashboard(self, user):
        my_tasks = Task.objects.filter(assigned_to=user)
        due_soon = my_tasks.filter(
            due_date__lte=(timezone.now() + timedelta(days=3)).date(),
            status__in=['pending', 'in_progress']
        )

        from tasks.serializers import TaskListSerializer
        tasks_data = TaskListSerializer(my_tasks.order_by('-created_at')[:10], many=True).data

        return {
            'role': 'employee',
            'stats': {
                'total_tasks': my_tasks.count(),
                'pending_tasks': my_tasks.filter(status='pending').count(),
                'in_progress_tasks': my_tasks.filter(status='in_progress').count(),
                'completed_tasks': my_tasks.filter(status='completed').count(),
                'due_soon': due_soon.count(),
                'overdue_tasks': my_tasks.filter(
                    status__in=['pending', 'in_progress'],
                    due_date__lt=timezone.now().date()
                ).count(),
                'my_projects': Project.objects.filter(assigned_team=user).count(),
            },
            'my_tasks': tasks_data,
        }

    def _recent_clients(self, limit=5):
        from clients.serializers import ClientListSerializer
        clients = Client.objects.order_by('-created_at')[:limit]
        return ClientListSerializer(clients, many=True).data

    def _recent_projects(self, limit=5, manager=None):
        from projects.serializers import ProjectListSerializer
        qs = Project.objects.order_by('-created_at')
        if manager:
            qs = qs.filter(
                Q(project_manager=manager) | Q(assigned_team=manager)
            ).distinct()
        return ProjectListSerializer(qs[:limit], many=True).data


class ClientReportView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrManagerOrAccountant]

    def get(self, request):
        return Response({
            'total': Client.objects.count(),
            'active': Client.objects.filter(status='active').count(),
            'lead': Client.objects.filter(status='lead').count(),
            'inactive': Client.objects.filter(status='inactive').count(),
            'completed': Client.objects.filter(status='completed').count(),
            'archived': Client.objects.filter(status='archived').count(),
            'by_industry': list(
                Client.objects.values('industry').annotate(count=Count('id')).order_by('-count')
            ),
        })


class ProjectReportView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrManagerOrAccountant]

    def get(self, request):
        return Response({
            'total': Project.objects.count(),
            'planning': Project.objects.filter(status='planning').count(),
            'in_progress': Project.objects.filter(status='in_progress').count(),
            'completed': Project.objects.filter(status='completed').count(),
            'on_hold': Project.objects.filter(status='on_hold').count(),
            'cancelled': Project.objects.filter(status='cancelled').count(),
            'delayed': Project.objects.filter(
                status__in=['planning', 'in_progress'],
                deadline__lt=timezone.now().date()
            ).count(),
        })


class FinancialReportView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrManagerOrAccountant]

    def get(self, request):
        total_invoiced = Invoice.objects.aggregate(total=Sum('total'))['total'] or 0
        total_paid = Payment.objects.aggregate(total=Sum('amount'))['total'] or 0
        total_pending = Invoice.objects.filter(
            status__in=['sent', 'partially_paid']
        ).aggregate(total=Sum('total'))['total'] or 0
        total_overdue = Invoice.objects.filter(
            status='overdue'
        ).aggregate(total=Sum('total'))['total'] or 0

        return Response({
            'total_invoiced': float(total_invoiced),
            'total_paid': float(total_paid),
            'total_pending': float(total_pending),
            'total_overdue': float(total_overdue),
            'collection_rate': round((float(total_paid) / float(total_invoiced) * 100) if total_invoiced else 0, 2),
        })


class TeamReportView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        team = User.objects.filter(status='active').exclude(role='admin')
        team_data = []
        for member in team:
            team_data.append({
                'id': member.id,
                'name': member.full_name,
                'role': member.role,
                'tasks_completed': Task.objects.filter(assigned_to=member, status='completed').count(),
                'tasks_pending': Task.objects.filter(assigned_to=member, status='pending').count(),
                'tasks_in_progress': Task.objects.filter(assigned_to=member, status='in_progress').count(),
                'projects_assigned': Project.objects.filter(assigned_team=member).count(),
            })
        return Response({
            'total_team': team.count(),
            'team': team_data,
        })
