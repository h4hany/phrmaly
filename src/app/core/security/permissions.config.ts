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
  // Supports both .view (legacy) and .read/.write/.delete/.manage (backend format)
  routes: {
    '/dashboard': ['dashboard.view', 'dashboard.read', 'dashboard.write', 'dashboard.delete', 'dashboard.manage'],
    '/patients': ['patients.view', 'patients.read', 'patients.write', 'patients.delete', 'patients.manage'],
    '/patients/:id': ['patients.view', 'patients.read', 'patients.write', 'patients.delete', 'patients.manage'],
    '/pharmacy-staff': ['staff.view', 'staff.read', 'staff.write', 'staff.delete', 'staff.manage'],
    '/pharmacy-staff/:id': ['staff.view', 'staff.read', 'staff.write', 'staff.delete', 'staff.manage'],
    '/people/payroll': ['payroll.view', 'payroll.read', 'payroll.write', 'payroll.delete', 'payroll.manage'],
    '/people/attendance': ['attendance.view', 'attendance.read', 'attendance.write', 'attendance.delete', 'attendance.manage'],
    '/people/performance': ['performance.view', 'performance.read', 'performance.write', 'performance.delete', 'performance.manage'],
    '/people/training': ['training.view', 'training.read', 'training.write', 'training.delete', 'training.manage'],
    '/purchases': ['purchases.view', 'purchases.read', 'purchases.write', 'purchases.delete', 'purchases.manage'],
    '/purchases/new': ['purchases.create', 'purchases.write', 'purchases.manage'],
    '/suppliers': ['suppliers.view', 'suppliers.read', 'suppliers.write', 'suppliers.delete', 'suppliers.manage'],
    '/audit-logs': ['audit.view', 'audit.read', 'audit.write', 'audit.delete', 'audit.manage'],
    '/inventory/movements': ['inventory.movements.view', 'inventory.read', 'inventory.write', 'inventory.delete', 'inventory.manage'],
    '/growth/referrals': ['referrals.view', 'referrals.read', 'referrals.write', 'referrals.delete', 'referrals.manage'],
    '/system/permissions': ['system.permissions.manage', 'system.manage'],
    '/system/features': ['system.features.manage', 'system.manage'],
    '/system/automation': ['system.automation.manage', 'system.manage'],
    '/system/migration': ['system.migration.manage', 'system.manage'],
    '/settings': ['settings.view', 'settings.read', 'settings.write', 'settings.delete', 'settings.manage'],
    '/invoices': ['invoices.view', 'invoices.read', 'invoices.write', 'invoices.delete', 'invoices.manage'],
    '/invoices/new': ['invoices.create', 'invoices.write', 'invoices.manage'],
    '/invoices/:id': ['invoices.view', 'invoices.read', 'invoices.write', 'invoices.delete', 'invoices.manage'],
    '/invoices/:id/edit': ['invoices.edit', 'invoices.write', 'invoices.manage'],
    '/drugs': ['drugs.view', 'drugs.read', 'drugs.write', 'drugs.delete', 'drugs.manage'],
    '/drugs/new': ['drugs.create', 'drugs.write', 'drugs.manage'],
    '/bundles': ['bundles.view', 'bundles.read', 'bundles.write', 'bundles.delete', 'bundles.manage'],
    '/inventory/map': ['inventory.map.view', 'inventory.read', 'inventory.write', 'inventory.delete', 'inventory.manage'],
    '/inventory/transfers': ['inventory.transfers.view', 'inventory.read', 'inventory.write', 'inventory.delete', 'inventory.manage'],
    '/inventory/alerts': ['inventory.alerts.view', 'inventory.read', 'inventory.write', 'inventory.delete', 'inventory.manage'],
    '/inventory/requested-products': ['inventory.requested.view', 'inventory.read', 'inventory.write', 'inventory.delete', 'inventory.manage'],
    '/payments': ['payments.view', 'payments.read', 'payments.write', 'payments.delete', 'payments.manage'],
    '/payments/methods': ['payments.methods.manage', 'payments.manage'],
    '/vouchers': ['vouchers.view', 'vouchers.read', 'vouchers.write', 'vouchers.delete', 'vouchers.manage'],
    '/vouchers/new': ['vouchers.create', 'vouchers.write', 'vouchers.manage'],
    '/vouchers/:id/edit': ['vouchers.edit', 'vouchers.write', 'vouchers.manage'],
    '/reports': ['reports.view', 'reports.read', 'reports.write', 'reports.delete', 'reports.manage'],
  },

  // Sidebar group permissions
  // Groups are visible if at least one item in the group is visible
  // Note: Backend uses .read, .write, .delete, .manage format, but we also support .view for backward compatibility
  groups: {
    'overview': ['dashboard.view', 'dashboard.read', 'dashboard.write', 'dashboard.delete', 'dashboard.manage'],
    'operations': ['patients.view', 'patients.read', 'patients.write', 'patients.delete', 'patients.manage', 'invoices.view', 'invoices.read', 'invoices.write', 'invoices.delete', 'invoices.manage', 'vouchers.view', 'vouchers.read', 'vouchers.write', 'vouchers.delete', 'vouchers.manage'], // Visible if user can view patients, invoices, or vouchers
    'people': ['attendance.view', 'attendance.read', 'attendance.write', 'attendance.delete', 'attendance.manage', 'payroll.view', 'payroll.read', 'payroll.write', 'payroll.delete', 'payroll.manage', 'performance.view', 'performance.read', 'performance.write', 'performance.delete', 'performance.manage', 'training.view', 'training.read', 'training.write', 'training.delete', 'training.manage', 'staff.view', 'staff.read', 'staff.write', 'staff.delete', 'staff.manage'], // Visible if user can view any people module
    'inventory': ['drugs.view', 'drugs.read', 'drugs.write', 'drugs.delete', 'drugs.manage', 'inventory.alerts.view', 'inventory.map.view', 'inventory.read', 'inventory.write', 'inventory.delete', 'inventory.manage', 'bundles.view', 'bundles.read', 'bundles.write', 'bundles.delete', 'bundles.manage'], // Visible if user can view any inventory resource
    'procurement': ['purchases.view', 'purchases.read', 'purchases.write', 'purchases.delete', 'purchases.manage', 'suppliers.view', 'suppliers.read', 'suppliers.write', 'suppliers.delete', 'suppliers.manage'], // Visible if user can view procurement resources
    'finance': ['invoices.view', 'invoices.read', 'invoices.write', 'invoices.delete', 'invoices.manage', 'audit.view', 'audit.read', 'audit.write', 'audit.delete', 'audit.manage', 'inventory.movements.view', 'payments.view', 'payments.read', 'payments.write', 'payments.delete', 'payments.manage'], // Visible if user can view financial resources
    'growth': ['referrals.view', 'referrals.read', 'referrals.write', 'referrals.delete', 'referrals.manage'],
    'system': ['settings.view', 'settings.read', 'settings.write', 'settings.delete', 'settings.manage', 'system.permissions.manage', 'system.features.manage', 'system.automation.manage', 'system.migration.manage', 'payments.methods.manage', 'reports.view', 'reports.read', 'reports.write', 'reports.delete', 'reports.manage'], // Visible if user can view settings or manage system
    'support': ['bundles.view', 'bundles.read', 'bundles.write', 'bundles.delete', 'bundles.manage', 'vouchers.view', 'vouchers.read', 'vouchers.write', 'vouchers.delete', 'vouchers.manage'], // Visible if user can view support resources
  },

  // Sidebar item permissions
  // Supports both .view (legacy) and .read/.write/.delete/.manage (backend format)
  items: {
    '/dashboard': ['dashboard.view', 'dashboard.read', 'dashboard.write', 'dashboard.delete', 'dashboard.manage'],
    '/invoices': ['invoices.view', 'invoices.read', 'invoices.write', 'invoices.delete', 'invoices.manage'],
    '/patients': ['patients.view', 'patients.read', 'patients.write', 'patients.delete', 'patients.manage'],
    '/pharmacy-staff': ['staff.view', 'staff.read', 'staff.write', 'staff.delete', 'staff.manage'],
    '/people/payroll': ['payroll.view', 'payroll.read', 'payroll.write', 'payroll.delete', 'payroll.manage'],
    '/people/performance': ['performance.view', 'performance.read', 'performance.write', 'performance.delete', 'performance.manage'],
    '/people/attendance': ['attendance.view', 'attendance.read', 'attendance.write', 'attendance.delete', 'attendance.manage'],
    '/people/training': ['training.view', 'training.read', 'training.write', 'training.delete', 'training.manage'],
    '/drugs': ['drugs.view', 'drugs.read', 'drugs.write', 'drugs.delete', 'drugs.manage'],
    '/bundles': ['bundles.view', 'bundles.read', 'bundles.write', 'bundles.delete', 'bundles.manage'],
    '/inventory/alerts': ['inventory.alerts.view', 'inventory.read', 'inventory.write', 'inventory.delete', 'inventory.manage'],
    '/inventory/requested-products': ['inventory.requested.view', 'inventory.read', 'inventory.write', 'inventory.delete', 'inventory.manage'],
    '/inventory/transfers': ['inventory.transfers.view', 'inventory.read', 'inventory.write', 'inventory.delete', 'inventory.manage'],
    '/inventory/map': ['inventory.map.view', 'inventory.read', 'inventory.write', 'inventory.delete', 'inventory.manage'],
    '/purchases': ['purchases.view', 'purchases.read', 'purchases.write', 'purchases.delete', 'purchases.manage'],
    '/suppliers': ['suppliers.view', 'suppliers.read', 'suppliers.write', 'suppliers.delete', 'suppliers.manage'],
    '/payments': ['payments.view', 'payments.read', 'payments.write', 'payments.delete', 'payments.manage'],
    '/payments/methods': ['payments.methods.manage', 'payments.manage'],
    '/audit-logs': ['audit.view', 'audit.read', 'audit.write', 'audit.delete', 'audit.manage'],
    '/inventory/movements': ['inventory.movements.view', 'inventory.read', 'inventory.write', 'inventory.delete', 'inventory.manage'],
    '/growth/referrals': ['referrals.view', 'referrals.read', 'referrals.write', 'referrals.delete', 'referrals.manage'],
    '/system/automation': ['system.automation.manage', 'system.manage', 'system.write', 'system.read'],
    '/system/migration': ['system.migration.manage', 'system.manage', 'system.write', 'system.read'],
    '/system/permissions': ['system.permissions.manage', 'system.manage', 'system.write', 'system.read'],
    '/system/features': ['system.features.manage', 'system.manage', 'system.write', 'system.read'],
    '/settings': ['settings.view', 'settings.read', 'settings.write', 'settings.delete', 'settings.manage'],
    '/reports': ['reports.view', 'reports.read', 'reports.write', 'reports.delete', 'reports.manage'],
    '/vouchers': ['vouchers.view', 'vouchers.read', 'vouchers.write', 'vouchers.delete', 'vouchers.manage'],
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

