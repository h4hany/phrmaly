import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./automation-list/automation-list.component').then(m => m.AutomationListComponent)
  }
];



