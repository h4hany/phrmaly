/**
 * RBAC Service
 * 
 * Central Role-Based Access Control service.
 * Single source of truth for all permission checks.
 * 
 * Responsibilities:
 * - Check route access (with wildcard support)
 * - Check sidebar group visibility
 * - Check sidebar item visibility
 * - Check feature-level permissions (tabs, buttons, KPI cards, etc.)
 */

import { Injectable, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';
import { PERMISSIONS, hasPermission, matchRoute } from './permissions.config';

@Injectable({
  providedIn: 'root'
})
export class RbacService {
  private authService = inject(AuthService);

  /**
   * Get current user's role
   */
  private getCurrentRole(): UserRole | null {
    const user = this.authService.getCurrentUser();
    return user?.role || null;
  }

  /**
   * Check if user can access a route
   * Supports wildcard routes (e.g., /patients/:id)
   */
  canAccessRoute(path: string): boolean {
    const role = this.getCurrentRole();
    if (!role) {
      return false;
    }

    // ACCOUNT_OWNER has access to everything
    if (role === UserRole.ACCOUNT_OWNER) {
      return true;
    }

    // Normalize path (remove query params and trailing slashes)
    const normalizedPath = path.split('?')[0].replace(/\/$/, '') || '/';

    // Check exact match first
    if (PERMISSIONS.routes[normalizedPath]) {
      return hasPermission(role, 'routes', normalizedPath);
    }

    // Check wildcard patterns
    for (const pattern of Object.keys(PERMISSIONS.routes)) {
      if (matchRoute(pattern, normalizedPath)) {
        return hasPermission(role, 'routes', pattern);
      }
    }

    // Default: deny access if route not explicitly allowed
    return false;
  }

  /**
   * Check if user can access a sidebar group
   */
  canAccessGroup(groupKey: string): boolean {
    const role = this.getCurrentRole();
    if (!role) {
      return false;
    }

    // ACCOUNT_OWNER has access to everything
    if (role === UserRole.ACCOUNT_OWNER) {
      return true;
    }

    return hasPermission(role, 'groups', groupKey);
  }

  /**
   * Check if user can access a sidebar item
   */
  canAccessItem(path: string): boolean {
    const role = this.getCurrentRole();
    if (!role) {
      return false;
    }

    // ACCOUNT_OWNER has access to everything
    if (role === UserRole.ACCOUNT_OWNER) {
      return true;
    }

    // Normalize path
    const normalizedPath = path.split('?')[0].replace(/\/$/, '') || '/';

    // Check exact match
    if (PERMISSIONS.items[normalizedPath]) {
      return hasPermission(role, 'items', normalizedPath);
    }

    // Check wildcard patterns
    for (const pattern of Object.keys(PERMISSIONS.items)) {
      if (matchRoute(pattern, normalizedPath)) {
        return hasPermission(role, 'items', pattern);
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
    const role = this.getCurrentRole();
    if (!role) {
      return false;
    }

    // ACCOUNT_OWNER has access to everything
    if (role === UserRole.ACCOUNT_OWNER) {
      return true;
    }

    return hasPermission(role, 'features', featureKey);
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: UserRole): boolean {
    const currentRole = this.getCurrentRole();
    return currentRole === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const currentRole = this.getCurrentRole();
    if (!currentRole) {
      return false;
    }
    return roles.includes(currentRole);
  }

  /**
   * Get the home/default route for the current user's role
   */
  getHomeRoute(): string {
    const role = this.getCurrentRole();
    if (!role) {
      return '/login';
    }

    // Platform admin roles go to super admin dashboard
    if (role === UserRole.SUPER_ADMIN || 
        role === UserRole.SUPPORT_ADMIN || 
        role === UserRole.SALES_ADMIN || 
        role === UserRole.FINANCE_ADMIN) {
      return '/super-admin/dashboard';
    }

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
}

