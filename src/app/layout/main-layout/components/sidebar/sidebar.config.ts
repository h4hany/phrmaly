/**
 * Sidebar Navigation Configuration
 * 
 * Centralized, config-driven navigation structure.
 * All navigation items must be defined here - NO hardcoded items in templates.
 * 
 * Business Domain Grouping:
 * - Overview: Dashboard
 * - Operations: Sales, Customers, Staff
 * - People & HR: Staff Profiles, Attendance, Payroll, Performance, Training
 * - Inventory: Products, Bundles, Alerts, Transfers, Shelf Map
 * - Procurement: Suppliers, Orders
 * - Finance: Payments, Audit Logs, Drug Movements
 * - Growth: Referrals
 * - System: Automation, Migration, Permissions, Feature Flags, Settings
 * - Support: Help & Support
 */

import type { SidebarGroup, SidebarItem } from './sidebar.models';

export type { SidebarGroup, SidebarItem };

export const SIDEBAR_GROUPS: SidebarGroup[] = [
  // Overview Group
  {
    key: 'overview',
    label: 'nav.overview',
    icon: 'layout-grid',
    items: [
      {
        path: '/dashboard',
        label: 'nav.dashboard',
        icon: 'layout-grid',
        exact: true
      }
    ],
    collapsedByDefault: false,
    order: 1
  },

  // Operations Group
  {
    key: 'operations',
    label: 'nav.operations',
    icon: 'briefcase',
    items: [
      {
        path: '/invoices',
        label: 'nav.sales',
        icon: 'receipt'
      },
      {
        path: '/patients',
        label: 'nav.customers',
        icon: 'user-heart'
      },
      {
        path: '/pharmacy-staff',
        label: 'nav.pharmacyStaff',
        icon: 'id-badge'
      }
    ],
    collapsedByDefault: true,
    order: 2
  },

  // People & HR Group
  {
    key: 'people',
    label: 'nav.people',
    icon: 'users',
    items: [
      {
        path: '/pharmacy-staff',
        label: 'nav.staffProfiles',
        icon: 'id-badge'
      },
      {
        path: '/people/attendance',
        label: 'nav.attendance',
        icon: 'clock'
      },
      {
        path: '/people/payroll',
        label: 'nav.payroll',
        icon: 'credit-card'
      },
      {
        path: '/people/performance',
        label: 'nav.performance',
        icon: 'chart'
      },
      {
        path: '/people/training',
        label: 'nav.training',
        icon: 'graduation-cap'
      }
    ],
    collapsedByDefault: true,
    order: 3
  },

  // Inventory Group
  {
    key: 'inventory',
    label: 'nav.inventory',
    icon: 'package',
    items: [
      {
        path: '/drugs',
        label: 'nav.products',
        icon: 'pill-bottle'
      },
      {
        path: '/bundles',
        label: 'nav.bundles',
        icon: 'package'
      },
      {
        path: '/inventory/alerts',
        label: 'nav.inventoryAlerts',
        icon: 'bell-warning'
      },
      {
        path: '/inventory/transfers',
        label: 'nav.transfers',
        icon: 'arrows-left-right'
      },
      {
        path: '/inventory/map',
        label: 'nav.pharmacyMap',
        icon: 'map-grid'
      }
    ],
    collapsedByDefault: true,
    order: 4
  },

  // Procurement Group
  {
    key: 'procurement',
    label: 'nav.procurement',
    icon: 'factory',
    items: [
      {
        path: '/suppliers',
        label: 'nav.suppliers',
        icon: 'factory'
      },
      {
        path: '/purchases',
        label: 'nav.orders',
        icon: 'clipboard-list'
      }
    ],
    collapsedByDefault: true,
    order: 5
  },

  // Finance Group
  {
    key: 'finance',
    label: 'nav.finance',
    icon: 'credit-card',
    items: [
      {
        path: '/payments',
        label: 'nav.payments',
        icon: 'credit-card'
      },
      {
        path: '/audit-logs',
        label: 'nav.auditLogs',
        icon: 'shield-check'
      },
      {
        path: '/inventory/movements',
        label: 'nav.drugMovements',
        icon: 'activity-pulse'
      }
    ],
    collapsedByDefault: true,
    order: 6
  },

  // Growth Group
  {
    key: 'growth',
    label: 'nav.growth',
    icon: 'trending-up',
    items: [
      {
        path: '/growth/referrals',
        label: 'nav.referrals',
        icon: 'handshake'
      }
    ],
    collapsedByDefault: true,
    order: 7
  },

  // System Console Group (Platform Admin Only)
  {
    key: 'system-console',
    label: 'nav.systemConsole',
    icon: 'shield-check',
    items: [
      {
        path: '/system/dashboard',
        label: 'nav.platformDashboard',
        icon: 'layout-grid'
      },
      {
        path: '/system/accounts',
        label: 'nav.accounts',
        icon: 'users'
      },
      {
        path: '/system/subscriptions',
        label: 'nav.subscriptions',
        icon: 'credit-card'
      },
      {
        path: '/system/catalog',
        label: 'nav.globalDrugs',
        icon: 'pill-bottle'
      },
      {
        path: '/system/support',
        label: 'nav.supportTickets',
        icon: 'help-circle'
      },
      {
        path: '/system/feature-flags',
        label: 'nav.platformFeatures',
        icon: 'toggle-sliders'
      },
      {
        path: '/system/risk',
        label: 'nav.accountRisk',
        icon: 'shield-check'
      },
      {
        path: '/system/admins',
        label: 'nav.adminUsers',
        icon: 'id-badge'
      },
      {
        path: '/system/analytics',
        label: 'nav.platformAnalytics',
        icon: 'chart'
      }
    ],
    collapsedByDefault: true,
    order: 7,
    roles: ['super_admin', 'support_admin', 'sales_admin', 'finance_admin']
  },

  // System Group (Pharmacy-level)
  {
    key: 'system',
    label: 'nav.system',
    icon: 'settings',
    items: [
      {
        path: '/system/automation',
        label: 'nav.automation',
        icon: 'magic-wand'
      },
      {
        path: '/system/migration',
        label: 'nav.dataImport',
        icon: 'database-arrow-down'
      },
      {
        path: '/system/permissions',
        label: 'nav.accessControl',
        icon: 'lock-key'
      },
      {
        path: '/system/features',
        label: 'nav.featureFlags',
        icon: 'toggle-sliders'
      },
      {
        path: '/settings',
        label: 'nav.settings',
        icon: 'gear'
      }
    ],
    collapsedByDefault: true,
    order: 8
  },

  // Support Group
  {
    key: 'support',
    label: 'nav.support',
    icon: 'help-circle',
    items: [
      {
        path: '/reports',
        label: 'nav.helpSupport',
        icon: 'help-circle'
      }
    ],
    collapsedByDefault: false,
    order: 9
  }
];

