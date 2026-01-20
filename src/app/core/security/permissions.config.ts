/**
 * RBAC Permissions Configuration
 *
 * Centralized, config-driven permission system for Role-Based Access Control.
 * This file defines ALL role-based access rules for:
 * - Routes (with wildcard support)
 * - Sidebar groups
 * - Sidebar items
 * - Page-level features (tabs, buttons, KPI cards, table actions)
 *
 * Roles:
 * - ACCOUNT_OWNER: Full access to everything
 * - PHARMACY_MANAGER: Restricted access (no dashboard, limited patient/staff views)
 * - PHARMACY_STAFF: Very limited access (only invoices, drugs, bundles, inventory map/transfers)
 * - PHARMACY_INVENTORY_MANAGER: Inventory-focused access (procurement, inventory alerts, invoices with restrictions)
 */

import {UserRole} from '../models/user.model';

export interface PermissionsConfig {
  routes: Record<string, string[]>;
  groups: Record<string, string[]>;
  items: Record<string, string[]>;
  features: Record<string, string[]>;
}

export const PERMISSIONS: PermissionsConfig = {
  // Route permissions
  // Routes support wildcard patterns (e.g., /patients/:id)
  routes: {
    // ACCOUNT_OWNER has access to everything (handled in service)
    '/dashboard': ['account_owner'],
    '/patients': ['account_owner', 'pharmacy_manager'],
    '/patients/:id': ['account_owner', 'pharmacy_manager'],
    '/pharmacy-staff': ['account_owner', 'pharmacy_manager'],
    '/pharmacy-staff/:id': ['account_owner', 'pharmacy_manager'],
    '/people/payroll': ['account_owner'], // PHARMACY_MANAGER should NOT see
    '/people/attendance': ['account_owner', 'pharmacy_manager'], // PHARMACY_MANAGER should NOT see
    '/people/performance': ['account_owner'], // PHARMACY_MANAGER should NOT see
    '/purchases': ['account_owner', 'pharmacy_inventory_manager'], // PHARMACY_MANAGER should NOT see (procurement)
    '/suppliers': ['account_owner', 'pharmacy_inventory_manager'], // PHARMACY_MANAGER should NOT see (procurement)
    '/audit-logs': ['account_owner'], // PHARMACY_MANAGER should NOT see
    '/inventory/movements': ['account_owner'], // PHARMACY_MANAGER should NOT see
    '/growth/referrals': ['account_owner'], // PHARMACY_MANAGER should NOT see
    '/system/permissions': ['account_owner'], // PHARMACY_MANAGER should NOT see
    '/system/features': ['account_owner'], // PHARMACY_MANAGER should NOT see
    '/settings': ['account_owner', 'pharmacy_manager'],
    '/invoices': ['account_owner', 'pharmacy_manager', 'pharmacy_staff', 'pharmacy_inventory_manager'],
    '/invoices/new': ['account_owner', 'pharmacy_manager', 'pharmacy_staff', 'pharmacy_inventory_manager'],
    '/invoices/:id': ['account_owner', 'pharmacy_manager', 'pharmacy_staff', 'pharmacy_inventory_manager'],
    '/invoices/:id/edit': ['account_owner', 'pharmacy_manager', 'pharmacy_staff'],
    '/drugs': ['account_owner', 'pharmacy_manager', 'pharmacy_staff'],
    '/drugs/new': ['account_owner', 'pharmacy_manager', 'pharmacy_staff'],
    '/bundles': ['account_owner', 'pharmacy_staff','pharmacy_manager'],
    '/inventory/map': ['account_owner', 'pharmacy_staff','pharmacy_manager'],
    '/inventory/transfers': ['account_owner', 'pharmacy_staff','pharmacy_manager'],
    '/inventory/alerts': ['account_owner', 'pharmacy_manager', 'pharmacy_inventory_manager'],
    '/inventory/requested-products': ['account_owner', 'pharmacy_manager', 'pharmacy_staff', 'pharmacy_inventory_manager'],
    '/payments/methods': ['account_owner', 'pharmacy_inventory_manager'],
    '/vouchers': ['account_owner', 'pharmacy_manager', 'pharmacy_staff'],
    '/vouchers/new': ['account_owner', 'pharmacy_manager', 'pharmacy_staff'],
    '/vouchers/:id/edit': ['account_owner', 'pharmacy_manager', 'pharmacy_staff'],
  },

  // Sidebar group permissions
  // Groups are visible if at least one item in the group is visible
  groups: {
    'overview': ['account_owner'],
    'operations': ['account_owner', 'pharmacy_manager', 'pharmacy_staff'], // Visible because /patients and /pharmacy-staff are in it
    'people': ['account_owner', 'pharmacy_manager'], // PHARMACY_MANAGER should NOT see (no payroll/performance access)
    'inventory': ['account_owner', 'pharmacy_manager', 'pharmacy_staff', 'pharmacy_inventory_manager'], // Visible because /drugs is in it for PHARMACY_MANAGER
    'procurement': ['account_owner', 'pharmacy_inventory_manager'], // PHARMACY_MANAGER should NOT see
    'finance': ['account_owner', 'pharmacy_inventory_manager'], // PHARMACY_MANAGER should NOT see (no audit-logs/movements)
    'growth': ['account_owner'], // PHARMACY_MANAGER should NOT see
    'system': ['account_owner', 'pharmacy_manager', 'pharmacy_inventory_manager'], // Visible because /settings is in it for PHARMACY_MANAGER and /payments/methods for PHARMACY_INVENTORY_MANAGER
    'support': ['account_owner', 'pharmacy_staff', 'pharmacy_inventory_manager'], // PHARMACY_MANAGER should NOT see
  },

  // Sidebar item permissions
  // PHARMACY_MANAGER should ONLY see:
  // - /patients, /pharmacy-staff (with restrictions on tabs/features)
  // - /drugs (home screen)
  // - /settings (but NOT Account Information tab)
  items: {
    '/dashboard': ['account_owner'],
    '/invoices': ['account_owner', 'pharmacy_manager', 'pharmacy_staff', 'pharmacy_inventory_manager'], // PHARMACY_MANAGER should NOT see
    '/patients': ['account_owner', 'pharmacy_manager'],
    '/pharmacy-staff': ['account_owner', 'pharmacy_manager'],
    '/people/payroll': ['account_owner'], // PHARMACY_MANAGER should NOT see
    '/people/performance': ['account_owner'], // PHARMACY_MANAGER should NOT see
    '/people/attendance': ['account_owner', 'pharmacy_manager'], // PHARMACY_MANAGER should NOT see
    '/people/training': ['account_owner'], // PHARMACY_MANAGER should NOT see
    '/drugs': ['account_owner', 'pharmacy_manager', 'pharmacy_staff'], // Home screen for PHARMACY_MANAGER
    '/bundles': ['account_owner', 'pharmacy_staff', 'pharmacy_manager'], // PHARMACY_MANAGER should NOT see
    '/inventory/alerts': ['account_owner', 'pharmacy_inventory_manager', 'pharmacy_manager'], // PHARMACY_MANAGER should NOT see
    '/inventory/requested-products': ['account_owner', 'pharmacy_manager', 'pharmacy_staff', 'pharmacy_inventory_manager'],
    '/inventory/transfers': ['account_owner', 'pharmacy_staff', 'pharmacy_manager'], // PHARMACY_MANAGER should NOT see
    '/inventory/map': ['account_owner', 'pharmacy_staff', 'pharmacy_manager'], // PHARMACY_MANAGER should NOT see
    '/purchases': ['account_owner', 'pharmacy_inventory_manager'], // PHARMACY_MANAGER should NOT see (procurement)
    '/suppliers': ['account_owner', 'pharmacy_inventory_manager'], // PHARMACY_MANAGER should NOT see (procurement)
    '/payments': ['account_owner'], // PHARMACY_MANAGER should NOT see
    '/payments/methods': ['account_owner', 'pharmacy_inventory_manager'], // Payment methods management
    '/audit-logs': ['account_owner'], // PHARMACY_MANAGER should NOT see
    '/inventory/movements': ['account_owner'], // PHARMACY_MANAGER should NOT see
    '/growth/referrals': ['account_owner'], // PHARMACY_MANAGER should NOT see
    '/system/automation': ['account_owner'], // PHARMACY_MANAGER should NOT see
    '/system/migration': ['account_owner'], // PHARMACY_MANAGER should NOT see
    '/system/permissions': ['account_owner'], // PHARMACY_MANAGER should NOT see
    '/system/features': ['account_owner'], // PHARMACY_MANAGER should NOT see
    '/settings': ['account_owner', 'pharmacy_manager'],
    '/reports': ['account_owner'], // PHARMACY_MANAGER should NOT see
    '/vouchers': ['account_owner', 'pharmacy_manager', 'pharmacy_staff'],
  },

  // Feature-level permissions (for tabs, buttons, KPI cards, table actions)
  features: {
    // Patient page features
    'patient.overview.kpi-cards': ['account_owner'],
    'patient.tabs.orders': ['account_owner'],
    'patient.tabs.loyalty': ['account_owner'],
    'patient.tabs.revenue': ['account_owner'],

    // Staff profile page features
    'staff.tabs.details': ['account_owner', 'pharmacy_manager'],
    'staff.tabs.performance': ['account_owner'],
    'staff.tabs.risk': ['account_owner'],
    'staff.tabs.activity': ['account_owner'],

    // Invoice page features
    'invoice.create': ['account_owner', 'pharmacy_staff', 'pharmacy_manager'],
    'invoice.actions': ['account_owner', 'pharmacy_staff', 'pharmacy_manager'],

    // Settings page features
    'settings.tabs.account': ['account_owner'],

    // Voucher page features
    'voucher.view': ['account_owner', 'pharmacy_manager', 'pharmacy_staff'],
    'voucher.create': ['account_owner', 'pharmacy_manager', 'pharmacy_staff'],
    'voucher.edit': ['account_owner', 'pharmacy_manager', 'pharmacy_staff'],
    'voucher.actions': ['account_owner', 'pharmacy_manager', 'pharmacy_staff'],

    // Patient page features
    'patient.tabs.vouchers': ['account_owner', 'pharmacy_manager', 'pharmacy_staff'],
  },
};

/**
 * Helper function to check if a role has access to a permission
 */
export function hasPermission(
  role: UserRole | string,
  permissionType: 'routes' | 'groups' | 'items' | 'features',
  key: string
): boolean {
  const permissions = PERMISSIONS[permissionType];
  const allowedRoles = permissions[key] || [];

  // ACCOUNT_OWNER always has access
  if (role === UserRole.ACCOUNT_OWNER) {
    return true;
  }

  return allowedRoles.includes(role);
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

