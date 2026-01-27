# Suppliers - Backend Requirements

## Overview
Supplier management system for tracking manufacturers and warehouses, managing supplier relationships, and handling supplier payments.

---

## Features

### 1. Supplier Management
- Supplier CRUD operations
- Supplier types (manufacturer, warehouse)
- Supplier status management (active, inactive)
- Supplier contact information
- Supplier notes and history

### 2. Supplier Payments
- Track payments to suppliers
- Link payments to purchase invoices
- Payment method tracking
- Payment history

---

## API Contracts

### Supplier Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/suppliers` | List suppliers | User | Query params | `PaginatedResponse<Supplier>` |
| GET | `/api/suppliers/:id` | Get supplier by ID | User | - | `Supplier` |
| POST | `/api/suppliers` | Create supplier | User | `Omit<Supplier, 'id'\|'createdAt'\|'updatedAt'>` | `Supplier` |
| PUT | `/api/suppliers/:id` | Update supplier | User | `Partial<Supplier>` | `Supplier` |
| DELETE | `/api/suppliers/:id` | Delete supplier | User | - | `{ success: boolean }` |
| GET | `/api/suppliers/search` | Search suppliers | User | `?q=string` | `Supplier[]` |
| GET | `/api/suppliers/filter/type` | Filter by type | User | `?type=manufacturer\|warehouse` | `Supplier[]` |
| GET | `/api/suppliers/filter/status` | Filter by status | User | `?status=active\|inactive` | `Supplier[]` |

### Supplier Payment Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/suppliers/:supplierId/payments` | List supplier payments | User | Query params | `SupplierPayment[]` |
| GET | `/api/suppliers/payments/:id` | Get payment by ID | User | - | `SupplierPayment` |
| POST | `/api/suppliers/payments` | Create payment | User | `Omit<SupplierPayment, 'id'\|'createdAt'>` | `SupplierPayment` |
| PUT | `/api/suppliers/payments/:id` | Update payment | User | `Partial<SupplierPayment>` | `SupplierPayment` |
| DELETE | `/api/suppliers/payments/:id` | Delete payment | User | - | `{ success: boolean }` |

---

## Data Models

### Supplier
```typescript
interface Supplier {
  id: string;
  name: string;
  type: SupplierType;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}
```

**SupplierType:**
- `manufacturer` - Drug manufacturer
- `warehouse` - Wholesale warehouse/distributor

### SupplierPayment
```typescript
interface SupplierPayment {
  id: string;
  supplierId: string;
  purchaseInvoiceId?: string; // Optional link to purchase invoice
  amount: number;
  paymentDate: Date;
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'other';
  notes?: string;
  createdAt: Date;
}
```

---

## Query Parameters

### Pagination
- `page`: number (default: 1)
- `pageSize`: number (default: 10)
- `sortBy`: string (optional)
- `sortOrder`: 'asc' | 'desc' (optional)

### Filters
- `pharmacyId`: string (implicit from user context)
- `type`: 'manufacturer' | 'warehouse'
- `status`: 'active' | 'inactive'
- `search`: string (search by name, email, phone)

---

## Business Rules

### Supplier Management
- Suppliers can be shared across pharmacies (same supplier, different relationships)
- Supplier status affects purchase invoice creation
- Inactive suppliers should not be selectable in new purchases

### Supplier Payments
- Payments can be linked to purchase invoices
- Payments can be standalone (advance payments, etc.)
- Payment method affects accounting records

---

## Missing/Unclear Requirements

1. **Supplier Rating**: No supplier rating/performance system
2. **Supplier Contracts**: No contract management (terms, pricing agreements)
3. **Supplier Credit Terms**: No credit limit or payment terms tracking
4. **Supplier Performance Metrics**: No metrics (on-time delivery, quality, etc.)
5. **Supplier Categories**: No categorization beyond type
6. **Supplier Documents**: No document upload (contracts, certificates)
7. **Supplier Contacts**: No multiple contacts per supplier
8. **Supplier Addresses**: Single address field, no multiple locations
9. **Supplier Tax Information**: No tax ID or tax-related fields
10. **Supplier Payment Terms**: No payment terms (net 30, net 60, etc.)

---

## Notes

- Suppliers are linked to purchases (see Purchases module)
- Supplier payments are separate from purchase invoice payments
- Frontend uses mock data; all endpoints need implementation



