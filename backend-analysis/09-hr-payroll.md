# HR & Payroll - Backend Requirements

## Overview
Human Resources and Payroll management system for staff attendance, performance tracking, payroll processing, training, and HR approvals.

---

## Features

### 1. Attendance Management
- Shift scheduling
- Check-in/check-out tracking
- Attendance records
- Attendance statistics
- Break time tracking
- Location-based check-in (QR, PIN, manual)

### 2. Payroll Management
- Salary rules configuration
- Commission rules configuration
- Payroll record generation
- Payroll approval workflow
- Payment processing
- Payroll breakdown and reports

### 3. Performance Management
- Performance metrics calculation
- Performance scoring
- Risk scoring for staff
- Performance trends
- Performance reports

### 4. Training & Certification
- Training module management
- Certification tracking
- Quiz/assessment system
- Certificate generation
- Training completion tracking

### 5. HR Approvals
- Approval request workflow
- Multi-level approvals
- Approval history
- Approval notifications

### 6. Staff Activity Tracking
- Activity logging
- Activity history
- Activity analytics

---

## API Contracts

### Attendance Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/hr/attendance/shifts` | List shifts | User | Query params | `PaginatedResponse<Shift>` |
| GET | `/api/hr/attendance/shifts/:id` | Get shift by ID | User | - | `Shift` |
| POST | `/api/hr/attendance/shifts` | Create shift | Admin | `Omit<Shift, 'id'\|'createdAt'\|'updatedAt'>` | `Shift` |
| PUT | `/api/hr/attendance/shifts/:id` | Update shift | Admin | `Partial<Shift>` | `Shift` |
| POST | `/api/hr/attendance/shifts/:id/check-in` | Check in | User | `{ method: 'qr'\|'pin'\|'manual', location?: string }` | `Shift` |
| POST | `/api/hr/attendance/shifts/:id/check-out` | Check out | User | `{ method: 'qr'\|'pin'\|'manual' }` | `Shift` |
| GET | `/api/hr/attendance/records` | List attendance records | User | Query params | `PaginatedResponse<AttendanceRecord>` |
| GET | `/api/hr/attendance/records/:id` | Get attendance record | User | - | `AttendanceRecord` |
| GET | `/api/hr/attendance/stats/:staffId` | Get attendance stats | User | Query params | `AttendanceStats` |

### Payroll Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/hr/payroll/salary-rules` | List salary rules | Admin | Query params | `SalaryRule[]` |
| POST | `/api/hr/payroll/salary-rules` | Create salary rule | Admin | `Omit<SalaryRule, 'id'\|'createdAt'\|'updatedAt'>` | `SalaryRule` |
| PUT | `/api/hr/payroll/salary-rules/:id` | Update salary rule | Admin | `Partial<SalaryRule>` | `SalaryRule` |
| GET | `/api/hr/payroll/commission-rules` | List commission rules | Admin | Query params | `CommissionRule[]` |
| POST | `/api/hr/payroll/commission-rules` | Create commission rule | Admin | `Omit<CommissionRule, 'id'\|'createdAt'\|'updatedAt'>` | `CommissionRule` |
| PUT | `/api/hr/payroll/commission-rules/:id` | Update commission rule | Admin | `Partial<CommissionRule>` | `CommissionRule` |
| GET | `/api/hr/payroll/records` | List payroll records | Admin | Query params | `PaginatedResponse<PayrollRecord>` |
| GET | `/api/hr/payroll/records/:id` | Get payroll record | User | - | `PayrollRecord` |
| POST | `/api/hr/payroll/records` | Generate payroll | Admin | `{ period: { startDate: Date, endDate: Date }, staffIds?: string[] }` | `PayrollRecord[]` |
| PUT | `/api/hr/payroll/records/:id/approve` | Approve payroll | Admin | `{ approvedBy: string }` | `PayrollRecord` |
| PUT | `/api/hr/payroll/records/:id/pay` | Mark as paid | Admin | `{ paymentDate: Date, paymentMethod: string }` | `PayrollRecord` |

### Performance Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/hr/performance/:staffId` | Get performance metrics | Admin | Query params | `PerformanceMetrics` |
| GET | `/api/hr/performance` | List all performance metrics | Admin | Query params | `PerformanceMetrics[]` |
| POST | `/api/hr/performance/:staffId/calculate` | Calculate performance | Admin | `{ period: { startDate: Date, endDate: Date } }` | `PerformanceMetrics` |

