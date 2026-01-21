import { Routes } from '@angular/router';
import { superAdminGuard } from '../core/guards/super-admin.guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    canActivate: [superAdminGuard],
    loadComponent: () => import('./pages/dashboard/platform-dashboard.component').then(m => m.PlatformDashboardComponent)
  },
  {
    path: 'accounts',
    canActivate: [superAdminGuard],
    loadComponent: () => import('./pages/accounts/accounts.component').then(m => m.AccountsComponent)
  },
  {
    path: 'accounts/new',
    canActivate: [superAdminGuard],
    loadComponent: () => import('./pages/accounts/create-account/create-account.component').then(m => m.CreateAccountComponent)
  },
  {
    path: 'subscriptions',
    canActivate: [superAdminGuard],
    loadChildren: () => import('./pages/subscriptions/subscriptions.routes').then(m => m.routes)
  },
  {
    path: 'catalog',
    canActivate: [superAdminGuard],
    loadChildren: () => import('./pages/catalog/catalog.routes').then(m => m.routes)
  },
  {
    path: 'support',
    canActivate: [superAdminGuard],
    loadChildren: () => import('./pages/support/support.routes').then(m => m.routes)
  },
  {
    path: 'feature-flags',
    canActivate: [superAdminGuard],
    loadComponent: () => import('./pages/feature-flags/platform-feature-flags.component').then(m => m.PlatformFeatureFlagsComponent)
  },
  {
    path: 'risk',
    canActivate: [superAdminGuard],
    loadComponent: () => import('./pages/risk/risk-center.component').then(m => m.RiskCenterComponent)
  },
  {
    path: 'admins',
    canActivate: [superAdminGuard],
    loadComponent: () => import('./pages/admins/admins.component').then(m => m.AdminsComponent)
  },
  {
    path: 'analytics',
    canActivate: [superAdminGuard],
    loadComponent: () => import('./pages/analytics/platform-analytics.component').then(m => m.PlatformAnalyticsComponent)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];

