# Roles and Permissions System Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [User Roles](#user-roles)
4. [Permission Types](#permission-types)
5. [Core Components](#core-components)
6. [Guards](#guards)
7. [Usage Examples](#usage-examples)
8. [Permission Flow](#permission-flow)
9. [Best Practices](#best-practices)
10. [File Structure](#file-structure)

---

## Overview

The application implements a **Role-Based Access Control (RBAC)** system that provides fine-grained permission management across routes, sidebar navigation, and UI features. The system is centralized, config-driven, and follows the principle of least privilege.

### Key Features
- ✅ **Centralized Configuration**: All permissions defined in one place
- ✅ **Multi-level Security**: Route guards, service checks, and template directives
- ✅ **Wildcard Route Support**: Dynamic routes like `/patients/:id` are supported
- ✅ **Feature-level Permissions**: Control tabs, buttons, KPI cards, and table actions
- ✅ **Type-safe**: Full TypeScript support with enums and interfaces
- ✅ **Default Deny**: Routes and features are denied by default unless explicitly allowed

---

## Architecture

The permission system follows a layered security approach:

```
┌─────────────────────────────────────────────────────────────┐
│                    Route Level (Guards)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  authGuard   │→ │ pharmacyGuard │→ │  rbacGuard   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Service Level (RbacService)                │
│  • canAccessRoute()                                          │
│  • canAccessGroup()                                          │
│  • canAccessItem()                                           │
│  • canAccessFeature()                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Configuration (permissions.config.ts)           │
│  • routes: Record<string, string[]>                         │
│  • groups: Record<string, string[]>                         │
│  • items: Record<string, string[]>                          │
│  • features: Record<string, string[]>                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Template Level (Directives)                    │
│  • *appCanAccess="'feature.key'"                            │
│  • *appCanAccess="'feature.key'; mode: 'disable'"           │
└─────────────────────────────────────────────────────────────┘
```

---

## User Roles

### Pharmacy Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| `ACCOUNT_OWNER` | Full system access, pharmacy owner | **Full Access** - Can access everything |
| `PHARMACY_MANAGER` | Pharmacy manager with restricted access | **Limited** - No dashboard, limited patient/staff views, no procurement |
| `PHARMACY_STAFF` | Regular pharmacy staff member | **Very Limited** - Only invoices, drugs, bundles, inventory map/transfers |
| `PHARMACY_INVENTORY_MANAGER` | Inventory-focused role | **Inventory Focus** - Procurement, inventory alerts, invoices with restrictions |
| `PHARMACY_ACCOUNTING_MANAGER` | Accounting-focused role | **Accounting Focus** - Financial operations |

### Platform Roles (Super Admin)

| Role | Description | Access Level |
|------|-------------|--------------|
| `SUPER_ADMIN` | Platform super administrator | **Full Platform Access** - System console |
| `SUPPORT_ADMIN` | Support administrator | **Support Access** - System console |
| `SALES_ADMIN` | Sales administrator | **Sales Access** - System console |
| `FINANCE_ADMIN` | Finance administrator | **Finance Access** - System console |

### Role Hierarchy

```
ACCOUNT_OWNER (Full Access)
    │
    ├── PHARMACY_MANAGER (Limited)
    │   └── PHARMACY_STAFF (Very Limited)
    │
    ├── PHARMACY_INVENTORY_MANAGER (Inventory Focus)
    │
    └── PHARMACY_ACCOUNTING_MANAGER (Accounting Focus)

Platform Roles (Separate System)
    ├── SUPER_ADMIN
    ├── SUPPORT_ADMIN
    ├── SALES_ADMIN
    └── FINANCE_ADMIN
```

---

## Permission Types

The system defines four types of permissions:

### 1. Route Permissions (`routes`)
Controls which routes a role can access. Supports wildcard patterns.

**Example:**
```typescript
routes: {
  '/dashboard': ['account_owner'],
  '/patients': ['account_owner', 'pharmacy_manager'],
  '/patients/:id': ['account_owner', 'pharmacy_manager'], // Wildcard
  '/invoices': ['account_owner', 'pharmacy_manager', 'pharmacy_staff']
}
```

### 2. Sidebar Group Permissions (`groups`)
Controls visibility of sidebar navigation groups.

**Example:**
```typescript
groups: {
  'overview': ['account_owner'],
  'operations': ['account_owner', 'pharmacy_manager', 'pharmacy_staff'],
  'procurement': ['account_owner', 'pharmacy_inventory_manager']
}
```

### 3. Sidebar Item Permissions (`items`)
Controls visibility of individual sidebar menu items.

**Example:**
```typescript
items: {
  '/dashboard': ['account_owner'],
  '/drugs': ['account_owner', 'pharmacy_manager', 'pharmacy_staff'],
  '/purchases': ['account_owner', 'pharmacy_inventory_manager']
}
```

### 4. Feature Permissions (`features`)
Controls page-level features like tabs, buttons, KPI cards, and table actions.

**Example:**
```typescript
features: {
  'patient.overview.kpi-cards': ['account_owner'],
  'patient.tabs.orders': ['account_owner'],
  'invoice.create': ['account_owner', 'pharmacy_staff', 'pharmacy_manager'],
  'settings.tabs.account': ['account_owner']
}
```

---

## Core Components

### 1. Permissions Configuration
**File:** `src/app/core/security/permissions.config.ts`

Central configuration file that defines all permissions.

**Key Functions:**
- `hasPermission(role, permissionType, key)`: Checks if a role has access
- `matchRoute(pattern, path)`: Matches wildcard routes (e.g., `/patients/:id`)

**Example:**
```typescript
export const PERMISSIONS: PermissionsConfig = {
  routes: { /* ... */ },
  groups: { /* ... */ },
  items: { /* ... */ },
  features: { /* ... */ }
};
```

### 2. RBAC Service
**File:** `src/app/core/security/rbac.service.ts`

Central service for all permission checks.

**Methods:**
```typescript
class RbacService {
  canAccessRoute(path: string): boolean
  canAccessGroup(groupKey: string): boolean
  canAccessItem(path: string): boolean
  canAccessFeature(featureKey: string): boolean
  hasRole(role: UserRole): boolean
  hasAnyRole(roles: UserRole[]): boolean
  getHomeRoute(): string
}
```

**Usage:**
```typescript
constructor(private rbacService: RbacService) {}

ngOnInit() {
  if (this.rbacService.canAccessFeature('invoice.create')) {
    // Show create button
  }
}
```

### 3. RBAC Guard
**File:** `src/app/core/security/rbac.guard.ts`

Route guard that protects routes based on permissions.

**Behavior:**
- Checks authentication first
- Validates route access using `RbacService`
- Redirects to `/access-denied` if unauthorized
- Prevents route loading if unauthorized

**Usage in Routes:**
```typescript
{
  path: 'dashboard',
  canActivate: [pharmacyGuard, rbacGuard],
  loadComponent: () => import('./dashboard.component')
}
```

### 4. Can Access Directive
**File:** `src/app/shared/directives/can-access.directive.ts`

Structural directive for template-level permission checks.

**Modes:**
- `hide` (default): Removes element from DOM
- `disable`: Keeps visible but disables interactions
- `readonly`: Allows visibility but blocks click/submit events

**Usage:**
```html
<!-- Hide element if no access -->
<button *appCanAccess="'invoice.create'">Create Invoice</button>

<!-- Disable button if no access -->
<button *appCanAccess="'invoice.create'; mode: 'disable'">Create Invoice</button>

<!-- Show but make readonly if no access -->
<form *appCanAccess="'invoice.edit'; mode: 'readonly'">
  <!-- Form content -->
</form>
```

---

## Guards

The system uses multiple guards in sequence for layered security:

### 1. Auth Guard
**File:** `src/app/core/guards/auth.guard.ts`

**Purpose:** Ensures user is authenticated

**Behavior:**
- Checks if user is logged in
- Redirects to `/login` if not authenticated
- Preserves return URL in query params

### 2. Pharmacy Guard
**File:** `src/app/core/guards/pharmacy.guard.ts`

**Purpose:** Prevents platform admins from accessing pharmacy routes

**Behavior:**
- Checks if user is in platform mode
- Redirects platform admins to `/super-admin/dashboard`
- Allows pharmacy users to proceed

### 3. RBAC Guard
**File:** `src/app/core/security/rbac.guard.ts`

**Purpose:** Enforces role-based route access

**Behavior:**
- Requires authentication (uses `AuthService`)
- Checks route access using `RbacService.canAccessRoute()`
- Redirects to `/access-denied` if unauthorized
- Passes attempted route in query params

### 4. Super Admin Guard
**File:** `src/app/core/guards/super-admin.guard.ts`

**Purpose:** Protects super admin routes

**Behavior:**
- Requires authentication
- Checks if user can access system console
- Redirects to `/access-denied` if unauthorized

### Guard Execution Order

```
Route Request
    ↓
authGuard (Check Authentication)
    ↓
pharmacyGuard (Check Platform Mode)
    ↓
rbacGuard (Check Route Permissions)
    ↓
Component Loads
```

---

## Usage Examples

### Example 1: Route Protection

**Route Configuration:**
```typescript
// app.routes.ts
{
  path: 'patients',
  canActivate: [pharmacyGuard, rbacGuard],
  loadChildren: () => import('./features/patients/patients.routes')
}
```

**Permission Configuration:**
```typescript
// permissions.config.ts
routes: {
  '/patients': ['account_owner', 'pharmacy_manager'],
  '/patients/:id': ['account_owner', 'pharmacy_manager']
}
```

### Example 2: Sidebar Visibility

**Component:**
```typescript
// sidebar.component.ts
export class SidebarComponent {
  private rbacService = inject(RbacService);

  isGroupVisible(group: SidebarGroup): boolean {
    return this.rbacService.canAccessGroup(group.key);
  }

  isItemVisible(item: SidebarItem): boolean {
    return this.rbacService.canAccessItem(item.path);
  }
}
```

**Template:**
```html
<nav *ngFor="let group of visibleGroups">
  <div *ngIf="isGroupVisible(group)">
    <a *ngFor="let item of getVisibleItems(group)"
       *ngIf="isItemVisible(item)"
       [routerLink]="item.path">
      {{ item.label }}
    </a>
  </div>
</nav>
```

### Example 3: Feature-level Permissions

**Component:**
```typescript
// invoice.component.ts
export class InvoiceComponent {
  private rbacService = inject(RbacService);

  canCreate(): boolean {
    return this.rbacService.canAccessFeature('invoice.create');
  }

  canEdit(): boolean {
    return this.rbacService.canAccessFeature('invoice.edit');
  }
}
```

**Template:**
```html
<!-- Using service in component -->
<button *ngIf="canCreate()" (click)="createInvoice()">
  Create Invoice
</button>

<!-- Using directive -->
<button *appCanAccess="'invoice.create'" (click)="createInvoice()">
  Create Invoice
</button>

<!-- Disable instead of hide -->
<button *appCanAccess="'invoice.edit'; mode: 'disable'"
        [disabled]="!canEdit()"
        (click)="editInvoice()">
  Edit Invoice
</button>
```

### Example 4: Tab Visibility

**Template:**
```html
<app-tabs>
  <app-tab title="Overview" *appCanAccess="'patient.tabs.overview'">
    <!-- Overview content -->
  </app-tab>
  
  <app-tab title="Orders" *appCanAccess="'patient.tabs.orders'">
    <!-- Orders content -->
  </app-tab>
  
  <app-tab title="Loyalty" *appCanAccess="'patient.tabs.loyalty'">
    <!-- Loyalty content -->
  </app-tab>
</app-tabs>
```

### Example 5: Conditional Rendering Based on Role

**Component:**
```typescript
export class PatientComponent {
  private rbacService = inject(RbacService);

  showKPICards(): boolean {
    return this.rbacService.canAccessFeature('patient.overview.kpi-cards');
  }

  showRevenueTab(): boolean {
    return this.rbacService.canAccessFeature('patient.tabs.revenue');
  }
}
```

**Template:**
```html
<div *ngIf="showKPICards()" class="kpi-cards">
  <!-- KPI Cards -->
</div>
```

---

## Permission Flow

### Route Access Flow

```
User navigates to /patients/123
    ↓
authGuard checks authentication
    ↓ (if authenticated)
pharmacyGuard checks platform mode
    ↓ (if pharmacy user)
rbacGuard calls RbacService.canAccessRoute('/patients/123')
    ↓
RbacService normalizes path: '/patients/123'
    ↓
Checks exact match in PERMISSIONS.routes
    ↓ (not found)
Checks wildcard patterns: '/patients/:id'
    ↓ (match found)
Calls hasPermission(role, 'routes', '/patients/:id')
    ↓
hasPermission checks if role is ACCOUNT_OWNER (always allowed)
    ↓ (if not ACCOUNT_OWNER)
Checks if role is in allowedRoles array
    ↓
Returns true/false
    ↓
If true: Route loads
If false: Redirect to /access-denied
```

### Feature Access Flow

```
Component checks feature permission
    ↓
Calls RbacService.canAccessFeature('invoice.create')
    ↓
RbacService gets current user role
    ↓
Checks if role is ACCOUNT_OWNER (always allowed)
    ↓ (if not ACCOUNT_OWNER)
Calls hasPermission(role, 'features', 'invoice.create')
    ↓
hasPermission looks up PERMISSIONS.features['invoice.create']
    ↓
Checks if role is in allowedRoles array
    ↓
Returns true/false
    ↓
Component/Directive shows/hides element
```

---

## Best Practices

### 1. Always Use Guards for Routes
```typescript
// ✅ Good
{
  path: 'dashboard',
  canActivate: [pharmacyGuard, rbacGuard],
  loadComponent: () => import('./dashboard.component')
}

// ❌ Bad - No protection
{
  path: 'dashboard',
  loadComponent: () => import('./dashboard.component')
}
```

### 2. Use Feature Permissions for UI Elements
```typescript
// ✅ Good - Granular control
features: {
  'invoice.create': ['account_owner', 'pharmacy_staff'],
  'invoice.edit': ['account_owner', 'pharmacy_manager'],
  'invoice.delete': ['account_owner']
}

// ❌ Bad - Too broad
features: {
  'invoice': ['account_owner', 'pharmacy_staff'] // Can't differentiate actions
}
```

### 3. Prefer Directives for Template Checks
```html
<!-- ✅ Good - Declarative, clean -->
<button *appCanAccess="'invoice.create'">Create</button>

<!-- ❌ Bad - Imperative, verbose -->
<button *ngIf="rbacService.canAccessFeature('invoice.create')">Create</button>
```

### 4. Use Descriptive Feature Keys
```typescript
// ✅ Good - Clear and specific
'patient.overview.kpi-cards'
'patient.tabs.orders'
'invoice.actions.delete'

// ❌ Bad - Vague
'kpi'
'tab1'
'action'
```

### 5. Document Permission Rules
```typescript
// ✅ Good - Clear comments
'/people/payroll': ['account_owner'], // PHARMACY_MANAGER should NOT see
'/purchases': ['account_owner', 'pharmacy_inventory_manager'], // Procurement only

// ❌ Bad - No context
'/people/payroll': ['account_owner']
```

### 6. Default Deny Principle
```typescript
// ✅ Good - Explicitly deny by default
canAccessRoute(path: string): boolean {
  // ... checks ...
  return false; // Default deny
}

// ❌ Bad - Default allow
canAccessRoute(path: string): boolean {
  return true; // Security risk!
}
```

### 7. Normalize Paths
```typescript
// ✅ Good - Handles variations
const normalizedPath = path.split('?')[0].replace(/\/$/, '') || '/';

// ❌ Bad - Exact match only
if (PERMISSIONS.routes[path]) { // Fails for /patients/ vs /patients
```

---

## File Structure

```
src/app/
├── core/
│   ├── guards/
│   │   ├── auth.guard.ts              # Authentication guard
│   │   ├── pharmacy.guard.ts          # Platform mode guard
│   │   ├── super-admin.guard.ts       # Super admin guard
│   │   └── public.guard.ts           # Public route guard
│   │
│   ├── security/
│   │   ├── permissions.config.ts      # ⭐ Permission configuration
│   │   ├── rbac.service.ts            # ⭐ RBAC service
│   │   └── rbac.guard.ts              # ⭐ RBAC route guard
│   │
│   ├── models/
│   │   └── user.model.ts              # UserRole enum, User interface
│   │
│   └── services/
│       └── auth.service.ts            # Authentication service
│
├── shared/
│   └── directives/
│       └── can-access.directive.ts   # ⭐ Permission directive
│
└── layout/
    └── main-layout/
        └── components/
            └── sidebar/
                ├── sidebar.component.ts    # Uses RbacService
                └── sidebar.config.ts       # Sidebar configuration
```

**Key Files:**
- ⭐ `permissions.config.ts` - Central permission configuration
- ⭐ `rbac.service.ts` - Permission checking service
- ⭐ `rbac.guard.ts` - Route protection guard
- ⭐ `can-access.directive.ts` - Template directive

---

## Adding New Permissions

### Step 1: Define Permission in Config
```typescript
// permissions.config.ts
export const PERMISSIONS: PermissionsConfig = {
  features: {
    // Add new feature
    'new-feature.action': ['account_owner', 'pharmacy_manager']
  }
};
```

### Step 2: Use in Component/Directive
```html
<!-- Template -->
<div *appCanAccess="'new-feature.action'">
  <!-- Content -->
</div>
```

### Step 3: Test with Different Roles
- Test with `ACCOUNT_OWNER` (should have access)
- Test with `PHARMACY_MANAGER` (should have access)
- Test with `PHARMACY_STAFF` (should NOT have access)

---

## Troubleshooting

### Issue: Route not accessible
**Check:**
1. Is route defined in `PERMISSIONS.routes`?
2. Is role included in allowed roles array?
3. Is `rbacGuard` applied to route?
4. Is user authenticated?

### Issue: Feature not showing
**Check:**
1. Is feature key defined in `PERMISSIONS.features`?
2. Is role included in allowed roles array?
3. Is directive syntax correct: `*appCanAccess="'feature.key'"`?
4. Check browser console for errors

### Issue: Wildcard route not matching
**Check:**
1. Pattern format: `/patients/:id` (not `/patients/*`)
2. Path normalization: trailing slashes removed
3. Query params removed before matching

---

## Summary

The roles and permissions system provides:
- ✅ **Centralized Configuration**: All permissions in one file
- ✅ **Multi-layer Security**: Guards, services, and directives
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Flexibility**: Wildcard routes, feature-level permissions
- ✅ **Maintainability**: Clear structure and documentation
- ✅ **Security**: Default deny principle, explicit permissions

For questions or issues, refer to the code comments in:
- `src/app/core/security/permissions.config.ts`
- `src/app/core/security/rbac.service.ts`
- `src/app/core/security/rbac.guard.ts`



