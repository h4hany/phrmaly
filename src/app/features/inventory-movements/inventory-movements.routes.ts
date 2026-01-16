import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./movements-list/movements-list.component').then(m => m.MovementsListComponent)
  },
  {
    path: 'risk',
    loadComponent: () => import('./movements-risk-dashboard/movements-risk-dashboard.component').then(m => m.MovementsRiskDashboardComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./movements-detail/movements-detail.component').then(m => m.MovementsDetailComponent)
  }
];

