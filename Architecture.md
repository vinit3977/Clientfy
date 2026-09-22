# FreelanceFlow — System Architecture

## 1. Overview

FreelanceFlow follows a **modular full-stack architecture** designed to separate the user interface, business logic, API layer, and data storage.

The system is designed around a central idea:

> **Connect the complete freelance business lifecycle through a single application.**

The primary workflow is:

```text
Client
  ↓
Proposal
  ↓
Project
  ↓
Tasks
  ↓
Invoice
  ↓
Payment
```

The architecture ensures that these entities are related rather than functioning as isolated modules.

---

# 2. High-Level Architecture

```text
                         ┌──────────────────────┐
                         │        USER          │
                         │   Freelancer / Admin │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      React App       │
                         │      Frontend        │
                         └──────────┬───────────┘
                                    │
                              HTTP / REST
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    Express Server    │
                         │       Backend        │
                         └──────────┬───────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 ▼                  ▼                  ▼
          Authentication      Business Logic       Validation
                 │                  │                  │
                 └──────────────────┼──────────────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ PostgreSQL /         │
                         │ Supabase Database    │
                         └──────────────────────┘
```

---

# 3. Architectural Layers

FreelanceFlow is divided into four primary layers.

```text
┌─────────────────────────────────────┐
│          Presentation Layer         │
│              React                  │
├─────────────────────────────────────┤
│             API Layer               │
│          Express / REST             │
├─────────────────────────────────────┤
│          Business Layer             │
│      Services + Business Logic      │
├─────────────────────────────────────┤
│           Data Layer                │
│       PostgreSQL / Supabase         │
└─────────────────────────────────────┘
```

Each layer has a specific responsibility.

---

# 4. Frontend Architecture

The frontend is responsible for displaying the application and interacting with the backend API.

### Technology

* React
* React Router
* CSS / Tailwind CSS
* Axios or Fetch API

### Responsibilities

The frontend handles:

* User interface
* Navigation
* Forms
* Client-side validation
* Application state
* Loading states
* Error states
* API communication
* Dashboard visualization

---

# 5. Frontend Structure

The React application can be organized as follows:

```text
client/
│
├── src/
│   │
│   ├── components/
│   │   ├── Navbar/
│   │   ├── Sidebar/
│   │   ├── DashboardCard/
│   │   ├── ClientCard/
│   │   ├── ProjectCard/
│   │   ├── TaskCard/
│   │   └── InvoiceCard/
│   │
│   ├── pages/
│   │   ├── Login/
│   │   ├── Register/
│   │   ├── Dashboard/
│   │   ├── Clients/
│   │   ├── Projects/
│   │   ├── Proposals/
│   │   ├── Tasks/
│   │   ├── Invoices/
│   │   └── Payments/
│   │
│   ├── services/
│   │   ├── authService.js
│   │   ├── clientService.js
│   │   ├── projectService.js
│   │   ├── proposalService.js
│   │   ├── taskService.js
│   │   ├── invoiceService.js
│   │   └── paymentService.js
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── hooks/
│   │
│   ├── utils/
│   │
│   ├── App.jsx
│   └── main.jsx
│
└── package.json
```

---

# 6. Component Architecture

The application uses reusable components rather than placing all functionality inside individual pages.

For example:

```text
Dashboard
   │
   ├── SummaryCard
   ├── RevenueChart
   ├── ProjectList
   ├── UpcomingDeadlines
   └── RecentActivity
```

The same `ProjectCard` component can be reused in multiple locations:

```text
ProjectCard
    │
    ├── Dashboard
    ├── Projects Page
    └── Client Details
```

This reduces duplication and makes the application easier to maintain.

---

# 7. Backend Architecture

The backend provides REST APIs for the frontend.

### Technology

* Node.js
* Express.js
* PostgreSQL / Supabase
* JWT / Supabase Authentication

The backend is responsible for:

* Authentication verification
* Authorization
* Request validation
* Business logic
* Database operations
* Error handling
* API responses

---

# 8. Backend Structure

