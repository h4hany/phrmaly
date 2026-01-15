import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'alerts',
    loadComponent: () => import('./alerts/inventory-alerts.component').then(m => m.InventoryAlertsComponent)
  }
];