### Training Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/hr/training/modules` | List training modules | User | Query params | `TrainingModule[]` |
| GET | `/api/hr/training/modules/:id` | Get training module | User | - | `TrainingModule` |
| POST | `/api/hr/training/modules` | Create training module | Admin | `Omit<TrainingModule, 'id'\|'createdAt'\|'updatedAt'>` | `TrainingModule` |
| PUT | `/api/hr/training/modules/:id` | Update training module | Admin | `Partial<TrainingModule>` | `TrainingModule` |
| DELETE | `/api/hr/training/modules/:id` | Delete training module | Admin | - | `{ success: boolean }` |
| GET | `/api/hr/training/certifications` | List certifications | User | Query params | `PaginatedResponse<Certification>` |
| GET | `/api/hr/training/certifications/:id` | Get certification | User | - | `Certification` |
| POST | `/api/hr/training/certifications` | Start certification | User | `{ moduleId: string }` | `Certification` |
| PUT | `/api/hr/training/certifications/:id/complete` | Complete certification | User | `{ score: number, answers: any }` | `Certification` |

### HR Approval Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/hr/approvals` | List approval requests | Admin | Query params | `PaginatedResponse<HRApprovalRequest>` |
| GET | `/api/hr/approvals/:id` | Get approval request | Admin | - | `HRApprovalRequest` |
| POST | `/api/hr/approvals` | Create approval request | User | `Omit<HRApprovalRequest, 'id'\|'createdAt'\|'updatedAt'>` | `HRApprovalRequest` |
| PUT | `/api/hr/approvals/:id/approve` | Approve request | Admin | `{ comments?: string }` | `HRApprovalRequest` |
| PUT | `/api/hr/approvals/:id/reject` | Reject request | Admin | `{ comments?: string }` | `HRApprovalRequest` |

### Staff Activity Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/hr/activity/:staffId` | Get staff activity | Admin | Query params | `StaffActivity[]` |
| GET | `/api/hr/activity` | List all activities | Admin | Query params | `PaginatedResponse<StaffActivity>` |

---

## Data Models

### Shift
```typescript
interface Shift {
  id: string;
  pharmacyId: string;
  staffId: string;
  staffName?: string; // Populated on fetch
  shiftDate: Date;
  startTime: Date;
  endTime?: Date;
  breakDuration?: number; // minutes
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  checkInTime?: Date;
  checkOutTime?: Date;
  checkInMethod?: 'qr' | 'pin' | 'manual';
  checkOutMethod?: 'qr' | 'pin' | 'manual';
  location?: string; // branch/pharmacy location
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  auditTrail?: string[];
}
```

### AttendanceRecord
```typescript
interface AttendanceRecord {
  id: string;
  pharmacyId: string;
  staffId: string;
  staffName?: string; // Populated on fetch
  date: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  totalHours?: number;
  status: 'present' | 'absent' | 'late' | 'early_leave' | 'half_day' | 'on_leave';
  lateMinutes?: number;
  earlyLeaveMinutes?: number;
  shiftId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  auditTrail?: string[];
}
```

### AttendanceStats
```typescript
interface AttendanceStats {
  staffId: string;
  staffName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendancePercentage: number;
  averageHoursPerDay: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
}
```

