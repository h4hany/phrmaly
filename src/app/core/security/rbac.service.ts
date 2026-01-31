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
    // Load permission context immediately if user is already logged in
    // This prevents race conditions with route guards
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      // Load synchronously for already-logged-in users
      const context = this.authService.getPermissionContextSync();
      if (context) {
        this.permissionContextSubject.next(context);
      }
    }
    
    // Reload when user changes (for role switching or new logins)
    this.authService.currentUser$.subscribe(() => {
      // Load synchronously first for immediate availability
      const syncContext = this.authService.getPermissionContextSync();
      if (syncContext) {
        this.permissionContextSubject.next(syncContext);
      }
      // Then load async to ensure we have the latest
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
    let context = this.getPermissionContext();
    
    // If context not loaded yet, try to load it synchronously
    // This prevents race conditions where guard checks before async load completes
    if (!context) {
      const syncContext = this.authService.getPermissionContextSync();
      if (syncContext) {
        // Update the subject so future checks use it
        this.permissionContextSubject.next(syncContext);
        context = syncContext;
      } else {
        // If still no context, try to get permissions directly from user object
        const user = this.authService.getCurrentUser();
        if (user) {
          const userPermissions = (user as any).permissions || [];
          if (userPermissions.length > 0) {
            // Create a temporary context from user object
            context = {
              permissions: userPermissions,
              modules: (user as any).modules || [],
              limits: { maxUsers: 0, maxPharmacies: 0 }
            };
            this.permissionContextSubject.next(context);
          } else {
            // If still no permissions, deny access
            return false;
          }
        } else {
          return false;
        }
      }
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
   * If no permissions are defined for the group, returns true (fallback to module-based check)
   */
  canAccessGroup(groupKey: string): boolean {
    const context = this.getPermissionContext();
    if (!context) {
      // If context not loaded, try to get it synchronously
      const syncContext = this.authService.getPermissionContextSync();
      if (!syncContext) {
        return false;
      }
      this.permissionContextSubject.next(syncContext);
    }

    const requiredPermissions = getRequiredPermissions('groups', groupKey);
    
    // If no permissions defined for this group, allow it (will be filtered by module check)
    if (requiredPermissions.length === 0) {
      return true;
    }
    
    return this.hasAnyPermission(requiredPermissions);
  }

  /**
   * Check if user can access a sidebar item
   */
  canAccessItem(path: string): boolean {
    let context = this.getPermissionContext();
    if (!context) {
      // If context not loaded, try to get it synchronously
      const syncContext = this.authService.getPermissionContextSync();
      if (syncContext) {
        this.permissionContextSubject.next(syncContext);
        context = syncContext;
      } else {
        return false;
      }
    }

    // Normalize path
    const normalizedPath = path.split('?')[0].replace(/\/$/, '') || '/';

    // Check exact match
    const requiredPermissions = getRequiredPermissions('items', normalizedPath);
    
    // If no permissions defined for this item, allow it (will be filtered by module check)
    if (requiredPermissions.length === 0) {
      return true;
    }
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
   * Uses permission-based routing, falls back to role-based if permissions not available
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

    // Get permission context - try sync first, then async
    let context = this.getPermissionContext();
    let permissions = context?.permissions || [];
    let modules = context?.modules || [];

    // If no context, try to get permissions directly from user object
    if (permissions.length === 0) {
      const userPermissions = (user as any).permissions || [];
      if (userPermissions.length > 0) {
        permissions = userPermissions;
        modules = (user as any).modules || [];
      }
    }

    // Permission-based routing: check what user can access
    // Try to find the first accessible route based on permissions
    const routePriority = [
      { route: '/dashboard', permission: 'dashboard.view' },
      { route: '/drugs', permission: 'drugs.view' },
      { route: '/invoices', permission: 'invoices.view' },
      { route: '/patients', permission: 'patients.view' },
      { route: '/pharmacy-staff', permission: 'staff.view' },
      { route: '/inventory/alerts', permission: 'inventory.alerts.view' },
      { route: '/inventory/map', permission: 'inventory.map.view' },
      { route: '/purchases', permission: 'purchases.view' },
      { route: '/suppliers', permission: 'suppliers.view' },
      { route: '/bundles', permission: 'bundles.view' },
      { route: '/vouchers', permission: 'vouchers.view' },
      { route: '/settings', permission: 'settings.view' }
    ];

    // Find first route user has permission for
    for (const routeCheck of routePriority) {
      if (permissions.includes(routeCheck.permission) || this.hasPermission(routeCheck.permission)) {
        return routeCheck.route;
      }
    }

    // Fallback to role-based routing if permissions not available
    switch (role) {
      case UserRole.PHARMACY_MANAGER:
      case UserRole.PHARMACY_STAFF:
        return '/drugs';
      
      case UserRole.PHARMACY_INVENTORY_MANAGER:
        return '/inventory/alerts';
      
      case UserRole.ACCOUNT_OWNER:
      default:
        // For account owner, try dashboard first, then fallback
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

