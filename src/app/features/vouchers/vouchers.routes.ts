import { Routes } from '@angular/router';
import { rbacGuard } from '../../core/security/rbac.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [rbacGuard],
    data: { permissions: ['voucher.view'] },
    loadComponent: () => import('./vouchers-list/vouchers-list.component').then(m => m.VouchersListComponent)
  },
  {
    path: 'new',
    canActivate: [rbacGuard],
    data: { permissions: ['voucher.create'] },
    loadComponent: () => import('./voucher-form/voucher-form.component').then(m => m.VoucherFormComponent)
  },
  {
    path: ':id/edit',
    canActivate: [rbacGuard],
    data: { permissions: ['voucher.edit'] },
    loadComponent: () => import('./voucher-form/voucher-form.component').then(m => m.VoucherFormComponent)
  }
];