```text
server/
│
├── controllers/
│   ├── authController.js
│   ├── clientController.js
│   ├── proposalController.js
│   ├── projectController.js
│   ├── taskController.js
│   ├── invoiceController.js
│   └── paymentController.js
│
├── routes/
│   ├── authRoutes.js
│   ├── clientRoutes.js
│   ├── proposalRoutes.js
│   ├── projectRoutes.js
│   ├── taskRoutes.js
│   ├── invoiceRoutes.js
│   └── paymentRoutes.js
│
├── services/
│   ├── clientService.js
│   ├── projectService.js
│   ├── proposalService.js
│   ├── invoiceService.js
│   └── paymentService.js
│
├── middleware/
│   ├── authMiddleware.js
│   ├── validationMiddleware.js
│   └── errorMiddleware.js
│
├── config/
│   └── database.js
│
└── server.js
```

---

# 9. Request Flow

A typical request follows this path:

```text
User
  │
  ▼
React Component
  │
  ▼
Frontend Service
  │
  ▼
HTTP Request
  │
  ▼
Express Route
  │
  ▼
Authentication Middleware
  │
  ▼
Validation Middleware
  │
  ▼
Controller
  │
  ▼
Service / Business Logic
  │
  ▼
Database
  │
  ▼
Response
  │
  ▼
React UI
```

For example, creating a client:

```text
User fills Client Form
        ↓
ClientForm.jsx
        ↓
clientService.createClient()
        ↓
POST /api/clients
        ↓
authMiddleware
        ↓
clientController
        ↓
clientService
        ↓
PostgreSQL
        ↓
201 Created
        ↓
Client list updated
```

---

# 10. Database Architecture

PostgreSQL is used as the primary relational database.

The database is designed around relationships between the core entities.

```text
                        USERS
                          │
           ┌──────────────┼──────────────┐
           │              │              │
           ▼              ▼              ▼
        CLIENTS       PROPOSALS       NOTIFICATIONS
           │
       ┌───┴───────────┐
       │               │
       ▼               ▼
    PROJECTS        INVOICES
       │               │
       ▼               ▼
     TASKS          PAYMENTS
```

---

# 11. Core Entities

## Users

Represents authenticated FreelanceFlow users.

```text
users
────────────────
id
name
email
profile_picture
created_at
updated_at
```

---

## Clients

Stores client information.

```text
clients
────────────────
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

Relationship:

```text
User 1 ───── N Clients
```

---

## Proposals

Stores potential projects before they are accepted.

```text
proposals
────────────────
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

Relationships:

```text
User   1 ───── N Proposals
Client 1 ───── N Proposals
```

---

## Projects

Represents confirmed freelance work.

```text
projects
────────────────
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

Relationships:

```text
User     1 ───── N Projects
Client   1 ───── N Projects
Proposal 1 ───── 0..1 Project
```

---

## Tasks

Represents individual pieces of project work.

```text
tasks
────────────────
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

Relationship:

```text
Project 1 ───── N Tasks
```

---

## Invoices

Stores billing information.

```text
invoices
────────────────
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

Relationships:

```text
User    1 ───── N Invoices
Client  1 ───── N Invoices
Project 1 ───── N Invoices
```

---

## Payments

Stores payments received against invoices.

```text
payments
────────────────
id
invoice_id
amount
payment_date
payment_method
transaction_reference
notes
created_at
```

Relationship:

```text
Invoice 1 ───── N Payments
```

---

# 12. Entity Relationship Model

The overall relationship can be represented as:

```text
                         ┌──────────────┐
                         │     USER     │
                         └──────┬───────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
                    ▼           ▼           ▼
                CLIENTS     PROPOSALS    PROJECTS
                    │           │           │
                    │           │           ▼
                    │           └──────► PROJECT
                    │                       │
                    │                       ▼
                    │                     TASKS
                    │
                    └──────────────────► INVOICES
                                           │
                                           ▼
                                        PAYMENTS
```

---

# 13. Authentication Architecture

Authentication protects the user's workspace.

The authentication flow is:

```text
User
  │
  ▼
Login / Register
  │
  ▼
Authentication Provider
  │
  ▼
