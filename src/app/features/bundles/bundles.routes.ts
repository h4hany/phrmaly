import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./bundles-list/bundles-list.component').then(m => m.BundlesListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./bundle-form/bundle-form.component').then(m => m.BundleFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./bundle-form/bundle-form.component').then(m => m.BundleFormComponent)
  }
];







