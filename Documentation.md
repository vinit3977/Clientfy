# Clientify — Technical Documentation

## 1. Project Overview

Clientify is a full-stack business management platform for freelancers and independent professionals.

The application manages the complete freelance workflow:

```text
Lead → Proposal → Project → Tasks → Invoice → Payment
```

The goal is to provide a centralized system for managing both the **operational** and **financial** aspects of freelance work.

---

# 2. Problem Statement

Freelancers frequently manage their business using several disconnected tools.

For example:

* Client information may be stored in contacts.
* Tasks may be maintained in a task application.
* Deadlines may exist in a calendar.
* Proposals may be created in documents.
* Invoices may be maintained separately.
* Payments may be tracked through spreadsheets.

This fragmentation makes it difficult to understand the overall state of a freelance business.

Clientify addresses this problem by connecting these workflows through a centralized application.

---

# 3. Objectives

The primary objectives are:

1. Centralize freelancer business information.
2. Connect clients with projects and proposals.
3. Track project tasks and deadlines.
4. Manage invoices and payments.
5. Provide business-level analytics.
6. Reduce manual administrative work.
7. Provide a scalable full-stack architecture.

---

# 4. System Modules

## 4.1 Authentication Module

Responsible for:

* Registration
* Login
* Logout
* Session management
* Protected routes
* Authorization

Each authenticated user owns their own freelance workspace.

---

## 4.2 Client Module

Stores information about clients.

### Example fields

```text
id
user_id
name
email
phone
company
address
notes
created_at
updated_at
```

### Relationships

```text
User
 ↓
Clients
 ↓
Projects
Proposals
Invoices
```

---

# 4.3 Proposal Module

Proposals represent potential work before a project is officially created.

### Example fields

```text
id
user_id
client_id
title
description
budget
status
sent_at
expires_at
created_at
updated_at
```

### Proposal states

```text
DRAFT
SENT
NEGOTIATION
ACCEPTED
REJECTED
EXPIRED
```

---

# 4.4 Project Module

Projects represent confirmed freelance work.

### Example fields

```text
id
user_id
client_id
proposal_id
name
description
budget
status
start_date
deadline
created_at
updated_at
```

### Project states

```text
PLANNING
ACTIVE
ON_HOLD
COMPLETED
CANCELLED
```

---

# 4.5 Task Module

Tasks divide projects into smaller pieces of work.

### Example fields

```text
id
project_id
title
description
priority
status
due_date
estimated_hours
actual_hours
created_at
updated_at
```

### Task states

```text
TODO
IN_PROGRESS
COMPLETED
CANCELLED
```

---

# 4.6 Invoice Module

Invoices represent amounts owed by clients.

### Example fields

```text
id
user_id
client_id
project_id
invoice_number
issue_date
due_date
subtotal
tax
total
status
created_at
updated_at
```

### Invoice states

```text
DRAFT
SENT
PARTIALLY_PAID
PAID
OVERDUE
CANCELLED
```

---

# 4.7 Payment Module

Payments represent money received against invoices.

### Example fields

```text
id
invoice_id
amount
payment_date
payment_method
transaction_reference
notes
created_at
```

Multiple payments can belong to one invoice.

Example:

```text
Invoice = ₹50,000

Payment 1 = ₹20,000
Payment 2 = ₹15,000
Payment 3 = ₹15,000

Total paid = ₹50,000
```

The invoice can therefore be marked as:

```text
PAID
```

---

# 5. Database Relationships

The primary relationship structure is:

```text
USER
 │
 ├────────────── CLIENT
 │                  │
 │                  ├──── PROJECT
 │                  │        │
 │                  │        └──── TASK
 │                  │
 │                  ├──── PROPOSAL
 │                  │
 │                  └──── INVOICE
 │                            │
 │                            └──── PAYMENT
 │
 └────────────── NOTIFICATION
```

---

# 6. Business Logic

Clientify contains business rules in addition to basic CRUD operations.

## Proposal → Project

When a proposal is accepted:

```text
Proposal.status = ACCEPTED
              ↓
Project created
              ↓
Proposal linked to Project
```

---

## Invoice → Payment

When a payment is recorded:

```text
Total Paid = SUM(all payments)
```

Then:

```text
IF Total Paid >= Invoice Total
    Invoice = PAID

ELSE IF Total Paid > 0
    Invoice = PARTIALLY_PAID

ELSE
    Invoice = PENDING
```

---

## Deadline Detection

A task is considered overdue when:

```text
due_date < current_date
AND
status != COMPLETED
```

The dashboard can then calculate:

```text
Overdue Tasks = COUNT(overdue tasks)
```

---

# 7. Dashboard Calculations

The dashboard should derive its values from actual database records.

### Active Projects

```text
COUNT(projects)
WHERE status = ACTIVE
```

### Pending Payments

```text
SUM(invoice.total - amount_paid)
WHERE invoice is not fully paid
```

