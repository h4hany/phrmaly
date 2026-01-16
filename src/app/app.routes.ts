import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'patients',
        loadChildren: () => import('./features/patients/patients.routes').then(m => m.routes)
      },
      {
        path: 'drugs',
        loadChildren: () => import('./features/drugs/drugs.routes').then(m => m.routes)
      },
      {
        path: 'purchases',
        loadChildren: () => import('./features/purchases/purchases.routes').then(m => m.routes)
      },
      {
        path: 'invoices',
        loadChildren: () => import('./features/invoices/invoices.routes').then(m => m.routes)
      },
      {
        path: 'suppliers',
        loadChildren: () => import('./features/suppliers/suppliers.routes').then(m => m.routes)
      },
      {
        path: 'payments',
        loadChildren: () => import('./features/payments/payments.routes').then(m => m.routes)
      },
      {
        path: 'reports',
        loadChildren: () => import('./features/reports/reports.routes').then(m => m.routes)
      },
      {
        path: 'settings',
        loadChildren: () => import('./features/settings/settings.routes').then(m => m.routes)
      },
      {
        path: 'bundles',
        loadChildren: () => import('./features/bundles/bundles.routes').then(m => m.routes)
      },
      {
        path: 'inventory',
        loadChildren: () => import('./features/inventory/inventory.routes').then(m => m.routes)
      },
      {
        path: 'inventory/movements',
        loadChildren: () => import('./features/inventory-movements/inventory-movements.routes').then(m => m.routes)
      },
      {
        path: 'inventory/transfers',
        loadChildren: () => import('./features/inventory-transfers/inventory-transfers.routes').then(m => m.routes)
      },
      {
        path: 'inventory/map',
        loadComponent: () => import('./features/inventory-map/inventory-map.component').then(m => m.InventoryMapComponent)
      },
      {
        path: 'growth/referrals',
        loadChildren: () => import('./features/referrals/referrals.routes').then(m => m.routes)
      },
      {
        path: 'system/automation',
        loadChildren: () => import('./features/automation/automation.routes').then(m => m.routes)
      },
      {
        path: 'system/migration',
        loadComponent: () => import('./features/migration/migration.component').then(m => m.MigrationComponent)
      },
      {
        path: 'system/permissions',
        loadComponent: () => import('./features/permissions/permissions.component').then(m => m.PermissionsComponent)
      },
      {
        path: 'system/features',
        loadComponent: () => import('./features/feature-flags/feature-flags.component').then(m => m.FeatureFlagsComponent)
      },
      {
        path: 'pharmacy-staff',
        loadChildren: () => import('./features/pharmacy-staff/pharmacy-staff.routes').then(m => m.routes)
      },
      {
        path: 'audit-logs',
        loadChildren: () => import('./features/audit-logs/audit-logs.routes').then(m => m.routes)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
