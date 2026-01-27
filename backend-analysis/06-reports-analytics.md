# Reports & Analytics - Backend Requirements

## Overview
Reporting and analytics system for business intelligence, financial reports, inventory reports, and performance metrics.

---

## Features

### 1. Report Generation
- Sales reports
- Inventory reports
- Financial reports
- Patient reports
- Staff performance reports
- Custom report generation

### 2. Analytics Dashboard
- Key Performance Indicators (KPIs)
- Revenue analytics
- Sales trends
- Inventory metrics
- Patient analytics

### 3. Report Export
- PDF export
- Excel/CSV export
- Report scheduling (implied)

### 4. Support Tickets
- Ticket creation and management
- Ticket status tracking
- Ticket messages/threads
- Ticket attachments
- Priority management

---

## API Contracts

### Reports Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/reports/sales` | Sales report | User | Query params | `SalesReport` |
| GET | `/api/reports/inventory` | Inventory report | User | Query params | `InventoryReport` |
| GET | `/api/reports/financial` | Financial report | User | Query params | `FinancialReport` |
| GET | `/api/reports/patients` | Patient report | User | Query params | `PatientReport` |
| GET | `/api/reports/staff` | Staff performance report | Admin | Query params | `StaffReport` |
| GET | `/api/reports/custom` | Custom report | User | Query params | `CustomReport` |
| POST | `/api/reports/:type/export` | Export report | User | `{ format: 'pdf'\|'excel'\|'csv', filters: object }` | `{ downloadUrl: string }` |
| GET | `/api/reports/dashboard` | Dashboard analytics | User | Query params | `DashboardAnalytics` |

### Ticket Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/tickets` | List tickets | User | Query params | `Ticket[]` |
| GET | `/api/tickets/:id` | Get ticket by ID | User | - | `Ticket` |
| POST | `/api/tickets` | Create ticket | User | `Omit<Ticket, 'id'\|'createdAt'\|'updatedAt'>` | `Ticket` |
| PUT | `/api/tickets/:id` | Update ticket | User | `Partial<Ticket>` | `Ticket` |
| PUT | `/api/tickets/:id/status` | Update ticket status | User | `{ status: TicketStatus }` | `Ticket` |
| GET | `/api/tickets/:id/messages` | Get ticket messages | User | - | `TicketMessage[]` |
| POST | `/api/tickets/:id/messages` | Add message to ticket | User | `{ message: string, attachments?: File[] }` | `TicketMessage` |

---

## Data Models

### SalesReport
```typescript
interface SalesReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalRevenue: number;
    totalInvoices: number;
    averageInvoiceValue: number;
    totalItemsSold: number;
  };
  byDate: Array<{
    date: Date;
    revenue: number;
    invoices: number;
  }>;
  byDrug: Array<{
    drugId: string;
    drugName: string;
    quantity: number;
    revenue: number;
  }>;
  byPaymentMethod: Array<{
    method: string;
    count: number;
    revenue: number;
  }>;
}
```

### InventoryReport
```typescript
interface InventoryReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalValue: number;
    totalItems: number;
    lowStockItems: number;
    expiringItems: number;
  };
  movements: {
    totalMovements: number;
    byType: Array<{
      type: MovementType;
      count: number;
      quantity: number;
    }>;
  };
  topItems: Array<{
    drugId: string;
    drugName: string;
    quantity: number;
    value: number;
  }>;
}
```

### FinancialReport
```typescript
interface FinancialReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  revenue: {
    total: number;
    bySource: Array<{
      source: string;
      amount: number;
    }>;
  };
  expenses: {
    total: number;
    byCategory: Array<{
      category: string;
      amount: number;
    }>;
  };
  profit: {
    gross: number;
    net: number;
    margin: number; // percentage
  };
  payments: {
    received: number;
    pending: number;
    overdue: number;
  };
}
```

### PatientReport
```typescript
interface PatientReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalPatients: number;
    newPatients: number;
    activePatients: number;
    totalRevenue: number;
  };
  topPatients: Array<{
    patientId: string;
    patientName: string;
    totalSpent: number;
    visitCount: number;
  }>;
  patientGrowth: Array<{
    date: Date;
    newPatients: number;
    totalPatients: number;
  }>;
}
```

### StaffReport
```typescript
interface StaffReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  staff: Array<{
    staffId: string;
    staffName: string;
    totalSales: number;
    invoiceCount: number;
    averageInvoiceValue: number;
    performanceScore: number;
  }>;
}
```

### DashboardAnalytics
```typescript
interface DashboardAnalytics {
  period: {
    startDate: Date;
    endDate: Date;
  };
  kpis: {
    totalRevenue: number;
    revenueGrowth: number; // percentage
    totalInvoices: number;
    averageInvoiceValue: number;
    totalPatients: number;
    activePatients: number;
    lowStockItems: number;
    expiringItems: number;
  };
  trends: {
    revenue: TrendData[];
    sales: TrendData[];
    patients: TrendData[];
  };
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: Date;
  }>;
}

interface TrendData {
  date: Date;
  value: number;
  change?: number; // percentage change from previous period
}
```

### Ticket
```typescript
interface Ticket {
  id: string;
  subject: string;
  description: string;
  screen: string; // URL or screen identifier where issue occurred
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  attachments?: string[]; // File URLs
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}
```

### TicketMessage
```typescript
interface TicketMessage {
  id: string;
  ticketId: string;
  message: string;
  isFromSupport: boolean;
  attachments?: string[]; // File URLs
  createdAt: Date;
}
```

---

## Query Parameters

### Report Filters
- `startDate`: ISO date string (required)
- `endDate`: ISO date string (required)
- `pharmacyId`: string (required, from user context)
- `drugId`: string (filter by drug)
- `patientId`: string (filter by patient)
- `staffId`: string (filter by staff)
- `groupBy`: 'day' | 'week' | 'month' | 'year'
- `format`: 'json' | 'pdf' | 'excel' | 'csv'

### Ticket Filters
- `status`: 'open' | 'in_progress' | 'resolved' | 'closed'
- `priority`: 'low' | 'medium' | 'high'
- `userId`: string (filter by user)
- `search`: string (search in subject/description)

---

## Business Rules

### Report Generation
- Reports should be generated on-demand
- Large reports may need async generation with download links
- Reports should respect user permissions (pharmacy-scoped)
- Date ranges are required for most reports

### Ticket System
- Tickets are user-scoped (created by user)
- Support staff can respond to tickets
- Ticket status workflow: open → in_progress → resolved → closed
- Attachments should be uploaded and stored securely

---

## Missing/Unclear Requirements

1. **Report Scheduling**: No scheduled report generation
2. **Report Templates**: No custom report template system
3. **Report Sharing**: No report sharing functionality
4. **Real-time Analytics**: No real-time data updates
5. **Comparative Reports**: No year-over-year or period comparison
6. **Report Caching**: No caching strategy for frequently accessed reports
7. **Advanced Filters**: Limited filter options in frontend
8. **Data Export Limits**: No pagination or limits on export
9. **Report Permissions**: No granular report access control
10. **Ticket Assignment**: No ticket assignment to support staff
11. **Ticket Categories**: No ticket categorization
12. **Ticket SLA**: No Service Level Agreement tracking
13. **Report Visualization**: No chart/graph data in response
14. **Report Drill-down**: No drill-down capability in reports

---

## Notes

- Reports should support large date ranges efficiently
- Ticket system may need integration with external support tools
- Dashboard analytics should be cached for performance
- Report export formats should match frontend requirements (PDF, Excel, CSV)



