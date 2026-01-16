/**
 * HR System Models
 * 
 * Enterprise-grade workforce management models for pharmacy operations.
 * All models include pharmacyId for multi-tenant isolation.
 */

import { RiskLevel } from './movement.model';

// ============================================================================
// ATTENDANCE & SHIFTS
// ============================================================================

export interface Shift {
  id: string;
  pharmacyId: string;
  staffId: string;
  staffName?: string;
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

export interface AttendanceRecord {
  id: string;
  pharmacyId: string;
  staffId: string;
  staffName?: string;
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

export interface AttendanceStats {
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

// ============================================================================
// PAYROLL & COMMISSIONS
// ============================================================================

export interface SalaryRule {
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

export interface CommissionRule {
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

export interface PayrollRecord {
  id: string;
  pharmacyId: string;
  staffId: string;
  staffName?: string;
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

// ============================================================================
// PERFORMANCE & RISK
// ============================================================================

export interface PerformanceMetrics {
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

export interface StaffActivity {
  id: string;
  staffId: string;
  staffName?: string;
  pharmacyId: string;
  type: 'sale' | 'edit' | 'inventory' | 'audit' | 'attendance' | 'training';
  entityType: string;
  entityId: string;
  description: string;
  timestamp: Date;
  metadata?: { [key: string]: any };
}

// ============================================================================
// TRAINING & CERTIFICATION
// ============================================================================

export interface TrainingModule {
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

export interface Certification {
  id: string;
  pharmacyId: string;
  staffId: string;
  staffName?: string;
  moduleId: string;
  moduleTitle?: string;
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

// ============================================================================
// HR APPROVALS
// ============================================================================

export type ApprovalType = 'salary_change' | 'termination' | 'role_change' | 'commission_override' | 'bonus' | 'leave';

export interface HRApprovalRequest {
  id: string;
  pharmacyId: string;
  type: ApprovalType;
  staffId: string;
  staffName?: string;
  requestedBy: string;
  requestedByName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  data: { [key: string]: any }; // Type-specific data
  approvers: Array<{
    userId: string;
    userName?: string;
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

