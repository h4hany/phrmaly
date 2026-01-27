# Backend Requirements - Index

## Overview
This directory contains comprehensive backend requirements documentation for the Pharmacy Management System frontend. The documentation is organized by business domain for easy navigation.

---

## Document Structure

### Core Modules

1. **[01-authentication-users.md](./01-authentication-users.md)**
   - Authentication & authorization
   - User management
   - Permission system
   - Role-based access control

2. **[02-products-categories.md](./02-products-categories.md)**
   - General drugs (global catalog)
   - Pharmacy-specific drugs
   - Drug bundles
   - Barcode management

3. **[03-inventory-stock.md](./03-inventory-stock.md)**
   - Inventory alerts
   - Stock movements
   - Inventory transfers
   - Risk monitoring
   - Requested products

4. **[04-suppliers.md](./04-suppliers.md)**
   - Supplier management
   - Supplier payments
   - Supplier types and status

5. **[05-sales-invoices-pos.md](./05-sales-invoices-pos.md)**
   - Invoice management
   - Point of Sale (POS)
   - Payment processing
   - Voucher system

6. **[06-reports-analytics.md](./06-reports-analytics.md)**
   - Sales reports
   - Inventory reports
   - Financial reports
   - Patient reports
   - Support tickets

7. **[07-admin-settings.md](./07-admin-settings.md)**
   - Account settings
   - System configuration
   - Feature flags
   - Audit logs
   - Migration tools

8. **[08-platform-super-admin.md](./08-platform-super-admin.md)**
   - Platform account management
   - Subscription management
   - Platform catalog
   - Platform analytics
   - Risk management
   - Admin user management

9. **[09-hr-payroll.md](./09-hr-payroll.md)**
   - Attendance management
   - Payroll processing
   - Performance tracking
   - Training & certification
   - HR approvals

10. **[10-purchases.md](./10-purchases.md)**
    - Purchase invoice management
    - Purchase items
    - Payment tracking
    - Stock receipt

11. **[11-patients.md](./11-patients.md)**
    - Patient management
    - Patient cards
    - Patient analytics
    - Patient loyalty

12. **[12-common-requirements.md](./12-common-requirements.md)**
    - Pagination
    - File uploads
    - Barcode scanning
    - Search & filtering
    - Real-time updates
    - Error handling

---

## Quick Reference

### API Base URL
- **Base Path**: `/api`
- **Authentication**: Bearer token in `Authorization` header
- **Content-Type**: `application/json` (except file uploads)

### Common Endpoints Pattern
- `GET /api/{resource}` - List resources (paginated)
- `GET /api/{resource}/:id` - Get single resource
- `POST /api/{resource}` - Create resource
- `PUT /api/{resource}/:id` - Update resource
- `DELETE /api/{resource}/:id` - Delete resource

### Standard Query Parameters
- `page`: number (default: 1)
- `pageSize`: number (default: 10)
- `sortBy`: string
- `sortOrder`: 'asc' | 'desc'
- `search`: string
- `startDate`: ISO date string
- `endDate`: ISO date string

### Authentication
- **Token Type**: JWT
- **Header**: `Authorization: Bearer <token>`
- **Storage**: Frontend stores in `localStorage` as `auth_token`

---

## Key Features Summary

### Multi-Tenancy
- All data is pharmacy-scoped
- Platform-level data for super admin
- Proper data isolation required

### Roles & Permissions
- Multiple user roles (Account Owner, Manager, Staff, etc.)
- Permission-based access control
- Module-based feature access

### Inventory Management
- Real-time stock tracking
- Cost layers (FIFO/AVERAGE)
- Movement tracking with risk scoring
- Multi-branch transfers

### Financial Management
- Sales invoices (POS)
- Purchase invoices
- Payment tracking
- Voucher system

### HR & Payroll
- Attendance tracking
- Payroll calculation
- Performance metrics
- Training & certification

### Platform Management
- Multi-account management
- Subscription management
- Platform analytics
- Risk monitoring

---

## Missing Requirements

Each document includes a "Missing/Unclear Requirements" section identifying:
- Features implied but not explicitly implemented
- Integration points not fully defined
- Configuration options not visible in frontend
- Business rules that need clarification

---

## Implementation Notes

1. **Current State**: Frontend uses mock data services
2. **Migration Path**: Replace mock services with real API calls
3. **Data Models**: All TypeScript interfaces are documented
4. **API Contracts**: All endpoints, methods, and payloads are specified
5. **Business Rules**: Critical business logic is documented

---

## Next Steps

1. Review each module document
2. Prioritize implementation based on business needs
3. Design database schema based on data models
4. Implement API endpoints following contracts
5. Add missing requirements based on business needs
6. Set up authentication and authorization
7. Implement file upload and storage
8. Set up real-time updates (WebSocket/SSE)
9. Configure caching and performance optimization
10. Set up monitoring and logging

---

## Contact

For questions or clarifications, refer to the individual module documents or the frontend codebase for implementation details.



