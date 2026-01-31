/**
 * Sidebar Component
 * 
 * Config-driven sidebar navigation with:
 * - Group collapse/expand
 * - Active route highlighting
 * - Permission-ready role filtering
 * - Semantic icon resolution
 * - RTL support
 * - Keyboard navigation
 */

import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { PlatformContextService } from '../../../../core/services/platform-context.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { RbacService } from '../../../../core/security/rbac.service';
import { SIDEBAR_GROUPS, SidebarGroup, SidebarItem } from './sidebar.config';

// Map sidebar groups/items to module codes
const MODULE_MAPPING: Record<string, string[]> = {
  'overview': ['dashboard'],
  'operations': ['patients', 'finance', 'vouchers'],
  'people': ['staff', 'attendance', 'payroll', 'performance', 'training'],
  'inventory': ['inventory'],
  'procurement': ['procurement'],
  'finance': ['finance'],
  'growth': ['growth'],
  'system': ['system']
};

const ITEM_MODULE_MAPPING: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/patients': 'patients',
  '/invoices': 'finance',
  '/vouchers': 'vouchers',
  '/pharmacy-staff': 'staff',
  '/people/attendance': 'attendance',
  '/people/payroll': 'payroll',
  '/people/performance': 'performance',
  '/people/training': 'training',
  '/drugs': 'inventory',
  '/bundles': 'inventory',
  '/inventory/alerts': 'inventory',
  '/inventory/requested-products': 'inventory',
  '/inventory/transfers': 'inventory',
  '/inventory/map': 'inventory',
  '/suppliers': 'procurement',
  '/purchases': 'procurement',
  '/payments': 'finance',
  '/audit-logs': 'finance',
  '/inventory/movements': 'finance',
  '/growth/referrals': 'growth',
  '/settings': 'system'
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe, IconComponent],
  templateUrl: './sidebar.component.html',
  styles: [`
    .nav-item-active {
      background-color: var(--sidebar-active-bg) !important;
      color: var(--sidebar-active-text) !important;
    }
    .nav-item-active app-icon {
      color: var(--sidebar-active-text) !important;
    }
    .group-transition {
      transition: all 0.3s ease-in-out;
    }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private platformContext = inject(PlatformContextService);
  private translationService = inject(TranslationService);
  private rbacService = inject(RbacService);
  private subscriptions = new Subscription();

  // Navigation groups from config
  groups = SIDEBAR_GROUPS;

  // Collapsed state for each group
  collapsedGroups = signal<{ [key: string]: boolean }>({});

  // Permission context trigger - updates when permissions change
  private permissionTrigger = signal(0);

  // Filtered groups based on permissions
  // Re-evaluates when permissionTrigger changes
  visibleGroups = computed(() => {
    // Access permissionTrigger to make this computed reactive to permission changes
    this.permissionTrigger();
    return this.groups.filter(group => this.isGroupVisible(group));
  });

  ngOnInit(): void {
    // Initialize collapsed state from config
    const initialState: { [key: string]: boolean } = {};
    this.groups.forEach(group => {
      initialState[group.key] = group.collapsedByDefault ?? true;
    });
    this.collapsedGroups.set(initialState);

    // Subscribe to permission context changes to trigger sidebar update
    this.subscriptions.add(
      this.rbacService.getPermissionContext$().subscribe(() => {
        // Trigger computed signal to re-evaluate
        this.permissionTrigger.update(v => v + 1);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleGroup(groupKey: string): void {
    this.collapsedGroups.update(state => ({
      ...state,
      [groupKey]: !state[groupKey]
    }));
  }

  isGroupCollapsed(groupKey: string): boolean {
    return this.collapsedGroups()[groupKey] ?? false;
  }

  isGroupVisible(group: SidebarGroup): boolean {
    // Hide system-console group (moved to super-admin portal)
    if (group.key === 'system-console') {
      return false;
    }
    
    // Check if group's module is enabled
    const user = this.authService.getCurrentUser();
    const enabledModules = (user as any)?.modules || [];
    const groupModules = MODULE_MAPPING[group.key] || [];
    
    // If group has module mapping, check if any module is enabled
    let hasEnabledModule = true;
    if (groupModules.length > 0) {
      hasEnabledModule = groupModules.some(module => enabledModules.includes(module));
    }
    
    // Check RBAC permissions
    const hasPermission = this.rbacService.canAccessGroup(group.key);
    
    // Group is visible if EITHER module is enabled OR user has permission
    // This allows groups to show based on modules even if permission check hasn't loaded yet
    return hasEnabledModule || hasPermission;
  }

  isItemVisible(item: SidebarItem): boolean {
    // Check if item's module is enabled
    const user = this.authService.getCurrentUser();
    const enabledModules = (user as any)?.modules || [];
    const itemModule = ITEM_MODULE_MAPPING[item.path];
    
    // If item has module mapping, check if module is enabled
    if (itemModule && !enabledModules.includes(itemModule)) {
      return false;
    }
    
    // Use RBAC service to check item access
    return this.rbacService.canAccessItem(item.path);
  }

  getVisibleItems(group: SidebarGroup): SidebarItem[] {
    return group.items.filter(item => this.isItemVisible(item));
  }

  shouldShowGroup(group: SidebarGroup): boolean {
    // Hide group if no visible items
    return this.getVisibleItems(group).length > 0;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get isRTL(): boolean {
    return this.translationService.getCurrentLanguage() === 'ar';
  }
}