### SalaryRule
```typescript
interface SalaryRule {
  id: string;
  pharmacyId: string;
  staffId?: string; // null for global rules
  role?: string; // null for staff-specific rules
  baseSalary: number;
  currency: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

### CommissionRule
```typescript
interface CommissionRule {
  id: string;
  pharmacyId: string;
  staffId?: string;
  role?: string;
  type: 'percentage' | 'fixed' | 'tiered';
  value: number; // percentage or fixed amount
  tieredRates?: Array<{
    minSales: number;
    maxSales?: number;
    rate: number;
  }>;
  appliesTo: 'all_sales' | 'specific_drugs' | 'specific_categories';
  drugIds?: string[];
  categoryIds?: string[];
  minSalesThreshold?: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

### PayrollRecord
```typescript
interface PayrollRecord {
  id: string;
  pharmacyId: string;
  staffId: string;
  staffName?: string; // Populated on fetch
  period: {
    startDate: Date;
    endDate: Date;
  };
  baseSalary: number;
  commission: number;
  bonuses: number;
  deductions: number;
  totalEarnings: number;
  netPay: number;
  currency: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'paid' | 'cancelled';
  paymentDate?: Date;
  paymentMethod?: 'cash' | 'bank_transfer' | 'check';
  breakdown: {
    baseSalary: number;
    commission: {
      total: number;
      sales: number;
      items: Array<{
        invoiceId: string;
        invoiceNumber: string;
        amount: number;
        commission: number;
      }>;
    };
    bonuses: Array<{
      id: string;
      type: string;
      amount: number;
      reason: string;
    }>;
    deductions: Array<{
      id: string;
      type: string;
      amount: number;
      reason: string;
    }>;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  auditTrail?: string[];
}
```

### PerformanceMetrics
```typescript
interface PerformanceMetrics {
  staffId: string;
  staffName: string;
  pharmacyId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  sales: {
    totalRevenue: number;
    totalInvoices: number;
    averageInvoiceValue: number;
    growthPercentage: number;
  };
  errors: {
    invoiceEdits: number;
    inventoryAdjustments: number;
    auditFlags: number;
    totalErrors: number;
  };
  attendance: {
    percentage: number;
    lateArrivals: number;
    absences: number;
  };
  inventory: {
    movements: number;
    suspiciousMovements: number;
    riskScore: number;
  };
  overallScore: number; // 0-100
  performanceGrade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  riskLevel: RiskLevel;
  riskScore: number; // 0-100
  trends: {
    sales: 'up' | 'down' | 'stable';
    errors: 'up' | 'down' | 'stable';
    attendance: 'up' | 'down' | 'stable';
  };
  lastUpdated: Date;
}
```

### StaffActivity
```typescript
interface StaffActivity {
  id: string;
  staffId: string;
  staffName?: string; // Populated on fetch
  pharmacyId: string;
  type: 'sale' | 'edit' | 'inventory' | 'audit' | 'attendance' | 'training';
  entityType: string;
  entityId: string;
  description: string;
  timestamp: Date;
  metadata?: { [key: string]: any };
}
```

### TrainingModule
```typescript
interface TrainingModule {
  id: string;
  pharmacyId: string;
  title: string;
  description: string;
  category: 'safety' | 'compliance' | 'sales' | 'inventory' | 'customer_service' | 'other';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // minutes
  videoUrl?: string;
  content: string; // HTML or markdown
  quiz?: {
    questions: Array<{
      id: string;
      question: string;
      type: 'multiple_choice' | 'true_false' | 'short_answer';
      options?: string[];
      correctAnswer: string | number;
      points: number;
    }>;
    passingScore: number; // percentage
  };
  isRequired: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

### Certification
```typescript
interface Certification {
  id: string;
  pharmacyId: string;
  staffId: string;
  staffName?: string; // Populated on fetch
  moduleId: string;
  moduleTitle?: string; // Populated on fetch
  status: 'not_started' | 'in_progress' | 'completed' | 'expired' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  expiresAt?: Date;
  score?: number;
  maxScore?: number;
  passingScore?: number;
  passed?: boolean;
  attempts: number;
  lastAttemptAt?: Date;
  certificateUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  auditTrail?: string[];
}
```

### HRApprovalRequest
```typescript
interface HRApprovalRequest {
  id: string;
  pharmacyId: string;
  type: ApprovalType;
  staffId: string;
  staffName?: string; // Populated on fetch
  requestedBy: string;
  requestedByName?: string; // Populated on fetch
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  data: { [key: string]: any }; // Type-specific data
  approvers: Array<{
    userId: string;
    userName?: string; // Populated on fetch
    role: string;
    status: 'pending' | 'approved' | 'rejected';
    approvedAt?: Date;
    comments?: string;
  }>;
  currentApproverIndex: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  comments?: string;
  auditTrail?: string[];
}
```

**ApprovalType:**
- `salary_change`
- `termination`
- `role_change`
- `commission_override`
- `bonus`
- `leave`

---

## Query Parameters

### Pagination
- `page`: number (default: 1)
- `pageSize`: number (default: 10)
- `sortBy`: string (optional)
- `sortOrder`: 'asc' | 'desc' (optional)

### Filters
- `pharmacyId`: string (required)
- `staffId`: string (filter by staff)
- `startDate`: ISO date string
- `endDate`: ISO date string
- `status`: string (filter by status)
- `type`: string (filter by type)

---

## Business Rules

### Attendance
- Check-in/check-out must be within shift time window
- Late check-in tracked automatically
- Early check-out tracked automatically
- Attendance records generated from shifts

### Payroll
- Payroll calculated based on salary and commission rules
- Commission calculated from sales in period
- Payroll requires approval before payment
- Payroll status: draft → pending_approval → approved → paid

### Performance
- Performance metrics calculated periodically
- Risk score affects performance grade
- Performance trends tracked over time

### Training
- Required training modules must be completed
- Certifications expire after set period
- Quiz passing score required for completion

### Approvals
- Multi-level approval workflow supported
- Approvers must approve in order
- Rejection cancels approval process

---

## Missing/Unclear Requirements

1. **Leave Management**: No leave request/approval system
2. **Time Off**: No time off tracking
3. **Overtime**: No overtime calculation
4. **Benefits**: No benefits management
5. **Employee Onboarding**: No onboarding workflow
6. **Employee Offboarding**: No offboarding process
7. **Performance Reviews**: No formal review process
8. **Goal Setting**: No goal tracking
9. **Employee Documents**: No document management
10. **Payroll Tax**: No tax calculation

---

## Notes

- HR system is pharmacy-scoped
- Performance metrics link to inventory risk scores
- Payroll generation should be automated
- Training modules support video content and quizzes
- Approval workflow supports multi-level approvals

