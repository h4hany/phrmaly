# Patients - Backend Requirements

## Overview
Patient management system for customer records, patient cards, medical notes, and patient analytics.

---

## Features

### 1. Patient Management
- Patient CRUD operations
- Patient profile management
- Patient card management
- Medical notes tracking
- Patient search and filtering

### 2. Patient Analytics
- Patient KPI tracking
- Patient order history
- Patient loyalty tracking
- Patient revenue tracking
- Patient voucher management

### 3. Patient Cards
- Patient card issuance
- Card validity tracking
- Card expiration management

---

## API Contracts

### Patient Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/patients` | List patients | User | Query params | `PaginatedResponse<Patient>` |
| GET | `/api/patients/:id` | Get patient by ID | User | - | `Patient` |
| POST | `/api/patients` | Create patient | User | `Omit<Patient, 'id'\|'createdAt'\|'updatedAt'>` | `Patient` |
| PUT | `/api/patients/:id` | Update patient | User | `Partial<Patient>` | `Patient` |
| DELETE | `/api/patients/:id` | Delete patient | User | - | `{ success: boolean }` |
| GET | `/api/patients/search` | Search patients | User | `?q=string` | `Patient[]` |
| GET | `/api/patients/:id/kpi` | Get patient KPI | User | - | `PatientKPI` |
| GET | `/api/patients/:id/orders` | Get patient orders | User | Query params | `Invoice[]` |
| GET | `/api/patients/:id/loyalty` | Get patient loyalty data | User | - | `PatientLoyalty` |
| GET | `/api/patients/:id/revenue` | Get patient revenue | User | Query params | `PatientRevenue` |
| GET | `/api/patients/:id/vouchers` | Get patient vouchers | User | - | `Voucher[]` |

---

## Data Models

### Patient
```typescript
interface Patient {
  id: string;
  fullName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  address: {
    city: string;
    area: string;
    street: string;
    notes?: string;
  };
  occupation?: string;
  medicalNotes?: string;
  cardId?: string; // Patient card ID
  validUntil?: Date; // Card expiration
  issuedDate?: Date; // Card issue date
  createdAt: Date;
  updatedAt: Date;
}
```

### PatientKPI
```typescript
interface PatientKPI {
  patientId: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: Date;
  activeVouchers: number;
  loyaltyPoints?: number;
}
```

### PatientLoyalty
```typescript
interface PatientLoyalty {
  patientId: string;
  totalPoints: number;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  rewards: Array<{
    id: string;
    type: string;
    description: string;
    redeemed: boolean;
  }>;
}
```

### PatientRevenue
```typescript
interface PatientRevenue {
  patientId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
  byMonth: Array<{
    month: Date;
    revenue: number;
    orders: number;
  }>;
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
- `gender`: 'male' | 'female' | 'other'
- `city`: string (filter by city)
- `search`: string (search by name, email, phone, cardId)
- `hasCard`: boolean (filter by card status)
- `cardExpired`: boolean (filter by card expiration)

---

## Business Rules

### Patient Management
- Patients are pharmacy-scoped
- Patient cards are optional
- Card ID format: `PC-YYYY-XXXXXX` (e.g., PC-2024-001234)
- Card validity period configurable (default: 1 year)

### Patient Cards
- Cards can be issued/updated
- Expired cards should be flagged
- Card renewal process (implied)

### Patient Analytics
- KPIs calculated from invoice history
- Loyalty points tracked per patient
- Revenue calculated from completed invoices

---

## Missing/Unclear Requirements

1. **Patient Groups**: No patient grouping/categorization
2. **Patient Tags**: No tagging system
3. **Patient History**: No detailed medical history
4. **Patient Allergies**: No allergy tracking (medicalNotes may contain this)
5. **Patient Prescriptions**: No prescription management
6. **Patient Reminders**: No reminder system
7. **Patient Communication**: No communication history
8. **Patient Documents**: No document upload
9. **Patient Photos**: No photo upload
10. **Patient Insurance**: No insurance information
11. **Patient Referrals**: No referral tracking (separate module exists)
12. **Patient Loyalty Program**: Basic loyalty exists, but no program configuration

---

## Notes

- Patients are linked to invoices (see Sales/Invoices module)
- Patient cards are separate from vouchers
- Medical notes are free-form text
- Patient search should be fast (indexed on name, phone, email, cardId)
- Patient data should be GDPR/compliance compliant



