import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pharmacy-staff-list/pharmacy-staff-list.component').then(m => m.PharmacyStaffListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./pharmacy-staff-form/pharmacy-staff-form.component').then(m => m.PharmacyStaffFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./pharmacy-staff-detail/pharmacy-staff-detail.component').then(m => m.PharmacyStaffDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pharmacy-staff-form/pharmacy-staff-form.component').then(m => m.PharmacyStaffFormComponent)
  }
];










