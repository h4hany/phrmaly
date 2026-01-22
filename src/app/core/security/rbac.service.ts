/**
 * RBAC Service
 * 
 * Central Permission-Based Access Control service.
 * Single source of truth for all permission checks.
 * 
 * Responsibilities:
 * - Check route access (with wildcard support)
 * - Check sidebar group visibility
 * - Check sidebar item visibility
 * - Check feature-level permissions (tabs, buttons, KPI cards, etc.)
 * 
 * Migration Note: Changed from role-based to permission-based system.
 * Now uses PermissionContext from AuthService instead of checking user roles.
 */

import { Injectable, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';
import { PermissionContext } from '../models/permission.model';
import { PERMISSIONS, getRequiredPermissions, matchRoute } from './permissions.config';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RbacService {
  private authService = inject(AuthService);
  
  // Cache permission context in memory
  private permissionContextSubject = new BehaviorSubject<PermissionContext | null>(null);
  private permissionContext$ = this.permissionContextSubject.asObservable();

  constructor() {
    // Load permission context on initialization
    this.loadPermissionContext();
    
    // Reload when user changes (for role switching)
    this.authService.currentUser$.subscribe(() => {
      this.loadPermissionContext();
    });
  }

  /**
   * Load permission context from AuthService
   */
  private loadPermissionContext(): void {
    this.authService.getPermissionContext().subscribe(context => {
      this.permissionContextSubject.next(context);
    });
  }

  /**
   * Get current permission context
   */
  private getPermissionContext(): PermissionContext | null {
    return this.permissionContextSubject.value;
  }

  /**
   * Check if user has a specific permission
   * This is the core permission check method
   */
  hasPermission(permissionKey: string): boolean {
    const context = this.getPermissionContext();
    if (!context) {
      return false;
    }
    return context.permissions.includes(permissionKey);
  }

  /**
   * Check if user has any of the required permissions
   */
  private hasAnyPermission(requiredPermissions: string[]): boolean {
    if (requiredPermissions.length === 0) {
      return false; // No permissions required = deny access
    }
    return requiredPermissions.some(perm => this.hasPermission(perm));
  }

  /**
   * Check if user can access a route
   * Supports wildcard routes (e.g., /patients/:id)
   */
  canAccessRoute(path: string): boolean {
    const context = this.getPermissionContext();
    if (!context) {
      return false;
    }

    // Normalize path (remove query params and trailing slashes)
    const normalizedPath = path.split('?')[0].replace(/\/$/, '') || '/';

    // Check exact match first
    const requiredPermissions = getRequiredPermissions('routes', normalizedPath);
    if (requiredPermissions.length > 0) {
      return this.hasAnyPermission(requiredPermissions);
    }

    // Check wildcard patterns
    for (const pattern of Object.keys(PERMISSIONS.routes)) {
      if (matchRoute(pattern, normalizedPath)) {
        const wildcardPermissions = getRequiredPermissions('routes', pattern);
        if (wildcardPermissions.length > 0) {
          return this.hasAnyPermission(wildcardPermissions);
        }
      }
    }

    // Default: deny access if route not explicitly allowed
    return false;
  }

  /**
   * Check if user can access a sidebar group
   * A group is visible if user has at least one of the required permissions
   */
  canAccessGroup(groupKey: string): boolean {
    const context = this.getPermissionContext();
    if (!context) {
      return false;
    }

    const requiredPermissions = getRequiredPermissions('groups', groupKey);
    return this.hasAnyPermission(requiredPermissions);
  }

  /**
   * Check if user can access a sidebar item
   */
  canAccessItem(path: string): boolean {
    const context = this.getPermissionContext();
    if (!context) {
      return false;
    }

    // Normalize path
    const normalizedPath = path.split('?')[0].replace(/\/$/, '') || '/';

    // Check exact match
    const requiredPermissions = getRequiredPermissions('items', normalizedPath);
    if (requiredPermissions.length > 0) {
      return this.hasAnyPermission(requiredPermissions);
    }

    // Check wildcard patterns
    for (const pattern of Object.keys(PERMISSIONS.items)) {
      if (matchRoute(pattern, normalizedPath)) {
        const wildcardPermissions = getRequiredPermissions('items', pattern);
        if (wildcardPermissions.length > 0) {
          return this.hasAnyPermission(wildcardPermissions);
        }
      }
    }

    // Default: deny access if item not explicitly allowed
    return false;
  }

  /**
   * Check if user can access a feature
   * Used for tabs, buttons, KPI cards, table actions, etc.
   */
  canAccessFeature(featureKey: string): boolean {
    const context = this.getPermissionContext();
    if (!context) {
      return false;
    }

    const requiredPermissions = getRequiredPermissions('features', featureKey);
    return this.hasAnyPermission(requiredPermissions);
  }

  /**
   * Check if user has a specific role
   * Kept for backward compatibility
   */
  hasRole(role: UserRole): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   * Kept for backward compatibility
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return false;
    }
    return roles.includes(user.role);
  }

  /**
   * Get the home/default route for the current user
   * Uses role-based logic for now (can be enhanced with permission-based routing)
   */
  getHomeRoute(): string {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return '/login';
    }

    const role = user.role;

    // Platform admin roles go to super admin dashboard
    if (role === UserRole.SUPER_ADMIN || 
        role === UserRole.SUPPORT_ADMIN || 
        role === UserRole.SALES_ADMIN || 
        role === UserRole.FINANCE_ADMIN) {
      return '/super-admin/dashboard';
    }

    // Permission-based routing: check what user can access
    if (this.hasPermission('dashboard.view')) {
      return '/dashboard';
    }
    if (this.hasPermission('drugs.view')) {
      return '/drugs';
    }
    if (this.hasPermission('inventory.alerts.view')) {
      return '/inventory/alerts';
    }
    if (this.hasPermission('invoices.view')) {
      return '/invoices';
    }

    // Fallback to role-based routing
    switch (role) {
      case UserRole.PHARMACY_MANAGER:
      case UserRole.PHARMACY_STAFF:
        return '/drugs';
      
      case UserRole.PHARMACY_INVENTORY_MANAGER:
        return '/inventory/alerts';
      
      case UserRole.ACCOUNT_OWNER:
      default:
        return '/dashboard';
    }
  }

  /**
   * Get current permission context as observable
   * Useful for components that need to react to permission changes
   */
  getPermissionContext$(): Observable<PermissionContext | null> {
    return this.permissionContext$;
  }
}

