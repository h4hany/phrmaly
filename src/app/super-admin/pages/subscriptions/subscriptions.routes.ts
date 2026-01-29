import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./subscriptions.component').then(m => m.SubscriptionsComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./create-plan/create-plan.component').then(m => m.CreatePlanComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./create-plan/create-plan.component').then(m => m.CreatePlanComponent)
  }
];



