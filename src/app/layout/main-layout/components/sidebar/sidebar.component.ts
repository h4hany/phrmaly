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

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { SIDEBAR_GROUPS, SidebarGroup, SidebarItem } from './sidebar.config';

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
export class SidebarComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private translationService = inject(TranslationService);

  // Navigation groups from config
  groups = SIDEBAR_GROUPS;

  // Collapsed state for each group
  collapsedGroups = signal<{ [key: string]: boolean }>({});

  // Filtered groups based on permissions (future-ready)
  visibleGroups = computed(() => {
    return this.groups.filter(group => this.isGroupVisible(group));
  });

  ngOnInit(): void {
    // Initialize collapsed state from config
    const initialState: { [key: string]: boolean } = {};
    this.groups.forEach(group => {
      initialState[group.key] = group.collapsedByDefault ?? true;
    });
    this.collapsedGroups.set(initialState);
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
    // Future: Check role-based visibility
    // For now, all groups are visible
    if (group.roles && group.roles.length > 0) {
      const user = this.authService.getCurrentUser();
      return user ? group.roles.includes(user.role) : false;
    }
    return true;
  }

  isItemVisible(item: SidebarItem): boolean {
    // Future: Check role-based visibility
    // For now, all items are visible
    if (item.roles && item.roles.length > 0) {
      const user = this.authService.getCurrentUser();
      return user ? item.roles.includes(user.role) : false;
    }
    return true;
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

