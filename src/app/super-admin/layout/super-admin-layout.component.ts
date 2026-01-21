/**
 * Super Admin Layout Component (Shell)
 * 
 * Enterprise-grade layout shell for Super Admin portal.
 * Reuses the same design system as MainLayoutComponent.
 */

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { SuperAdminSidebarComponent } from '../sidebar/super-admin-sidebar.component';
import { HeaderComponent } from '../../layout/main-layout/components/header/header.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'app-super-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SuperAdminSidebarComponent, HeaderComponent, ToastComponent],
  templateUrl: './super-admin-layout.component.html',
  styles: []
})
export class SuperAdminLayoutComponent implements OnInit {
  private router = inject(Router);

  currentTitle = 'nav.platformDashboard';
  subtitle?: string;

  ngOnInit(): void {
    this.updateTitle();
    this.router.events.subscribe(() => {
      this.updateTitle();
    });
  }

  private updateTitle(): void {
    const route = this.router.url.split('/').pop() || 'dashboard';
    const titleMap: { [key: string]: string } = {
      dashboard: 'nav.platformDashboard',
      accounts: 'nav.accounts',
      admins: 'nav.adminUsers',
      subscriptions: 'nav.subscriptions',
      catalog: 'nav.globalDrugs',
      support: 'nav.supportTickets',
      'feature-flags': 'nav.platformFeatures',
      risk: 'nav.accountRisk',
      analytics: 'nav.platformAnalytics'
    };
    this.currentTitle = titleMap[route] || 'nav.platformDashboard';
    this.subtitle = route === 'dashboard' ? undefined : undefined;
  }
}

