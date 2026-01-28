import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User, UserRole } from '../models/user.model';
import { PermissionContext } from '../models/permission.model';
import { BaseAuthService } from './base-auth.service';

/**
 * Platform Authentication Service
 * 
 * Handles authentication for platform administrators:
 * - Super Admin
 * - Support Admin
 * - Sales Admin
 * - Finance Admin
 */
@Injectable({
  providedIn: 'root'
})
export class PlatformAuthService extends BaseAuthService {

  // Mock platform admin users
  private mockUsers: User[] = [
    {
      id: '4',
      email: 'admin@pharmly.com',
      username: 'admin',
      password: 'password',
      role: UserRole.SUPER_ADMIN,
      fullName: 'Super Admin',
      avatarUrl: 'https://ui-avatars.com/api/?name=Super+Admin'
    },
    {
      id: '6',
      email: 'support@pharmly.com',
      username: 'support',
      password: 'password',
      role: UserRole.SUPPORT_ADMIN,
      fullName: 'Support Admin',
      avatarUrl: 'https://ui-avatars.com/api/?name=Support+Admin'
    },
    {
      id: '7',
      email: 'sales@pharmly.com',
      username: 'sales',
      password: 'password',
      role: UserRole.SALES_ADMIN,
      fullName: 'Sales Admin',
      avatarUrl: 'https://ui-avatars.com/api/?name=Sales+Admin'
    },
    {
      id: '8',
      email: 'finance@pharmly.com',
      username: 'finance',
      password: 'password',
      role: UserRole.FINANCE_ADMIN,
      fullName: 'Finance Admin',
      avatarUrl: 'https://ui-avatars.com/api/?name=Finance+Admin'
    }
  ];

  constructor() {
    super();
  }

  /**
   * Login platform admin user
   * Only allows platform admin roles to login
   */
  login(identifier: string, password: string): Observable<User> {
    // Find user by email, username, or phone
    const user = this.mockUsers.find(u =>
      (u.email === identifier || u.username === identifier || u.phone === identifier) &&
      (u.password === '' || u.password === password)
    );

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify user is a platform role
    const platformRoles = [
      UserRole.SUPER_ADMIN,
      UserRole.SUPPORT_ADMIN,
      UserRole.SALES_ADMIN,
      UserRole.FINANCE_ADMIN
    ];

    if (!platformRoles.includes(user.role)) {
      throw new Error('Access denied. Platform admin credentials required.');
    }

    this.storeUser(user);
    return of(user).pipe(delay(500));
  }

  /**
   * Get permission context for platform admins
   */
  getPermissionContext(): Observable<PermissionContext> {
    const user = this.getCurrentUser();
    if (!user) {
      return of({
        permissions: [],
        modules: [],
        limits: { maxUsers: 0, maxPharmacies: 0 }
      });
    }

    const context = this.getPlatformPermissionContext(user.role);
    return of(context);
  }

  /**
   * Get permission context synchronously
   */
  getPermissionContextSync(): PermissionContext | null {
    const user = this.getCurrentUser();
    if (!user) {
      return {
        permissions: [],
        modules: [],
        limits: { maxUsers: 0, maxPharmacies: 0 }
      };
    }
    return this.getPlatformPermissionContext(user.role);
  }

  /**
   * Get mock permission context for platform roles
   */
  private getPlatformPermissionContext(role: UserRole): PermissionContext {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return {
          permissions: [
            // Platform management
            'platform.accounts.view', 'platform.accounts.create', 'platform.accounts.edit',
            'platform.accounts.delete', 'platform.accounts.manage',
            'platform.subscriptions.view', 'platform.subscriptions.manage',
            'platform.catalog.view', 'platform.catalog.manage',
            'platform.support.view', 'platform.support.manage',
            'platform.features.manage', 'platform.analytics.view',
            'platform.risk.view', 'platform.admins.manage',
            'platform.modules.manage', 'platform.permissions.manage'
          ],
          modules: ['platform', 'accounts', 'subscriptions', 'catalog', 'support', 'analytics'],
          limits: { maxUsers: 0, maxPharmacies: 0 } // No limits for super admin
        };

      case UserRole.SUPPORT_ADMIN:
        return {
          permissions: [
            'platform.accounts.view',
            'platform.support.view', 'platform.support.manage',
            'platform.catalog.view'
          ],
          modules: ['platform', 'support', 'catalog'],
          limits: { maxUsers: 0, maxPharmacies: 0 }
        };

      case UserRole.SALES_ADMIN:
        return {
          permissions: [
            'platform.accounts.view', 'platform.accounts.create',
            'platform.subscriptions.view', 'platform.subscriptions.manage',
            'platform.analytics.view'
          ],
          modules: ['platform', 'accounts', 'subscriptions', 'analytics'],
          limits: { maxUsers: 0, maxPharmacies: 0 }
        };

      case UserRole.FINANCE_ADMIN:
        return {
          permissions: [
            'platform.accounts.view',
            'platform.subscriptions.view', 'platform.subscriptions.manage',
            'platform.analytics.view'
          ],
          modules: ['platform', 'accounts', 'subscriptions', 'analytics'],
          limits: { maxUsers: 0, maxPharmacies: 0 }
        };

      default:
        return {
          permissions: [],
          modules: [],
          limits: { maxUsers: 0, maxPharmacies: 0 }
        };
    }
  }

  /**
   * Override logout to redirect to admin login
   */
  override logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/admin-login']);
  }
}