### Monthly Revenue

```text
SUM(payments.amount)
WHERE payment_date
falls within current month
```

### Overdue Tasks

```text
COUNT(tasks)
WHERE due_date < today
AND status != COMPLETED
```

This prevents dashboard numbers from being manually maintained.

---

# 8. API Structure

The backend can expose REST endpoints such as:

```text
/api/auth
/api/clients
/api/proposals
/api/projects
/api/tasks
/api/invoices
/api/payments
/api/dashboard
```

Example:

```text
GET    /api/clients
POST   /api/clients
GET    /api/clients/:id
PUT    /api/clients/:id
DELETE /api/clients/:id
```

Projects:

```text
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
```

Tasks:

```text
GET    /api/projects/:id/tasks
POST   /api/projects/:id/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

---

# 9. Frontend Architecture

A possible React structure:

```text
src/
│
├── components/
│   ├── Navbar/
│   ├── Sidebar/
│   ├── DashboardCard/
│   ├── ProjectCard/
│   ├── ClientCard/
│   └── TaskCard/
│
├── pages/
│   ├── Login/
│   ├── Register/
│   ├── Dashboard/
│   ├── Clients/
│   ├── Projects/
│   ├── Proposals/
│   ├── Tasks/
│   ├── Invoices/
│   └── Payments/
│
├── services/
│   ├── authService.js
│   ├── clientService.js
│   ├── projectService.js
│   ├── proposalService.js
│   ├── taskService.js
│   ├── invoiceService.js
│   └── paymentService.js
│
├── context/
│   └── AuthContext.jsx
│
├── hooks/
│
├── utils/
│
├── App.jsx
└── main.jsx
```

---

# 10. Backend Architecture

```text
server/
│
├── controllers/
│   ├── clientController.js
│   ├── projectController.js
│   ├── proposalController.js
│   ├── taskController.js
│   ├── invoiceController.js
│   └── paymentController.js
│
├── routes/
│   ├── clientRoutes.js
│   ├── projectRoutes.js
│   ├── proposalRoutes.js
│   ├── taskRoutes.js
│   ├── invoiceRoutes.js
│   └── paymentRoutes.js
│
├── middleware/
│   ├── authMiddleware.js
│   └── errorMiddleware.js
│
├── services/
│
├── config/
│
└── server.js
```

---

# 11. Security Design

Every business record should be associated with the authenticated user.

For example:

```text
clients.user_id = authenticated_user.id
```

When fetching clients:

```text
WHERE user_id = authenticated_user.id
```

This ensures one freelancer cannot access another freelancer's clients.

Additional measures:

* Authentication middleware
* Authorization checks
* Input validation
* SQL injection protection
* Environment variables
* Secure password handling through authentication provider
* Database-level security policies

---

# 12. Future Architecture

Future versions can introduce:

### Client Portal

Clients could log in and:

* View projects
* Review proposals
* Approve work
* View invoices
* Make payments
* Leave feedback

### Time Tracking

```text
Project
 ↓
Start Timer
 ↓
Work
 ↓
Stop Timer
 ↓
Hours Logged
```

### Notifications

Examples:

```text
⚠ Invoice due tomorrow

⚠ Project deadline in 2 days

✓ Payment received

✓ Proposal accepted
```

---

# 13. Analytics

Future analytics can include:

### Revenue

```text
Monthly Revenue
January     ₹45K
February    ₹62K
March       ₹78K
April       ₹91K
```

### Client profitability

```text
Client A
Revenue: ₹90K
Hours: 42
Effective rate: ₹2,143/hour
```

### Proposal conversion

```text
Proposals Sent: 20
Accepted: 12

Conversion Rate = 60%
```

These metrics can help freelancers understand the performance of their business.

---

# 14. Development Roadmap

## Phase 1

* Project initialization
* Authentication
* Database setup
* Basic layout
* Protected routes

## Phase 2

* Client management
* Project management
* Task management

## Phase 3

* Proposal workflow
* Invoice system
* Payment tracking

## Phase 4

* Dashboard analytics
* Notifications
* Search and filtering

## Phase 5

* Client portal
* Time tracking
* Reports
* Advanced analytics

---

# 15. Definition of Done

A feature is considered complete when:

* Frontend UI exists
* Backend endpoint exists
* Database integration works
* Authentication is enforced
* Validation is implemented
* Error states are handled
* Loading states are handled
* Data persists correctly
* Related modules update correctly

---

# 16. Final Product Vision

Clientify is intended to evolve from a basic freelancer management application into a complete operating system for independent professionals.

The central philosophy is:

```text
Don't just track freelance work.

Connect the entire business.
```

From:

```text
Finding a client
      ↓
Winning the project
      ↓
Doing the work
      ↓
Tracking the deadline
      ↓
Sending the invoice
      ↓
Receiving the payment
      ↓
Understanding the business
```

Clientify aims to make that entire journey visible from one workspace.
