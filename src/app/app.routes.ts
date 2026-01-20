import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { publicGuard } from './core/guards/public.guard';
import { pharmacyGuard } from './core/guards/pharmacy.guard';
import { rbacGuard } from './core/security/rbac.guard';

export const routes: Routes = [
  // Public routes (no authentication required, but redirect authenticated users)
  {
    path: '',
    canActivate: [publicGuard],
    loadComponent: () => import('./features/public/homepage/homepage.component').then(m => m.HomepageComponent)
  },
  {
    path: 'drug-index',
    loadComponent: () => import('./features/public/drug-index/drug-index.component').then(m => m.DrugIndexComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin-login',
    loadComponent: () => import('./features/auth/admin-login/admin-login.component').then(m => m.AdminLoginComponent)
  },
  {
    path: 'access-denied',
    loadComponent: () => import('./features/public/access-denied/access-denied.component').then(m => m.AccessDeniedComponent)
  },
  // Protected routes (authentication required) - All under MainLayoutComponent
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        canActivate: [pharmacyGuard, rbacGuard],
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'patients',
        canActivate: [pharmacyGuard, rbacGuard],
        loadChildren: () => import('./features/patients/patients.routes').then(m => m.routes)
      },
      {
        path: 'drugs',
        canActivate: [pharmacyGuard, rbacGuard],
        loadChildren: () => import('./features/drugs/drugs.routes').then(m => m.routes)
      },
      {
        path: 'purchases',
        canActivate: [pharmacyGuard, rbacGuard],
        loadChildren: () => import('./features/purchases/purchases.routes').then(m => m.routes)
      },
      {
        path: 'invoices',
        canActivate: [pharmacyGuard, rbacGuard],
        loadChildren: () => import('./features/invoices/invoices.routes').then(m => m.routes)
      },
      {
        path: 'suppliers',
        canActivate: [pharmacyGuard, rbacGuard],
        loadChildren: () => import('./features/suppliers/suppliers.routes').then(m => m.routes)
      },
      {
        path: 'payments',
        canActivate: [pharmacyGuard, rbacGuard],
        loadChildren: () => import('./features/payments/payments.routes').then(m => m.routes)
      },
      {
        path: 'reports',
        canActivate: [pharmacyGuard, rbacGuard],
        loadChildren: () => import('./features/reports/reports.routes').then(m => m.routes)
      },
      {
        path: 'settings',
        canActivate: [pharmacyGuard, rbacGuard],
        loadChildren: () => import('./features/settings/settings.routes').then(m => m.routes)
      },
      {
        path: 'bundles',
        canActivate: [pharmacyGuard, rbacGuard],
        loadChildren: () => import('./features/bundles/bundles.routes').then(m => m.routes)
      },
      {
        path: 'inventory',
        canActivate: [pharmacyGuard, rbacGuard],
        loadChildren: () => import('./features/inventory/inventory.routes').then(m => m.routes)
      },
      {
        path: 'inventory/movements',
        canActivate: [pharmacyGuard, rbacGuard],
        loadChildren: () => import('./features/inventory-movements/inventory-movements.routes').then(m => m.routes)
      },
      {
        path: 'inventory/transfers',
        canActivate: [pharmacyGuard, rbacGuard],
        loadChildren: () => import('./features/inventory-transfers/inventory-transfers.routes').then(m => m.routes)
      },
      {
        path: 'inventory/map',
        canActivate: [pharmacyGuard, rbacGuard],
        loadComponent: () => import('./features/inventory-map/inventory-map.component').then(m => m.InventoryMapComponent)
      },
      {
        path: 'growth/referrals',
        canActivate: [pharmacyGuard, rbacGuard],
        loadChildren: () => import('./features/referrals/referrals.routes').then(m => m.routes)
      },
      {
        path: 'system/automation',
        canActivate: [pharmacyGuard, rbacGuard],
        loadChildren: () => import('./features/automation/automation.routes').then(m => m.routes)
      },
      {
        path: 'system/migration',
        canActivate: [pharmacyGuard, rbacGuard],
        loadComponent: () => import('./features/migration/migration.component').then(m => m.MigrationComponent)
      },
      {
        path: 'system/permissions',
        canActivate: [pharmacyGuard, rbacGuard],
        loadComponent: () => import('./features/permissions/permissions.component').then(m => m.PermissionsComponent)
      },
      {
        path: 'system/features',
        canActivate: [pharmacyGuard, rbacGuard],
        loadComponent: () => import('./features/feature-flags/feature-flags.component').then(m => m.FeatureFlagsComponent)
      },
      {
        path: 'pharmacy-staff',
        canActivate: [pharmacyGuard, rbacGuard],
        loadChildren: () => import('./features/pharmacy-staff/pharmacy-staff.routes').then(m => m.routes)
      },
      {
        path: 'audit-logs',
        canActivate: [pharmacyGuard, rbacGuard],
        loadChildren: () => import('./features/audit-logs/audit-logs.routes').then(m => m.routes)
      },
      {
        path: 'people',
        canActivate: [pharmacyGuard, rbacGuard],
        loadChildren: () => import('./features/hr/hr.routes').then(m => m.routes)
      },
      {
        path: 'vouchers',
        canActivate: [pharmacyGuard, rbacGuard],
        loadChildren: () => import('./features/vouchers/vouchers.routes').then(m => m.routes)
      },
      {
        path: 'system',
        loadChildren: () => import('./features/system/system.routes').then(m => m.routes)
      },
      {
        path: '',
        loadComponent: () => import('./features/system/redirect/redirect.component').then(m => m.RedirectComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
