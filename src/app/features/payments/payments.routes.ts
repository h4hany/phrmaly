import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./payments-list/payments-list.component').then(m => m.PaymentsListComponent)
  },
  {
    path: 'methods',
    loadComponent: () => import('./payment-methods-list/payment-methods-list.component').then(m => m.PaymentMethodsListComponent)
  }
];







