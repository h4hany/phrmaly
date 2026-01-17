/**
 * Main Layout Component (Shell)
 * 
 * Enterprise-grade layout shell that orchestrates:
 * - Sidebar navigation
 * - Header bar
 * - Content area
 * 
 * This component is now a thin shell - all navigation logic
 * has been moved to SidebarComponent and HeaderComponent.
 */

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent, ToastComponent],
  templateUrl: './main-layout.component.html',
  styles: []
})
export class MainLayoutComponent implements OnInit {
  private router = inject(Router);

  currentTitle = 'nav.dashboard';
  subtitle?: string;

  ngOnInit(): void {
    this.updateTitle();
    this.router.events.subscribe(() => {
      this.updateTitle();
    });
  }

  private updateTitle(): void {
    const route = this.router.url.split('/')[1] || 'dashboard';
    const titleMap: { [key: string]: string } = {
      dashboard: 'nav.dashboard',
      patients: 'patient.list',
      drugs: 'drug.list',
      purchases: 'nav.orders',
      invoices: 'nav.sales',
      payments: 'nav.payments',
      suppliers: 'nav.suppliers',
      reports: 'nav.helpSupport',
      settings: 'nav.settings',
      inventory: 'inventory.alerts',
      bundles: 'nav.bundles',
      'pharmacy-staff': 'nav.pharmacyStaff',
      'audit-logs': 'audit.title',
      'inventory-movements': 'movements.title',
      'inventory-transfers': 'transfers.title',
      'inventory-map': 'map.title',
      'growth-referrals': 'referrals.title',
      'system-migration': 'migration.title',
      'system-automation': 'automation.title',
      'system-permissions': 'permissions.title',
      'system-features': 'featureFlags.title'
    };
    this.currentTitle = titleMap[route] || 'nav.dashboard';
    this.subtitle = route === 'dashboard' ? 'dashboard.subtitle' : undefined;
  }
}
