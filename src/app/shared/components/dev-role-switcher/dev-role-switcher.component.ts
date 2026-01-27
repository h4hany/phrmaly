/**
 * Dev Role Switcher Component
 * 
 * Development-only component for switching between user roles.
 * Allows instant testing of different permission contexts without re-login.
 * 
 * Features:
 * - Switch between ACCOUNT_OWNER, PHARMACY_MANAGER, PHARMACY_STAFF, PHARMACY_INVENTORY_MANAGER
 * - Instantly updates permission context
 * - Triggers sidebar, routes, and feature visibility updates
 * - Only visible in development mode
 */

import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RbacService } from '../../../core/security/rbac.service';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-dev-role-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 z-50 bg-white border-2 border-gray-300 rounded-lg shadow-lg p-4 min-w-[280px]">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-bold text-gray-700">🔧 Dev: Role Switcher</h3>
        <button
          (click)="toggleExpanded()"
          class="text-gray-500 hover:text-gray-700 text-xs"
        >
          {{ isExpanded ? '−' : '+' }}
        </button>
      </div>
      
      <div *ngIf="isExpanded" class="space-y-2">
        <div class="text-xs text-gray-600 mb-2">
          Current: <strong>{{ currentRoleLabel }}</strong>
        </div>
        
        <div class="space-y-1">
          <button
            *ngFor="let role of availableRoles"
            (click)="switchRole(role.value)"
            [class]="getButtonClass(role.value)"
            class="w-full text-left px-3 py-2 text-xs rounded transition-colors"
          >
            {{ role.label }}
          </button>
        </div>
        
        <div class="pt-2 mt-2 border-t border-gray-200">
          <div class="text-xs text-gray-500">
            Permissions: <strong>{{ permissionCount }}</strong>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .role-active {
      background-color: #3b82f6;
      color: white;
      font-weight: 600;
    }
    .role-inactive {
      background-color: #f3f4f6;
      color: #374151;
    }
    .role-inactive:hover {
      background-color: #e5e7eb;
    }
  `]
})
export class DevRoleSwitcherComponent implements OnInit {
  private authService = inject(AuthService);
  private rbacService = inject(RbacService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  isExpanded = true;
  currentRole: UserRole | null = null;
  permissionCount = 0;

  availableRoles = [
    { value: UserRole.ACCOUNT_OWNER, label: '👑 Account Owner' },
    { value: UserRole.PHARMACY_MANAGER, label: '👔 Pharmacy Manager' },
    { value: UserRole.PHARMACY_STAFF, label: '👤 Pharmacy Staff' },
    { value: UserRole.PHARMACY_INVENTORY_MANAGER, label: '📦 Inventory Manager' },
  ];

  ngOnInit(): void {
    // Get current role
    const user = this.authService.getCurrentUser();
    this.currentRole = user?.role || null;

    // Subscribe to permission context changes
    this.rbacService.getPermissionContext$().subscribe(context => {
      this.permissionCount = context?.permissions.length || 0;
      this.cdr.markForCheck();
    });

    // Subscribe to user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentRole = user?.role || null;
      this.cdr.markForCheck();
    });
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  switchRole(role: UserRole): void {
    // Update user role
    this.authService.setMockRole(role);
    
    // Force reload permission context
    // The RbacService will automatically reload when user changes
    // But we can also trigger a navigation to refresh the UI
    const currentUrl = this.router.url;
    
    // Small delay to ensure permission context is updated
    setTimeout(() => {
      // Navigate to home route for the new role
      const homeRoute = this.rbacService.getHomeRoute();
      if (currentUrl !== homeRoute) {
        this.router.navigate([homeRoute]);
      } else {
        // If already on home route, trigger change detection
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([homeRoute]);
        });
      }
    }, 100);
  }

  getButtonClass(role: UserRole): string {
    return this.currentRole === role
      ? 'role-active'
      : 'role-inactive';
  }

  get currentRoleLabel(): string {
    const role = this.availableRoles.find(r => r.value === this.currentRole);
    return role?.label || 'Unknown';
  }
}



