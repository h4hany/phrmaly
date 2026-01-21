/**
 * Super Admin Sidebar Component
 * 
 * Config-driven sidebar navigation for Super Admin portal.
 * Reuses the same design and structure as main SidebarComponent.
 */

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { SUPER_ADMIN_SIDEBAR_GROUPS, SidebarGroup, SidebarItem } from './super-admin-sidebar.config';

@Component({
  selector: 'app-super-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe, IconComponent],
  templateUrl: './super-admin-sidebar.component.html',
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
export class SuperAdminSidebarComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private translationService = inject(TranslationService);

  // Navigation groups from config
  groups = SUPER_ADMIN_SIDEBAR_GROUPS;

  // Collapsed state for each group
  collapsedGroups = signal<{ [key: string]: boolean }>({});

  // All groups are visible in super admin portal
  visibleGroups = computed(() => this.groups);

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

  getVisibleItems(group: SidebarGroup): SidebarItem[] {
    return group.items;
  }

  shouldShowGroup(group: SidebarGroup): boolean {
    return this.getVisibleItems(group).length > 0;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin-login']);
  }

  get isRTL(): boolean {
    return this.translationService.getCurrentLanguage() === 'ar';
  }
}

