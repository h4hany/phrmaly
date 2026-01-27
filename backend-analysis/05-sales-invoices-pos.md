# Sales / Invoices / POS - Backend Requirements

## Overview
Point of Sale (POS) and invoice management system for sales transactions, patient invoicing, payment processing, and voucher integration.

---

## Features

### 1. Invoice Management
- Create, edit, and delete invoices
- Invoice numbering (auto-generated)
- Patient association
- Multiple items per invoice
- Discount and promo code support
- Payment status tracking
- Payment method selection
- Voucher integration

### 2. Invoice Items
- Add/remove items from invoice
- Quantity management
- Unit price and total calculation
- Discount per item
- Barcode scanning for quick item addition

### 3. Payment Processing
- Multiple payment methods (cash, card, bank transfer)
- Payment status (pending, partial, paid)
- Payment method deduction rates
- Payment history

### 4. Voucher System
- Voucher creation and management
- Voucher application to invoices
- Voucher sharing with patients
- Voucher expiration tracking
- Voucher status (active, expired, used)

### 5. Invoice Cart
- Shopping cart functionality
- Real-time total calculation
- Item quantity updates
- Cart persistence (implied)

---

## API Contracts

### Invoice Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/invoices` | List invoices | User | Query params | `PaginatedResponse<Invoice>` |
| GET | `/api/invoices/:id` | Get invoice by ID | User | - | `Invoice` |
| POST | `/api/invoices` | Create invoice | User | `Omit<Invoice, 'id'\|'invoiceNumber'\|'createdAt'\|'updatedAt'>` | `Invoice` |
| PUT | `/api/invoices/:id` | Update invoice | User | `Partial<Invoice>` | `Invoice` |
| DELETE | `/api/invoices/:id` | Delete invoice | User | - | `{ success: boolean }` |
| GET | `/api/invoices/search` | Search invoices | User | `?q=string` | `Invoice[]` |
| POST | `/api/invoices/:id/print` | Print invoice | User | - | `{ pdfUrl: string }` |
| POST | `/api/invoices/:id/share` | Share invoice | User | `{ method: 'email'\|'sms'\|'whatsapp', recipient: string }` | `{ success: boolean }` |

### Invoice Items Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| POST | `/api/invoices/:id/items` | Add item to invoice | User | `InvoiceItem` | `InvoiceItem` |
| PUT | `/api/invoices/:id/items/:itemId` | Update item | User | `Partial<InvoiceItem>` | `InvoiceItem` |
| DELETE | `/api/invoices/:id/items/:itemId` | Remove item | User | - | `{ success: boolean }` |

### Payment Method Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/payment-methods` | List payment methods | User | Query params | `PaginatedResponse<PaymentMethod>` |
| GET | `/api/payment-methods/:id` | Get payment method | User | - | `PaymentMethod` |
| POST | `/api/payment-methods` | Create payment method | Admin | `Omit<PaymentMethod, 'id'\|'createdAt'\|'updatedAt'>` | `PaymentMethod` |
| PUT | `/api/payment-methods/:id` | Update payment method | Admin | `Partial<PaymentMethod>` | `PaymentMethod` |
| DELETE | `/api/payment-methods/:id` | Delete payment method | Admin | - | `{ success: boolean }` |

### Voucher Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/vouchers` | List vouchers | User | Query params | `PaginatedResponse<VoucherListItem>` |
| GET | `/api/vouchers/:id` | Get voucher by ID | User | - | `Voucher` |
| GET | `/api/vouchers/patient/:patientId` | Get vouchers by patient | User | - | `Voucher[]` |
| POST | `/api/vouchers` | Create voucher | User | `Omit<Voucher, 'createdAt'\|'validUntil'>` | `Voucher` |
| PUT | `/api/vouchers/:id` | Update voucher | User | `Partial<Voucher>` | `Voucher` |
| DELETE | `/api/vouchers/:id` | Delete voucher | User | - | `{ success: boolean }` |
| POST | `/api/vouchers/:id/apply` | Apply voucher to invoice | User | `{ invoiceId: string }` | `{ applied: boolean, discount: number }` |
| POST | `/api/vouchers/:id/share` | Share voucher with patient | User | `{ method: 'email'\|'sms'\|'whatsapp' }` | `{ success: boolean }` |

---

## Data Models

