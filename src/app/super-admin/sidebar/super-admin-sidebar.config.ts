/**
 * Super Admin Sidebar Navigation Configuration
 *
 * Dedicated navigation for Super Admin portal.
 * All routes are prefixed with /super-admin/*
 */

import type { SidebarGroup, SidebarItem } from '../../layout/main-layout/components/sidebar/sidebar.models';

export type { SidebarGroup, SidebarItem };

export const SUPER_ADMIN_SIDEBAR_GROUPS: SidebarGroup[] = [
  // System Console Group
  {
    key: 'system-console',
    label: 'nav.systemConsole',
    icon: 'shield-check',
    items: [
      {
        path: '/super-admin/dashboard',
        label: 'nav.platformDashboard',
        icon: 'layout-grid'
      },
      {
        path: '/super-admin/accounts',
        label: 'nav.accounts',
        icon: 'users'
      },
      {
        path: '/super-admin/subscriptions',
        label: 'nav.subscriptions',
        icon: 'credit-card'
      },
      {
        path: '/super-admin/support',
        label: 'nav.supportTickets',
        icon: 'help-circle'
      },
      {
        path: '/super-admin/feature-flags',
        label: 'nav.platformFeatures',
        icon: 'toggle-sliders'
      },
      {
        path: '/super-admin/risk',
        label: 'nav.accountRisk',
        icon: 'shield-check'
      },
      {
        path: '/super-admin/admins',
        label: 'nav.adminUsers',
        icon: 'id-badge'
      },
      {
        path: '/super-admin/analytics',
        label: 'nav.platformAnalytics',
        icon: 'chart'
      },
      {
        path: '/super-admin/modules-permissions',
        label: 'nav.modulesPermissions',
        icon: 'shield-check'
      },
      {
        path: '/super-admin/modules',
        label: 'nav.modules',
        icon: 'grid'
      }
    ],
    collapsedByDefault: false,
    order: 1
  },
  // Master Data Group
  {
    key: 'master-data',
    label: 'nav.masterData',
    icon: 'database-arrow-down',
    items: [
      {
        path: '/super-admin/catalog',
        label: 'nav.globalDrugs',
        icon: 'pill-bottle'
      },
      {
        path: '/super-admin/areas',
        label: 'nav.areas',
        icon: 'map-pin'
      },
      {
        path: '/super-admin/countries',
        label: 'nav.countries',
        icon: 'map-grid'
      },
      {
        path: '/super-admin/cities',
        label: 'nav.cities',
        icon: 'factory'
      },
      {
        path: '/super-admin/occupations',
        label: 'nav.occupations',
        icon: 'briefcase'
      }
    ],
    collapsedByDefault: false,
    order: 2
  }
];

