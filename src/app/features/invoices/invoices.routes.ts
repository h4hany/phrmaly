import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./invoices-list/invoices-list.component').then(m => m.InvoicesListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./invoice-form/invoice-form.component').then(m => m.InvoiceFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./invoice-detail/invoice-detail.component').then(m => m.InvoiceDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./invoice-form/invoice-form.component').then(m => m.InvoiceFormComponent)
  }
];
