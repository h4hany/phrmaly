/**
 * Platform System Models
 * 
 * Enterprise-grade platform management models for Super Admin console.
 * All models are platform-scoped (NOT pharmacy-scoped).
 */

// ============================================================================
// PLATFORM ROLES
// ============================================================================

export enum PlatformRole {
  SUPER_ADMIN = 'super_admin',
  SUPPORT_ADMIN = 'support_admin',
  SALES_ADMIN = 'sales_admin',
  FINANCE_ADMIN = 'finance_admin'
}

// ============================================================================
// ACCOUNT MANAGEMENT
// ============================================================================

export interface PlatformAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'suspended' | 'trial' | 'closed' | 'restricted';
  subscriptionPlanId: string;
  subscriptionPlan?: SubscriptionPlan;
  maxPharmacies: number;
  maxStaff: number;
  pharmaciesCreated: number;
  staffCreated: number;
  enabledModules: PlatformModule[];
  createdAt: Date;
  updatedAt: Date;
  trialEndsAt?: Date;
  lastLoginAt?: Date;
  metadata?: {
    region?: string;
    industry?: string;
    notes?: string;
  };
  auditTrail?: string[];
}

export type PlatformModule = 
  | 'inventory'
  | 'hr'
  | 'finance'
  | 'automation'
  | 'loyalty'
  | 'api_access'
  | 'ai_features'
  | 'analytics'
  | 'reports'
  | 'multi_branch';

// ============================================================================
// SUBSCRIPTION & BILLING
// ============================================================================

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  tier: 'starter' | 'professional' | 'enterprise' | 'custom';
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'annual';
  maxPharmacies: number;
  maxStaff: number;
  enabledModules: PlatformModule[];
  features: {
    [key: string]: any;
  };
  isActive: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  accountId: string;
  account?: PlatformAccount;
  planId: string;
  plan?: SubscriptionPlan;
  status: 'active' | 'trial' | 'cancelled' | 'expired' | 'past_due';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEndsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  accountId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// SUPPORT & TICKETS
// ============================================================================

export interface SupportTicket {
  id: string;
  accountId: string;
  account?: PlatformAccount;
  pharmacyId?: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  category: 'technical' | 'billing' | 'feature_request' | 'bug' | 'other';
  assignedTo?: string;
  assignedToUser?: AdminUser;
  slaDeadline?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  internalNotes?: string;
  auditTrail?: string[];
}

// ============================================================================
// ADMIN USERS
// ============================================================================

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: PlatformRole;
  status: 'active' | 'inactive' | 'suspended';
  permissions: AdminPermission[];
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  auditTrail?: string[];
}

export interface AdminPermission {
  resource: string;
  actions: ('read' | 'write' | 'delete' | 'manage')[];
}

// ============================================================================
// PLATFORM ANALYTICS
// ============================================================================

export interface PlatformMetrics {
  totalAccounts: number;
  activeAccounts: number;
  totalPharmacies: number;
  activePharmacies: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  openTickets: number;
  systemStatus: 'healthy' | 'degraded' | 'down';
  period: {
    startDate: Date;
    endDate: Date;
  };
}

export interface FeatureUsage {
  module: PlatformModule;
  accountCount: number;
  pharmacyCount: number;
  usagePercentage: number;
  trend: 'up' | 'down' | 'stable';
}

// ============================================================================
// ACCOUNT RISK & COMPLIANCE
// ============================================================================

export interface AccountRisk {
  accountId: string;
  account?: PlatformAccount;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  lastAssessedAt: Date;
  recommendedActions: string[];
}

export interface RiskFactor {
  type: 'payment_overdue' | 'suspicious_activity' | 'compliance_violation' | 'high_usage' | 'low_engagement';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
}

// ============================================================================
// GLOBAL DRUG INDEX (Platform-level)
// ============================================================================

export interface GlobalDrug {
  id: string;
  name: string;
  genericName: string;
  barcode?: string;
  atcCode?: string;
  therapeuticClass?: string;
  manufacturer?: string;
  priceReference?: number;
  alternatives?: string[]; // Drug IDs
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  affectedPharmacies?: number; // Count of pharmacies using this drug
  auditTrail?: string[];
}

