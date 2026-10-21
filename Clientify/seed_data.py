import os
import django
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from clients.models import Client
from projects.models import Project
from tasks.models import Task, TaskComment
from invoices.models import Invoice
from payments.models import Payment
from documents.models import Document
from activities.models import Activity
from notifications.models import Notification


def seed():
    print("[*] Starting Clientify database seeding...")

    # 1. Create Users
    users_data = [
        {
            'email': 'admin@clientify.com',
            'first_name': 'Alexander',
            'last_name': 'Pierce',
            'role': 'admin',
            'department': 'Executive & Operations',
            'phone': '+1 (555) 100-2001',
            'password': 'Admin@12345',
            'is_superuser': True,
            'is_staff': True,
        },
        {
            'email': 'manager@clientify.com',
            'first_name': 'Sarah',
            'last_name': 'Jenkins',
            'role': 'manager',
            'department': 'Product & Delivery',
            'phone': '+1 (555) 100-2002',
            'password': 'Manager@12345',
            'is_staff': True,
        },
        {
            'email': 'accountant@clientify.com',
            'first_name': 'Marcus',
            'last_name': 'Vance',
            'role': 'accountant',
            'department': 'Finance & Billing',
            'phone': '+1 (555) 100-2003',
            'password': 'Accountant@12345',
            'is_staff': True,
        },
        {
            'email': 'employee@clientify.com',
            'first_name': 'Elena',
            'last_name': 'Rostova',
            'role': 'employee',
            'department': 'Engineering & UX',
            'phone': '+1 (555) 100-2004',
            'password': 'Employee@12345',
            'is_staff': False,
        },
    ]

    users = {}
    for ud in users_data:
        pwd = ud.pop('password')
        user, created = User.objects.get_or_create(email=ud['email'], defaults=ud)
        user.set_password(pwd)
        user.save()
        users[user.role] = user
        status = "Created" if created else "Updated"
        print(f"  [+] {status} User: {user.email} [{user.role}]")

    admin = users['admin']
    manager = users['manager']
    accountant = users['accountant']
    employee = users['employee']

    # 2. Create Clients
    clients_data = [
        {
            'name': 'NovaTech Solutions',
            'company_name': 'NovaTech Global Inc.',
            'email': 'contact@novatech.io',
            'phone': '+1 (415) 890-1200',
            'website': 'https://novatech.io',
            'industry': 'technology',
            'status': 'active',
            'city': 'San Francisco',
            'state': 'CA',
            'country': 'United States',
            'currency': 'USD',
            'currency_symbol': '$',
            'assigned_manager': manager,
            'created_by': admin,
        },
        {
            'name': 'Aura Health Systems',
            'company_name': 'Aura Health Partners UK',
            'email': 'ops@aurahealth.org',
            'phone': '+44 20 7946 0991',
            'website': 'https://aurahealth.org',
            'industry': 'healthcare',
            'status': 'active',
            'city': 'London',
            'state': 'Greater London',
            'country': 'United Kingdom',
            'currency': 'GBP',
            'currency_symbol': '£',
            'assigned_manager': manager,
            'created_by': admin,
        },
        {
            'name': 'Apex Horizon Capital',
            'company_name': 'Apex Horizon Advisors India Pvt Ltd',
            'email': 'invest@apexhorizon.com',
            'phone': '+91 22 6123 4567',
            'website': 'https://apexhorizon.com',
            'industry': 'finance',
            'status': 'lead',
            'city': 'Mumbai',
            'state': 'Maharashtra',
            'country': 'India',
            'currency': 'INR',
            'currency_symbol': '₹',
            'assigned_manager': manager,
            'created_by': admin,
        },
        {
            'name': 'Lumina Retail Brands',
            'company_name': 'Lumina Direct GmbH',
            'email': 'marketing@luminaretail.com',
            'phone': '+49 30 901820',
            'website': 'https://luminaretail.com',
            'industry': 'retail',
            'status': 'active',
            'city': 'Berlin',
            'state': 'Berlin',
            'country': 'Germany',
            'currency': 'EUR',
            'currency_symbol': '€',
            'assigned_manager': manager,
            'created_by': admin,
        },
        {
            'name': 'Veritas Legal Advisors',
            'company_name': 'Veritas & Partners Canada LLP',
            'email': 'info@veritaslegal.com',
            'phone': '+1 (416) 555-0199',
            'website': 'https://veritaslegal.com',
            'industry': 'legal',
            'status': 'completed',
            'city': 'Toronto',
            'state': 'ON',
            'country': 'Canada',
            'currency': 'CAD',
            'currency_symbol': 'CA$',
            'assigned_manager': manager,
            'created_by': admin,
        },
    ]

    clients = []
    for cd in clients_data:
        client, created = Client.objects.update_or_create(email=cd['email'], defaults=cd)
        clients.append(client)
        print(f"  [+] Client: {client.name} ({client.country} - {client.currency})")

    # 3. Create Projects
    today = date.today()
    projects_data = [
        {
            'name': 'NextGen SaaS Platform Overhaul',
            'description': 'Full redesign and Next.js frontend rebuild with real-time websocket integrations.',
            'client': clients[0],
            'project_manager': manager,
            'status': 'in_progress',
            'priority': 'high',
            'start_date': today - timedelta(days=30),
            'deadline': today + timedelta(days=45),
            'budget': Decimal('48000.00'),
            'currency': 'USD',
            'currency_symbol': '$',
            'progress': 65,
            'created_by': admin,
        },
        {
            'name': 'Telehealth Patient Portal Mobile App',
            'description': 'HIPAA-compliant React Native mobile application for scheduling and encrypted consultations.',
            'client': clients[1],
            'project_manager': manager,
            'status': 'in_progress',
            'priority': 'urgent',
            'start_date': today - timedelta(days=60),
            'deadline': today + timedelta(days=20),
            'budget': Decimal('75000.00'),
            'currency': 'GBP',
            'currency_symbol': '£',
            'progress': 80,
            'created_by': admin,
        },
        {
            'name': 'Omnichannel eCommerce Analytics Pipeline',
            'description': 'Real-time inventory and revenue analytics dashboard connecting Shopify and POS systems.',
            'client': clients[3],
            'project_manager': manager,
            'status': 'planning',
            'priority': 'medium',
            'start_date': today - timedelta(days=10),
            'deadline': today + timedelta(days=90),
            'budget': Decimal('32000.00'),
            'currency': 'EUR',
            'currency_symbol': '€',
            'progress': 20,
            'created_by': admin,
        },
        {
            'name': 'Digital Legal Archive & OCR Migration',
            'description': 'Automated document processing and search indexing for 50,000 legal discovery files.',
            'client': clients[4],
            'project_manager': manager,
            'status': 'completed',
            'priority': 'medium',
            'start_date': today - timedelta(days=120),
            'deadline': today - timedelta(days=15),
            'budget': Decimal('28000.00'),
            'currency': 'CAD',
            'currency_symbol': 'CA$',
            'progress': 100,
            'created_by': admin,
        },
    ]

    projects = []
    for pd in projects_data:
        p, created = Project.objects.update_or_create(name=pd['name'], defaults=pd)
        p.assigned_team.set([employee, manager])
        projects.append(p)
        print(f"  [+] Project: {p.name} ({p.currency})")

    # 4. Create Tasks
    tasks_data = [
        {
            'title': 'Design high-fidelity UI kit and theme tokens',
            'description': 'Establish consistent typography, button states, and dark mode palette.',
            'project': projects[0],
            'assigned_to': employee,
            'priority': 'high',
            'status': 'completed',
            'due_date': today - timedelta(days=10),
            'created_by': manager,
        },
        {
            'title': 'Implement API endpoints for project analytics',
            'description': 'Aggregate project completion percentages and generate quarterly reporting payloads.',
            'project': projects[0],
            'assigned_to': employee,
            'priority': 'high',
            'status': 'in_progress',
            'due_date': today + timedelta(days=5),
            'created_by': manager,
        },
        {
            'title': 'Configure HIPAA-compliant file upload encryption',
            'description': 'Validate client document encryption at rest and in transit.',
            'project': projects[1],
            'assigned_to': employee,
            'priority': 'urgent',
            'status': 'in_progress',
            'due_date': today + timedelta(days=3),
            'created_by': manager,
        },
        {
            'title': 'Conduct end-to-end user acceptance testing',
            'description': 'Run verification suite across desktop and mobile responsive breakpoints.',
            'project': projects[1],
            'assigned_to': employee,
            'priority': 'medium',
            'status': 'review',
            'due_date': today + timedelta(days=12),
            'created_by': manager,
        },
        {
            'title': 'Draft data pipeline architecture specifications',
            'description': 'Architect schema diagrams and message queue throughput estimates.',
            'project': projects[2],
            'assigned_to': employee,
            'priority': 'medium',
            'status': 'pending',
            'due_date': today + timedelta(days=25),
            'created_by': manager,
        },
    ]

    for td in tasks_data:
        t, created = Task.objects.get_or_create(title=td['title'], defaults=td)
        if created:
            TaskComment.objects.create(
                task=t,
                user=manager,
                comment="Assigned for delivery in Current Sprint. Let me know if blockers arise."
            )
        print(f"  [+] Task: {t.title} [{t.status}]")

    # 5. Create Invoices
    inv1, _ = Invoice.objects.update_or_create(
        invoice_number='INV-2026-0001',
        defaults={
            'client': clients[0],
            'project': projects[0],
            'invoice_date': today - timedelta(days=25),
            'due_date': today - timedelta(days=5),
            'items': [
                {'name': 'Sprint 1 Architecture & Design', 'description': 'Wireframes and tech stack setup', 'quantity': 1, 'unit_price': 15000.0, 'amount': 15000.0},
                {'name': 'Frontend Boilerplate Delivery', 'description': 'React & Vite build configuration', 'quantity': 1, 'unit_price': 8000.0, 'amount': 8000.0},
            ],
            'subtotal': Decimal('23000.00'),
            'tax_percent': Decimal('5.00'),
            'tax': Decimal('1150.00'),
            'total': Decimal('24150.00'),
            'paid_amount': Decimal('24150.00'),
            'currency': 'USD',
            'currency_symbol': '$',
            'status': 'paid',
            'created_by': accountant,
        }
    )

    inv2, _ = Invoice.objects.update_or_create(
        invoice_number='INV-2026-0002',
        defaults={
            'client': clients[1],
            'project': projects[1],
            'invoice_date': today - timedelta(days=15),
            'due_date': today + timedelta(days=15),
            'items': [
                {'name': 'Milestone 2 Mobile Core Engineering', 'description': 'Biometric authentication & video streaming', 'quantity': 1, 'unit_price': 35000.0, 'amount': 35000.0},
            ],
            'subtotal': Decimal('35000.00'),
            'tax_percent': Decimal('5.00'),
            'tax': Decimal('1750.00'),
            'total': Decimal('36750.00'),
            'paid_amount': Decimal('18000.00'),
            'currency': 'GBP',
            'currency_symbol': '£',
            'status': 'partially_paid',
            'created_by': accountant,
        }
    )

    inv3, _ = Invoice.objects.update_or_create(
        invoice_number='INV-2026-0003',
        defaults={
            'client': clients[3],
            'project': projects[2],
            'invoice_date': today - timedelta(days=5),
            'due_date': today + timedelta(days=25),
            'items': [
                {'name': 'Project Initiation Retainer', 'description': 'Discovery workshop and technical roadmap', 'quantity': 1, 'unit_price': 12000.0, 'amount': 12000.0},
            ],
            'subtotal': Decimal('12000.00'),
            'tax_percent': Decimal('0.00'),
            'tax': Decimal('0.00'),
            'total': Decimal('12000.00'),
            'paid_amount': Decimal('0.00'),
            'currency': 'EUR',
            'currency_symbol': '€',
            'status': 'sent',
            'created_by': accountant,
        }
    )

    inv4, _ = Invoice.objects.update_or_create(
        invoice_number='INV-2026-0004',
        defaults={
            'client': clients[2],
            'invoice_date': today - timedelta(days=40),
            'due_date': today - timedelta(days=10),
            'items': [
                {'name': 'Strategic Technical Audit', 'description': 'Comprehensive security penetration review', 'quantity': 1, 'unit_price': 750000.0, 'amount': 750000.0},
            ],
            'subtotal': Decimal('750000.00'),
            'tax_percent': Decimal('18.00'),
            'tax': Decimal('135000.00'),
            'total': Decimal('885000.00'),
            'paid_amount': Decimal('0.00'),
            'currency': 'INR',
            'currency_symbol': '₹',
            'status': 'overdue',
            'created_by': accountant,
        }
    )
    print("  [+] Invoices created (USD, GBP, EUR, INR)")

    # 6. Create Payments
    p1, _ = Payment.objects.update_or_create(
        transaction_id='TXN-WIRE-98231',
        defaults={
            'client': clients[0],
            'project': projects[0],
            'invoice': inv1,
            'amount': Decimal('24150.00'),
            'currency': 'USD',
            'currency_symbol': '$',
            'payment_method': 'bank_transfer',
            'payment_date': today - timedelta(days=6),
            'recorded_by': accountant,
            'notes': 'Settled via ACH Transfer in USD.',
        }
    )

    p2, _ = Payment.objects.update_or_create(
        transaction_id='TXN-CARD-44102',
        defaults={
            'client': clients[1],
            'project': projects[1],
            'invoice': inv2,
            'amount': Decimal('18000.00'),
            'currency': 'GBP',
            'currency_symbol': '£',
            'payment_method': 'card',
            'payment_date': today - timedelta(days=2),
            'recorded_by': accountant,
            'notes': '50% upfront deposit received in British Pounds.',
        }
    )
    print("  [+] Recorded Payment transactions")

    # 7. Create Activities
    activities = [
        {
            'user': admin,
            'action': 'created',
            'entity_type': 'project',
            'entity_name': 'NextGen SaaS Platform Overhaul',
            'description': 'Created project NextGen SaaS Platform Overhaul for NovaTech Solutions',
        },
        {
            'user': manager,
            'action': 'assigned',
            'entity_type': 'task',
            'entity_name': 'Implement API endpoints for project analytics',
            'description': 'Assigned task to Elena Rostova',
        },
        {
            'user': accountant,
            'action': 'created',
            'entity_type': 'invoice',
            'entity_name': 'INV-2026-0002',
            'description': 'Issued Invoice #INV-2026-0002 for $36,750.00 to Aura Health Systems',
        },
        {
            'user': accountant,
            'action': 'created',
            'entity_type': 'payment',
            'entity_name': 'TXN-CARD-44102',
            'description': 'Recorded payment of $18,000.00 from Aura Health Systems',
        },
        {
            'user': employee,
            'action': 'status_changed',
            'entity_type': 'task',
            'entity_name': 'Design high-fidelity UI kit and theme tokens',
            'description': 'Marked task as Completed',
        },
    ]

    for a in activities:
        Activity.objects.create(**a)
    print("  [+] Activity audit records created")

    # 8. Create Notifications
    notifications = [
        {
            'recipient': admin,
            'notification_type': 'payment_received',
            'title': 'New Payment Received',
            'message': 'A payment of $18,000.00 from Aura Health Systems has been recorded.',
            'related_entity_type': 'payment',
            'is_read': False,
        },
        {
            'recipient': manager,
            'notification_type': 'task_completed',
            'title': 'Task Moved to Review',
            'message': 'Elena Rostova moved "Conduct end-to-end user acceptance testing" to review.',
            'related_entity_type': 'task',
            'is_read': False,
        },
        {
            'recipient': employee,
            'notification_type': 'task_assigned',
            'title': 'New Task Assigned',
            'message': 'You have been assigned to "Implement API endpoints for project analytics".',
            'related_entity_type': 'task',
            'is_read': False,
        },
        {
            'recipient': accountant,
            'notification_type': 'payment_overdue',
            'title': 'Invoice Past Due',
            'message': 'Invoice #INV-2026-0004 for Apex Horizon Capital is now overdue.',
            'related_entity_type': 'invoice',
            'is_read': False,
        },
    ]

    for n in notifications:
        Notification.objects.create(**n)
    print("  [+] System notifications created")

    print("\n[SUCCESS] Seed complete! Default accounts ready:")
    print("  - Admin:      admin@clientify.com      / Admin@12345")
    print("  - Manager:    manager@clientify.com    / Manager@12345")
    print("  - Accountant: accountant@clientify.com / Accountant@12345")
    print("  - Employee:   employee@clientify.com   / Employee@12345")


if __name__ == '__main__':
    seed()
