import { Routes } from '@angular/router';
import { platformGuard } from '../../core/guards/platform.guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    canActivate: [platformGuard],
    loadComponent: () => import('./dashboard/platform-dashboard.component').then(m => m.PlatformDashboardComponent)
  },
  {
    path: 'accounts',
    canActivate: [platformGuard],
    loadComponent: () => import('./accounts/accounts.component').then(m => m.AccountsComponent)
  },
  {
    path: 'subscriptions',
    canActivate: [platformGuard],
    loadChildren: () => import('./subscriptions/subscriptions.routes').then(m => m.routes)
  },
  {
    path: 'catalog',
    canActivate: [platformGuard],
    loadChildren: () => import('./catalog/catalog.routes').then(m => m.routes)
  },
  {
    path: 'support',
    canActivate: [platformGuard],
    loadChildren: () => import('./support/support.routes').then(m => m.routes)
  },
  {
    path: 'feature-flags',
    canActivate: [platformGuard],
    loadComponent: () => import('./feature-flags/platform-feature-flags.component').then(m => m.PlatformFeatureFlagsComponent)
  },
  {
    path: 'risk',
    canActivate: [platformGuard],
    loadComponent: () => import('./risk/risk-center.component').then(m => m.RiskCenterComponent)
  },
  {
    path: 'admins',
    canActivate: [platformGuard],
    loadComponent: () => import('./admins/admins.component').then(m => m.AdminsComponent)
  },
  {
    path: 'analytics',
    canActivate: [platformGuard],
    loadComponent: () => import('./analytics/platform-analytics.component').then(m => m.PlatformAnalyticsComponent)
  }
];



