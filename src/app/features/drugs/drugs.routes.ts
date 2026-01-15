import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./drugs-list/drugs-list.component').then(m => m.DrugsListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./drug-form/drug-form.component').then(m => m.DrugFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./drug-form/drug-form.component').then(m => m.DrugFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./drug-detail/drug-detail.component').then(m => m.DrugDetailComponent)
  }
];
