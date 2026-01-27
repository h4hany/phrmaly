# Purchases - Backend Requirements

## Overview
Purchase management system for procurement, supplier invoice tracking, payment management, and stock receipt processing.

---

## Features

### 1. Purchase Invoice Management
- Create, edit, and delete purchase invoices
- Purchase invoice numbering
- Supplier association
- Multiple items per purchase
- Payment status tracking
- Due date management
- Stock receipt processing

### 2. Purchase Items
- Add/remove items from purchase
- Quantity and unit cost tracking
- Total cost calculation
- Link to pharmacy drugs

### 3. Payment Management
- Track payments against purchase invoices
- Partial payment support
- Payment method tracking
- Payment history

---

## API Contracts

### Purchase Invoice Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/purchases` | List purchase invoices | User | Query params | `PaginatedResponse<PurchaseInvoice>` |
| GET | `/api/purchases/:id` | Get purchase invoice by ID | User | - | `PurchaseInvoice` |
| POST | `/api/purchases` | Create purchase invoice | User | `Omit<PurchaseInvoice, 'id'\|'createdAt'\|'updatedAt'>` | `PurchaseInvoice` |
| PUT | `/api/purchases/:id` | Update purchase invoice | User | `Partial<PurchaseInvoice>` | `PurchaseInvoice` |
| DELETE | `/api/purchases/:id` | Delete purchase invoice | User | - | `{ success: boolean }` |
| GET | `/api/purchases/search` | Search purchase invoices | User | `?q=string` | `PurchaseInvoice[]` |
| POST | `/api/purchases/:id/receive` | Receive purchase (update stock) | User | `{ items: PurchaseInvoiceItem[] }` | `PurchaseInvoice` |

---

## Data Models

### PurchaseInvoice
```typescript
interface PurchaseInvoice {
  id: string;
  invoiceNumber: string; // Auto-generated: INV-YYYY-XXX
  supplierId: string;
  supplier?: Supplier; // Populated on fetch
  purchaseDate: Date;
  dueDate?: Date;
  items: PurchaseInvoiceItem[];
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  pharmacyId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### PurchaseInvoiceItem
```typescript
interface PurchaseInvoiceItem {
  id: string;
  drugId: string;
  drugName: string; // Populated on fetch
  quantity: number;
  unitCost: number;
  totalCost: number; // Calculated: quantity * unitCost
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
- `pharmacyId`: string (required, from user context)
- `supplierId`: string (filter by supplier)
- `paymentStatus`: 'pending' | 'partial' | 'paid'
- `startDate`: ISO date string
- `endDate`: ISO date string
- `search`: string (search by invoice number, supplier name)

---

## Business Rules

### Purchase Invoice Creation
- Invoice number auto-generated: `INV-YYYY-XXX` (e.g., INV-2024-001)
- Purchase date defaults to current date
- Due date optional (for credit purchases)
- Payment status defaults to 'pending'
- Total amount = sum of item totalCost

### Purchase Receipt
- Receiving purchase updates stock quantities
- Creates cost layers for FIFO/AVERAGE costing
- Updates drug expiry dates if provided
- Creates inventory movement records
- Stock quantity increases by item quantity

### Payment Processing
- Payments can be partial
- Payment status updates automatically:
  - `pending`: No payment
  - `partial`: Some payment received
  - `paid`: Full payment received
- Remaining amount = totalAmount - paidAmount

### Stock Impact
- Creating purchase invoice does NOT increase stock (until received)
- Receiving purchase increases stock
- Deleting purchase decreases stock (if already received)

---

## Missing/Unclear Requirements

1. **Purchase Orders**: No purchase order system before invoice
2. **Purchase Approval**: No approval workflow for purchases
3. **Purchase Returns**: No return/refund functionality
4. **Purchase Quotes**: No quote/estimate system
5. **Bulk Purchase**: No bulk purchase discounts
6. **Purchase Terms**: No payment terms configuration
7. **Purchase Attachments**: No document attachment support
8. **Purchase History**: No detailed purchase history
9. **Purchase Analytics**: No purchase analytics/reports
10. **Auto-reorder**: No automatic reorder from purchases

---

## Notes

- Purchase invoices are separate from sales invoices
- Stock updates happen on receipt, not on invoice creation
- Cost layers are created on receipt for inventory costing
- Payment tracking is separate from supplier payments (see Suppliers module)
- Purchase invoices link to suppliers (see Suppliers module)



