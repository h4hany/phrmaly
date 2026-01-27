# Platform / Super Admin - Backend Requirements

## Overview
Multi-tenant platform management system for super administrators to manage accounts, subscriptions, catalogs, support tickets, and platform analytics.

---

## Features

### 1. Account Management
- Platform account CRUD
- Account status management (active, suspended, trial, closed, restricted)
- Account limits (max pharmacies, max staff)
- Module enablement per account
- Account metadata and notes

### 2. Subscription Management
- Subscription plan management
- Subscription assignment to accounts
- Subscription status tracking
- Billing cycle management
- Trial period management

### 3. Platform Catalog
- Global drug catalog management
- Drug approval workflow
- Drug alternatives and relationships
- Drug pricing reference

### 4. Support Tickets (Platform-level)
- Platform-wide support ticket system
- Ticket assignment to support staff
- SLA tracking
- Ticket priority management
- Internal notes and audit trail

### 5. Platform Analytics
- Platform-wide metrics
- Account analytics
- Feature usage statistics
- Revenue analytics
- System health monitoring

### 6. Risk Management
- Account risk scoring
- Risk factor tracking
- Risk assessment and recommendations
- Compliance monitoring

### 7. Admin User Management
- Platform admin user management
- Admin role assignment
- Admin permission management

### 8. Feature Flags (Platform-level)
- Global feature flags
- Feature rollout management
- Feature usage tracking

### 9. Modules & Permissions
- Module definition and management
- Permission configuration
- Module-permission mapping

---

## API Contracts

### Account Management Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/platform/accounts` | List accounts | Super Admin | Query params | `PaginatedResponse<PlatformAccount>` |
| GET | `/api/platform/accounts/:id` | Get account by ID | Super Admin | - | `PlatformAccount` |
| POST | `/api/platform/accounts` | Create account | Super Admin | `Omit<PlatformAccount, 'id'\|'createdAt'\|'updatedAt'>` | `PlatformAccount` |
| PUT | `/api/platform/accounts/:id` | Update account | Super Admin | `Partial<PlatformAccount>` | `PlatformAccount` |
| PUT | `/api/platform/accounts/:id/suspend` | Suspend account | Super Admin | `{ reason?: string }` | `PlatformAccount` |
| PUT | `/api/platform/accounts/:id/activate` | Activate account | Super Admin | - | `PlatformAccount` |
| PUT | `/api/platform/accounts/:id/modules` | Update account modules | Super Admin | `{ modules: PlatformModule[] }` | `PlatformAccount` |

### Subscription Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/platform/subscriptions/plans` | List subscription plans | Super Admin | - | `SubscriptionPlan[]` |
| GET | `/api/platform/subscriptions/plans/:id` | Get plan by ID | Super Admin | - | `SubscriptionPlan` |
| POST | `/api/platform/subscriptions/plans` | Create plan | Super Admin | `Omit<SubscriptionPlan, 'id'\|'createdAt'\|'updatedAt'>` | `SubscriptionPlan` |
| PUT | `/api/platform/subscriptions/plans/:id` | Update plan | Super Admin | `Partial<SubscriptionPlan>` | `SubscriptionPlan` |
| GET | `/api/platform/subscriptions` | List subscriptions | Super Admin | Query params | `PaginatedResponse<Subscription>` |
| GET | `/api/platform/subscriptions/:id` | Get subscription by ID | Super Admin | - | `Subscription` |
| POST | `/api/platform/subscriptions` | Create subscription | Super Admin | `Omit<Subscription, 'id'\|'createdAt'\|'updatedAt'>` | `Subscription` |
| PUT | `/api/platform/subscriptions/:id` | Update subscription | Super Admin | `Partial<Subscription>` | `Subscription` |
| PUT | `/api/platform/subscriptions/:id/cancel` | Cancel subscription | Super Admin | `{ cancelAtPeriodEnd: boolean }` | `Subscription` |

