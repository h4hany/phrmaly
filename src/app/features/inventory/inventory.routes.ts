import { Routes } from '@angular/router';
import { UserRole } from '../../core/models/user.model';

// Function to determine which component to load based on user role
function loadInventoryAlertsComponent() {
  // Check user role from localStorage (since inject() is not available in route loaders)
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      // Check if user has pharmacy_inventory_manager or account_owner role
      if (user && (user.role === UserRole.PHARMACY_INVENTORY_MANAGER || user.role === UserRole.ACCOUNT_OWNER)) {
        return import('./alerts/pharmacies-inventory-alerts.component').then(m => m.PharmaciesInventoryAlertsComponent);
      }
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
    }
  }
  
  // Default to regular inventory alerts
  return import('./alerts/inventory-alerts.component').then(m => m.InventoryAlertsComponent);
}

export const routes: Routes = [
  {
    path: 'alerts',
    loadComponent: loadInventoryAlertsComponent
  },
  {
    path: 'requested-products',
    loadComponent: () => import('./requested-products/requested-products-list.component').then(m => m.RequestedProductsListComponent)
  }
];







