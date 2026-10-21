from django.urls import path
from .views import DashboardView, ClientReportView, ProjectReportView, FinancialReportView, TeamReportView

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('clients/', ClientReportView.as_view(), name='client_report'),
    path('projects/', ProjectReportView.as_view(), name='project_report'),
    path('financial/', FinancialReportView.as_view(), name='financial_report'),
    path('team/', TeamReportView.as_view(), name='team_report'),
]