### Catalog Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/platform/catalog/drugs` | List global drugs | Super Admin | Query params | `PaginatedResponse<GlobalDrug>` |
| GET | `/api/platform/catalog/drugs/:id` | Get global drug | Super Admin | - | `GlobalDrug` |
| POST | `/api/platform/catalog/drugs` | Create global drug | Super Admin | `Omit<GlobalDrug, 'id'\|'createdAt'\|'updatedAt'>` | `GlobalDrug` |
| PUT | `/api/platform/catalog/drugs/:id` | Update global drug | Super Admin | `Partial<GlobalDrug>` | `GlobalDrug` |
| DELETE | `/api/platform/catalog/drugs/:id` | Delete global drug | Super Admin | - | `{ success: boolean }` |
| PUT | `/api/platform/catalog/drugs/:id/approve` | Approve drug | Super Admin | - | `GlobalDrug` |
| GET | `/api/platform/catalog/drugs/:id/pharmacies` | Get pharmacies using drug | Super Admin | - | `{ count: number, pharmacies: Pharmacy[] }` |

### Support Ticket Endpoints (Platform)

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/platform/tickets` | List platform tickets | Super Admin | Query params | `PaginatedResponse<SupportTicket>` |
| GET | `/api/platform/tickets/:id` | Get ticket by ID | Super Admin | - | `SupportTicket` |
| POST | `/api/platform/tickets` | Create ticket | Super Admin | `Omit<SupportTicket, 'id'\|'createdAt'\|'updatedAt'>` | `SupportTicket` |
| PUT | `/api/platform/tickets/:id` | Update ticket | Super Admin | `Partial<SupportTicket>` | `SupportTicket` |
| PUT | `/api/platform/tickets/:id/assign` | Assign ticket | Super Admin | `{ assignedTo: string }` | `SupportTicket` |
| PUT | `/api/platform/tickets/:id/status` | Update ticket status | Super Admin | `{ status: TicketStatus }` | `SupportTicket` |
| POST | `/api/platform/tickets/:id/notes` | Add internal note | Super Admin | `{ note: string }` | `SupportTicket` |

### Platform Analytics Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/platform/analytics/metrics` | Get platform metrics | Super Admin | Query params | `PlatformMetrics` |
| GET | `/api/platform/analytics/feature-usage` | Get feature usage | Super Admin | Query params | `FeatureUsage[]` |
| GET | `/api/platform/analytics/accounts` | Get account analytics | Super Admin | Query params | `AccountAnalytics[]` |
| GET | `/api/platform/analytics/revenue` | Get revenue analytics | Super Admin | Query params | `RevenueAnalytics` |

### Risk Management Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/platform/risk/accounts` | List account risks | Super Admin | Query params | `PaginatedResponse<AccountRisk>` |
| GET | `/api/platform/risk/accounts/:accountId` | Get account risk | Super Admin | - | `AccountRisk` |
| POST | `/api/platform/risk/accounts/:accountId/assess` | Assess account risk | Super Admin | - | `AccountRisk` |

### Admin User Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/platform/admins` | List admin users | Super Admin | Query params | `PaginatedResponse<AdminUser>` |
| GET | `/api/platform/admins/:id` | Get admin user | Super Admin | - | `AdminUser` |
| POST | `/api/platform/admins` | Create admin user | Super Admin | `Omit<AdminUser, 'id'\|'createdAt'\|'updatedAt'>` | `AdminUser` |
| PUT | `/api/platform/admins/:id` | Update admin user | Super Admin | `Partial<AdminUser>` | `AdminUser` |
| DELETE | `/api/platform/admins/:id` | Delete admin user | Super Admin | - | `{ success: boolean }` |

### Feature Flags Endpoints (Platform)

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/platform/feature-flags` | List platform feature flags | Super Admin | - | `FeatureFlag[]` |
| POST | `/api/platform/feature-flags` | Create feature flag | Super Admin | `Omit<FeatureFlag, 'id'\|'createdAt'\|'updatedAt'>` | `FeatureFlag` |
| PUT | `/api/platform/feature-flags/:id` | Update feature flag | Super Admin | `Partial<FeatureFlag>` | `FeatureFlag` |
| DELETE | `/api/platform/feature-flags/:id` | Delete feature flag | Super Admin | - | `{ success: boolean }` |

### Modules & Permissions Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/platform/modules` | List modules | Super Admin | - | `Module[]` |
| GET | `/api/platform/modules/:id/permissions` | Get module permissions | Super Admin | - | `Permission[]` |
| PUT | `/api/platform/modules/:id/permissions` | Update module permissions | Super Admin | `{ permissions: Permission[] }` | `Module` |