Session / Token
  │
  ▼
Frontend Auth State
  │
  ▼
Protected API Request
  │
  ▼
Auth Middleware
  │
  ▼
Authorized Resource
```

Every protected request should identify the authenticated user.

For example:

```text
GET /api/projects
Authorization: Bearer <token>
```

The backend verifies the token before accessing project data.

---

# 14. Authorization

Authentication answers:

> Who is the user?

Authorization answers:

> What is the user allowed to access?

FreelanceFlow follows an ownership-based authorization model.

Example:

```text
Project.user_id
        =
AuthenticatedUser.id
```

A user should only be able to access projects belonging to their account.

This rule applies to:

* Clients
* Proposals
* Projects
* Tasks
* Invoices
* Payments

---

# 15. API Architecture

The API follows REST principles.

### Clients

```text
GET    /api/clients
POST   /api/clients
GET    /api/clients/:id
PUT    /api/clients/:id
DELETE /api/clients/:id
```

### Proposals

```text
GET    /api/proposals
POST   /api/proposals
GET    /api/proposals/:id
PUT    /api/proposals/:id
DELETE /api/proposals/:id
```

### Projects

```text
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
```

### Tasks

```text
GET    /api/projects/:id/tasks
POST   /api/projects/:id/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

### Invoices

```text
GET    /api/invoices
POST   /api/invoices
GET    /api/invoices/:id
PUT    /api/invoices/:id
DELETE /api/invoices/:id
```

### Payments

```text
GET    /api/invoices/:id/payments
POST   /api/invoices/:id/payments
```

---

# 16. Business Logic Architecture

The application does not rely entirely on simple CRUD operations.

Important business rules are handled in the service layer.

---

## Proposal Acceptance

```text
Proposal
   │
   ▼
Status = ACCEPTED
   │
   ▼
Create Project
   │
   ▼
Link Project to Proposal
```

This creates continuity between the proposal and project.

---

## Invoice Payment Calculation

```text
Invoice Total
      │
      ▼
SUM(Payments)
      │
      ▼
Amount Paid
      │
      ▼
Remaining Amount
```

Status:

```text
Paid Amount = 0
      ↓
PENDING

Paid Amount > 0
      ↓
PARTIALLY_PAID

Paid Amount >= Invoice Total
      ↓
PAID
```

---

# 17. Dashboard Architecture

The dashboard should not store statistics as independent values.

Instead, dashboard metrics are calculated from actual application data.

```text
                     DATABASE
                         │
          ┌──────────────┼──────────────┐
          │              │              │
       Projects        Tasks         Payments
          │              │              │
          └──────────────┼──────────────┘
                         │
                         ▼
                Dashboard Service
                         │
                         ▼
                  Dashboard API
                         │
                         ▼
                  React Dashboard
```

---

# 18. Dashboard Metrics

### Active Projects

```text
COUNT(projects)
WHERE status = 'ACTIVE'
```

### Pending Payments

```text
SUM(invoice.total - payments_received)
```

### Monthly Revenue

```text
SUM(payments.amount)
WHERE payment_date
belongs to current month
```

### Overdue Tasks

```text
COUNT(tasks)
WHERE due_date < CURRENT_DATE
AND status != 'COMPLETED'
```

---

# 19. Error Handling

Errors should be handled consistently across the application.

Example API response:

```json
{
  "success": false,
  "message": "Project not found"
}
```

Common HTTP status codes:

```text
200 → Successful request
201 → Resource created
400 → Invalid request
401 → Authentication required
403 → Access denied
404 → Resource not found
409 → Conflict
500 → Server error
```

The frontend should display user-friendly error messages instead of exposing internal server information.

---

# 20. Validation

Validation should occur at appropriate layers.

### Frontend validation

Used for immediate user feedback.

Examples:

```text
Required field
Valid email
Positive amount
Valid date
```

### Backend validation

Used as the authoritative validation layer.

The backend must never assume that frontend validation was performed.

---

# 21. Security Architecture

Security is applied across multiple layers.

