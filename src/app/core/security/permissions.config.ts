/**
 * RBAC Permissions Configuration
 *
 * Centralized, config-driven permission system for Permission-Based Access Control.
 * This file maps routes, sidebar groups, sidebar items, and features to permission keys.
 *
 * Migration Note: Changed from role-based to permission-based system.
 * Each route/group/item/feature now requires a specific permission key instead of role names.
 *
 * Permission Key Format: resource.action (e.g., 'patients.view', 'invoice.create')
 */

export interface PermissionsConfig {
  routes: Record<string, string[]>;
  groups: Record<string, string[]>;
  items: Record<string, string[]>;
  features: Record<string, string[]>;
}

export const PERMISSIONS: PermissionsConfig = {
  // Route permissions
  // Routes support wildcard patterns (e.g., /patients/:id)
  // Each route requires a specific permission key
  routes: {
    '/dashboard': ['dashboard.view'],
    '/patients': ['patients.view'],
    '/patients/:id': ['patients.view'],
    '/pharmacy-staff': ['staff.view'],
    '/pharmacy-staff/:id': ['staff.view'],
    '/people/payroll': ['payroll.view'],
    '/people/attendance': ['attendance.view'],
    '/people/performance': ['performance.view'],
    '/purchases': ['purchases.view'],
    '/suppliers': ['suppliers.view'],
    '/audit-logs': ['audit.view'],
    '/inventory/movements': ['inventory.movements.view'],
    '/growth/referrals': ['referrals.view'],
    '/system/permissions': ['system.permissions.manage'],
    '/system/features': ['system.features.manage'],
    '/settings': ['settings.view'],
    '/invoices': ['invoices.view'],
    '/invoices/new': ['invoices.create'],
    '/invoices/:id': ['invoices.view'],
    '/invoices/:id/edit': ['invoices.edit'],
    '/drugs': ['drugs.view'],
    '/drugs/new': ['drugs.create'],
    '/bundles': ['bundles.view'],
    '/inventory/map': ['inventory.map.view'],
    '/inventory/transfers': ['inventory.transfers.view'],
    '/inventory/alerts': ['inventory.alerts.view'],
    '/inventory/requested-products': ['inventory.requested.view'],
    '/payments/methods': ['payments.methods.manage'],
    '/vouchers': ['vouchers.view'],
    '/vouchers/new': ['vouchers.create'],
    '/purchases/new': ['purchases.create'],
    '/vouchers/:id/edit': ['vouchers.edit'],
    '/system/automation': ['system.automation.manage'],
    '/system/migration': ['system.migration.manage'],
  },

  // Sidebar group permissions
  // Groups are visible if at least one item in the group is visible
  groups: {
    'overview': ['dashboard.view'],
    'operations': ['patients.view', 'staff.view'], // Visible if user can view patients or staff
    'people': ['attendance.view', 'payroll.view', 'performance.view'], // Visible if user can view any people module
    'inventory': ['drugs.view', 'inventory.alerts.view', 'inventory.map.view'], // Visible if user can view any inventory resource
    'procurement': ['purchases.view', 'suppliers.view'], // Visible if user can view procurement resources
    'finance': ['invoices.view', 'audit.view', 'inventory.movements.view'], // Visible if user can view financial resources
    'growth': ['referrals.view'],
    'system': ['settings.view', 'system.permissions.manage', 'payments.methods.manage'], // Visible if user can view settings or manage system
    'support': ['bundles.view', 'vouchers.view'], // Visible if user can view support resources
  },

  // Sidebar item permissions
  items: {
    '/dashboard': ['dashboard.view'],
    '/invoices': ['invoices.view'],
    '/patients': ['patients.view'],
    '/pharmacy-staff': ['staff.view'],
    '/people/payroll': ['payroll.view'],
    '/people/performance': ['performance.view'],
    '/people/attendance': ['attendance.view'],
    '/people/training': ['training.view'],
    '/drugs': ['drugs.view'],
    '/bundles': ['bundles.view'],
    '/inventory/alerts': ['inventory.alerts.view'],
    '/inventory/requested-products': ['inventory.requested.view'],
    '/inventory/transfers': ['inventory.transfers.view'],
    '/inventory/map': ['inventory.map.view'],
    '/purchases': ['purchases.view'],
    '/suppliers': ['suppliers.view'],
    '/payments': ['payments.view'],
    '/payments/methods': ['payments.methods.manage'],
    '/audit-logs': ['audit.view'],
    '/inventory/movements': ['inventory.movements.view'],
    '/growth/referrals': ['referrals.view'],
    '/system/automation': ['system.automation.manage'],
    '/system/migration': ['system.migration.manage'],
    '/system/permissions': ['system.permissions.manage'],
    '/system/features': ['system.features.manage'],
    '/settings': ['settings.view'],
    '/reports': ['reports.view'],
    '/vouchers': ['vouchers.view'],
  },

  // Feature-level permissions (for tabs, buttons, KPI cards, table actions)
  features: {
    // Patient page features
    'patient.overview.kpi-cards': ['patients.kpi.view'],
    'patient.tabs.orders': ['patients.orders.view'],
    'patient.tabs.loyalty': ['patients.loyalty.view'],
    'patient.tabs.revenue': ['patients.revenue.view'],

    // Staff profile page features
    'staff.tabs.details': ['staff.details.view'],
    'staff.tabs.performance': ['staff.performance.view'],
    'staff.tabs.risk': ['staff.risk.view'],
    'staff.tabs.activity': ['staff.activity.view'],

    // Invoice page features
    'invoice.create': ['invoices.create'],
    'invoice.actions': ['invoices.actions'],

    // Settings page features
    'settings.tabs.account': ['settings.account.view'],

    // Voucher page features
    'voucher.view': ['vouchers.view'],
    'voucher.create': ['vouchers.create'],
    'voucher.edit': ['vouchers.edit'],
    'voucher.actions': ['vouchers.actions'],

    // Patient page features
    'patient.tabs.vouchers': ['patients.vouchers.view'],
  },
};

/**
 * Helper function to get required permissions for a resource
 * @param permissionType - Type of permission (routes, groups, items, features)
 * @param key - Resource key (route path, group key, item path, or feature key)
 * @returns Array of required permission keys
 */
export function getRequiredPermissions(
  permissionType: 'routes' | 'groups' | 'items' | 'features',
  key: string
): string[] {
  const permissions = PERMISSIONS[permissionType];
  return permissions[key] || [];
}

/**
 * Helper function to match wildcard routes
 * Supports patterns like /patients/:id matching /patients/123
 */
export function matchRoute(pattern: string, path: string): boolean {
  // Exact match
  if (pattern === path) {
    return true;
  }

  // Wildcard match: convert /patients/:id to regex
  const regexPattern = pattern
    .replace(/:[^/]+/g, '[^/]+') // Replace :param with [^/]+
    .replace(/\//g, '\\/'); // Escape slashes

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(path);
}