### Invoice
```typescript
interface Invoice {
  id: string;
  invoiceNumber: string; // Auto-generated: SALES-YYYY-XXX
  patientId: string;
  patient?: Patient; // Populated on fetch
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  promoCode?: string;
  total: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  paymentMethod?: 'cash' | 'card' | 'bank_transfer';
  createdAt: Date;
  updatedAt: Date;
  pharmacyId: string;
  voucherCode?: string;
  voucherName?: string;
}
```

### InvoiceItem
```typescript
interface InvoiceItem {
  id: string;
  drugId: string;
  drugName: string; // Populated on fetch
  quantity: number;
  unitPrice: number;
  discount?: number;
  totalPrice: number; // Calculated: (unitPrice * quantity) - discount
}
```

### PaymentMethod
```typescript
interface PaymentMethod {
  id: string;
  name: string;
  deductionRate: number; // Percentage (0-100) - fee for using this method
  createdAt: Date;
  updatedAt: Date;
}
```

### Voucher
```typescript
interface Voucher {
  voucherName: string; // Format: PATIENT-PHARMACY-CODE
  voucherCode: string; // Unique code
  createdAt: Date;
  validUntil: Date; // Default: 3 months from creation
  amount: number;
  patient: Patient;
  pharmacy: Pharmacy;
}
```

### VoucherListItem
```typescript
interface VoucherListItem {
  id: string;
  voucherCode: string;
  voucherName: string;
  patientId: string;
  patientName: string;
  pharmacyId: string;
  pharmacyName: string;
  amount: number;
  createdAt: Date;
  validUntil: Date;
  status: 'active' | 'expired' | 'used';
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
- `patientId`: string (filter by patient)
- `paymentStatus`: 'pending' | 'partial' | 'paid'
- `paymentMethod`: 'cash' | 'card' | 'bank_transfer'
- `startDate`: ISO date string
- `endDate`: ISO date string
- `search`: string (search by invoice number, patient name)

### Voucher Filters
- `patientId`: string (filter by patient)
- `status`: 'active' | 'expired' | 'used'
- `pharmacyId`: string

---

## Business Rules

### Invoice Creation
- Invoice number auto-generated: `SALES-YYYY-XXX` (e.g., SALES-2024-001)
- Stock quantity decreases when invoice is created
- Invoice total = subtotal - discount + taxes (if applicable)
- Payment status defaults to 'pending'

### Invoice Items
- Items must have valid drug ID
- Quantity cannot exceed available stock
- Unit price comes from drug price (can be overridden)
- Total price = (unitPrice * quantity) - discount

### Payment Processing
- Payment method deduction rate applied to net amount
- Partial payments allowed
- Payment status updates automatically:
  - `pending`: No payment
  - `partial`: Some payment received
  - `paid`: Full payment received

### Voucher System
- Vouchers are created per patient-pharmacy pair
- Voucher code must be unique
- Voucher expiration: 3 months from creation (configurable)
- Voucher can be applied to one invoice only
- Voucher status:
  - `active`: Valid and unused
  - `expired`: Past validUntil date
  - `used`: Applied to an invoice

### Stock Impact
- Creating invoice decreases stock
- Deleting invoice increases stock (if allowed)
- Editing invoice quantity updates stock accordingly

---

## Missing/Unclear Requirements

1. **Tax Calculation**: No tax fields or tax calculation logic
2. **Invoice Templates**: No custom invoice template support
3. **Invoice Numbering Format**: Format is assumed, not configurable
4. **Partial Payments**: Partial payments exist, but no payment tracking per invoice
5. **Refunds**: No refund/return functionality
6. **Invoice Cancellation**: Delete exists, but no cancellation workflow
7. **Receipt Printing**: Print endpoint exists, but no template definition
8. **Email/SMS Integration**: Share endpoints exist, but no integration details
9. **Promo Code System**: Promo code field exists, but no promo code management
10. **Invoice Archiving**: No archive/restore functionality
11. **Multi-currency**: No currency support
12. **Invoice Approval**: No approval workflow for large invoices
13. **Payment Gateway Integration**: No payment gateway integration
14. **Invoice Attachments**: No file attachment support
15. **QR Code Generation**: QR code section exists in frontend, but no endpoint

---

## Notes

- Barcode scanning integrated for quick item addition
- Invoice cart service manages temporary cart state
- Voucher sharing implies integration with communication services
- Stock updates must be atomic (transactional) when creating invoice
- Invoice numbering should be sequential and unique per pharmacy