---

## Data Models

### PlatformAccount
```typescript
interface PlatformAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'suspended' | 'trial' | 'closed' | 'restricted';
  subscriptionPlanId: string;
  subscriptionPlan?: SubscriptionPlan; // Populated on fetch
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
```

**PlatformModule:**
- `inventory`
- `hr`
- `finance`
- `automation`
- `loyalty`
- `api_access`
- `ai_features`
- `analytics`
- `reports`
- `multi_branch`

### SubscriptionPlan
```typescript
interface SubscriptionPlan {
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
```

### Subscription
```typescript
interface Subscription {
  id: string;
  accountId: string;
  account?: PlatformAccount; // Populated on fetch
  planId: string;
  plan?: SubscriptionPlan; // Populated on fetch
  status: 'active' | 'trial' | 'cancelled' | 'expired' | 'past_due';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEndsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### GlobalDrug
```typescript
interface GlobalDrug {
  id: string;
  name: string;
  genericName: string;
  barcode?: string;
  atcCode?: string; // Anatomical Therapeutic Chemical code
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
```

### SupportTicket
```typescript
interface SupportTicket {
  id: string;
  accountId: string;
  account?: PlatformAccount; // Populated on fetch
  pharmacyId?: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  category: 'technical' | 'billing' | 'feature_request' | 'bug' | 'other';
  assignedTo?: string;
  assignedToUser?: AdminUser; // Populated on fetch
  slaDeadline?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  internalNotes?: string;
  auditTrail?: string[];
}
```

### PlatformMetrics
```typescript
interface PlatformMetrics {
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
```

### FeatureUsage
```typescript
interface FeatureUsage {
  module: PlatformModule;
  accountCount: number;
  pharmacyCount: number;
  usagePercentage: number;
  trend: 'up' | 'down' | 'stable';
}
```

### AccountRisk
```typescript
interface AccountRisk {
  accountId: string;
  account?: PlatformAccount; // Populated on fetch
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  lastAssessedAt: Date;
  recommendedActions: string[];
}

interface RiskFactor {
  type: 'payment_overdue' | 'suspicious_activity' | 'compliance_violation' | 'high_usage' | 'low_engagement';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
}
```

### AdminUser
```typescript
interface AdminUser {
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
```

**PlatformRole:**
- `SUPER_ADMIN`
- `SUPPORT_ADMIN`
- `SALES_ADMIN`
- `FINANCE_ADMIN`

### AdminPermission
```typescript
interface AdminPermission {
  resource: string;
  actions: ('read' | 'write' | 'delete' | 'manage')[];
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
- `status`: string (filter by status)
- `search`: string (search by name, email)
- `startDate`: ISO date string
- `endDate`: ISO date string
- `tier`: string (filter subscription plans by tier)
- `category`: string (filter tickets by category)
- `priority`: string (filter tickets by priority)
- `assignedTo`: string (filter tickets by assignee)

---

## Business Rules

### Account Management
- Account status affects access to platform
- Suspended accounts cannot access system
- Trial accounts have limited features
- Account limits enforced (max pharmacies, max staff)

### Subscription Management
- Subscriptions link accounts to plans
- Subscription status affects account access
- Trial periods have expiration dates
- Cancelled subscriptions continue until period end

### Risk Management
- Risk scores calculated automatically
- Risk factors trigger alerts
- High-risk accounts may be restricted
- Risk assessment should be periodic

---

## Missing/Unclear Requirements

1. **Billing Integration**: No payment gateway integration
2. **Invoice Generation**: No subscription invoice generation
3. **Usage Tracking**: Limited usage tracking
4. **API Rate Limiting**: No API rate limit management
5. **Data Residency**: No data residency configuration
6. **Compliance Reporting**: No compliance report generation
7. **Account Onboarding**: No onboarding workflow
8. **Account Migration**: No account migration tools
9. **Multi-currency**: No multi-currency support
10. **Tax Management**: No tax calculation for subscriptions

---

## Notes

- Platform is multi-tenant, all data must be properly isolated
- Super admin has full access to all accounts
- Support tickets are separate from pharmacy-level tickets
- Risk management is critical for platform security
- Feature flags enable gradual rollouts and A/B testing