```text
Frontend
   ↓
Authentication
   ↓
Authorization
   ↓
Input Validation
   ↓
Backend
   ↓
Database Security
```

Security measures include:

* Authentication
* Authorization
* Input validation
* Protected API routes
* Ownership checks
* Environment variables
* Secure credential handling
* Database access policies

Sensitive credentials must never be stored in source code.

---

# 22. Environment Configuration

Environment-specific values should be stored outside the source code.

Example:

```env
PORT=5000

DATABASE_URL=

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

The `.env` file must never be committed.

A `.env.example` file can document the required variables without exposing credentials.

---

# 23. Scalability

The initial system is designed as a modular monolith.

```text
React Frontend
       │
       ▼
Express Backend
       │
       ▼
PostgreSQL
```

This architecture is appropriate for the initial application because it keeps development and deployment relatively simple.

As the platform grows, individual services can be separated if necessary.

Potential future services include:

```text
Authentication Service
Notification Service
Payment Service
Analytics Service
File Storage Service
```

However, these should only be separated when there is a practical need.

---

# 24. Future Client Portal Architecture

A future version can introduce a second user type.

```text
                    FreelanceFlow
                         │
              ┌──────────┴──────────┐
              │                     │
         Freelancer               Client
              │                     │
              ▼                     ▼
       Freelancer Dashboard    Client Portal
```

Clients could access:

* Project status
* Proposal approvals
* Shared files
* Invoices
* Payment information
* Comments
* Deliverables

---

# 25. Future Notification Architecture

The notification system can monitor important events.

```text
Database Event
      │
      ▼
Notification Service
      │
      ├── In-App Notification
      │
      ├── Email
      │
      └── Reminder
```

Examples:

```text
Invoice due tomorrow
Project deadline approaching
Proposal accepted
Payment received
Task overdue
```

---

# 26. Deployment Architecture

A possible production architecture:

```text
                    INTERNET
                       │
                       ▼
                React Frontend
                       │
                       ▼
                Express Backend
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
        PostgreSQL          File Storage
             │
             ▼
          Backups
```

The frontend and backend can be deployed independently.

---

# 27. Development Architecture

During development:

```text
localhost:5173
       │
       │ HTTP
       ▼
localhost:5000
       │
       ▼
Supabase / PostgreSQL
```

Example:

```text
Frontend
http://localhost:5173

Backend
http://localhost:5000
```

---

# 28. Architectural Principles

FreelanceFlow follows these principles:

### Separation of Concerns

Each layer has a defined responsibility.

### Modularity

Features should be developed as independent modules.

### Reusability

Common components and services should be reused.

### Security by Design

Authentication and authorization should be considered from the beginning.

### Data Integrity

Relationships and business rules should be enforced consistently.

### Scalability

The architecture should allow new modules to be added without rewriting the entire system.

---

# 29. Complete System Flow

The complete FreelanceFlow architecture can be summarized as:

```text
                         USER
                           │
                           ▼
                    React Frontend
                           │
                    REST API Requests
                           │
                           ▼
                   Express Backend
                           │
                ┌──────────┴──────────┐
                │                     │
         Authentication          Controllers
                │                     │
                │                Service Layer
                │                     │
                └──────────┬──────────┘
                           │
                           ▼
                    PostgreSQL
                           │
              ┌────────────┼────────────┐
              │            │            │
           Clients      Projects      Invoices
              │            │            │
           Proposals      Tasks       Payments
              │            │            │
              └────────────┼────────────┘
                           │
                           ▼
                    Dashboard Data
                           │
                           ▼
                     React UI
```

---

# 30. Architecture Goal

The goal of FreelanceFlow's architecture is not simply to connect a frontend to a database.

It is to create a system where the major parts of freelance work are connected through well-defined relationships and business rules.

```text
Lead
 ↓
Client
 ↓
Proposal
 ↓
Project
 ↓
Task
 ↓
Invoice
 ↓
Payment
 ↓
Analytics
```

Each stage produces data that can be used by the next stage.

This connected workflow forms the architectural foundation of FreelanceFlow.

---

**FreelanceFlow**

> **Plan the work. Manage the project. Get paid.**
