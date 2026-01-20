import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./transfers-list/transfers-list.component').then(m => m.TransfersListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./transfer-wizard/transfer-wizard.component').then(m => m.TransferWizardComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./transfer-detail/transfer-detail.component').then(m => m.TransferDetailComponent)
  }
];



