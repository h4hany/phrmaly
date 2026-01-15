import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./payments-list/payments-list.component').then(m => m.PaymentsListComponent)
  }
];







