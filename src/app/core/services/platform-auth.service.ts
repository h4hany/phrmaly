import { Injectable, inject } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { User, UserRole } from '../models/user.model';
import { PermissionContext } from '../models/permission.model';
import { BaseAuthService } from './base-auth.service';
import { CoreApiService } from './core-api.service';
import { PLATFORM_ENDPOINTS } from '../constants/platform-endpoints';
import { ApiResponse } from '../models/api-response.model';

/**
 * Login Response Interface
 */
interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    permissions: string[];
  };
}

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
  private coreApi = inject(CoreApiService);

  constructor() {
    super();
  }

  /**
   * Login platform admin user
   * Only allows platform admin roles to login
   */
  login(identifier: string, password: string): Observable<User> {
    return this.coreApi.post<LoginResponseData>(
      PLATFORM_ENDPOINTS.auth.login,
      { email: identifier, password }
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Login failed');
        }

        const loginData = response.data;
        
        // Store tokens
        localStorage.setItem('auth_token', loginData.accessToken);
        localStorage.setItem('refresh_token', loginData.refreshToken);
        
        // Map API user to User model
        const apiUser = loginData.user;
        const user: User = {
          id: apiUser.id,
          email: apiUser.email,
          username: apiUser.email, // Use email as username if not provided
          password: '',
          role: this.mapRoleToUserRole(apiUser.roles?.[0] || ''),
          fullName: `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim() || apiUser.email,
          avatarUrl: undefined
        };
        
        this.storeUser(user);
        return user;
      }),
      catchError(error => {
        const errorMessage = error.message || error.errors?.[0]?.message || 'Invalid credentials';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<{ accessToken: string; refreshToken: string }> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.coreApi.post<LoginResponseData>(
      PLATFORM_ENDPOINTS.auth.refresh,
      { refreshToken }
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Token refresh failed');
        }
        
        const loginData = response.data;
        
        // Store new tokens
        if (loginData.accessToken) {
          localStorage.setItem('auth_token', loginData.accessToken);
        }
        if (loginData.refreshToken) {
          localStorage.setItem('refresh_token', loginData.refreshToken);
        }
        
        return {
          accessToken: loginData.accessToken,
          refreshToken: loginData.refreshToken || refreshToken
        };
      }),
      catchError(error => {
        // If refresh fails, logout
        this.logout();
        return throwError(() => new Error('Session expired. Please login again.'));
      })
    );
  }

  /**
   * Get current user information
   */
  getCurrentUserInfo(): Observable<User> {
    return this.coreApi.get<{
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      roles: string[];
      permissions: string[];
    }>(PLATFORM_ENDPOINTS.auth.me).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to get user information');
        }

        const apiUser = response.data;
        const user: User = {
          id: apiUser.id,
          email: apiUser.email,
          username: apiUser.email,
          password: '',
          role: this.mapRoleToUserRole(apiUser.roles?.[0] || ''),
          fullName: `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim() || apiUser.email,
          avatarUrl: undefined
        };
        
        this.storeUser(user);
        return user;
      }),
      catchError(error => {
        // If getting user info fails, logout
        this.logout();
        return throwError(() => new Error('Failed to get user information'));
      })
    );
  }

  /**
   * Map API role to UserRole enum
   */
  private mapRoleToUserRole(role: string): UserRole {
    const roleMap: { [key: string]: UserRole } = {
      'super_admin': UserRole.SUPER_ADMIN,
      'support_admin': UserRole.SUPPORT_ADMIN,
      'sales_admin': UserRole.SALES_ADMIN,
      'finance_admin': UserRole.FINANCE_ADMIN
    };
    
    return roleMap[role] || UserRole.SUPER_ADMIN;
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
    const refreshToken = localStorage.getItem('refresh_token');
    
    // Call logout endpoint if refresh token exists
    if (refreshToken) {
      this.coreApi.post(PLATFORM_ENDPOINTS.auth.logout, { refreshToken }).subscribe({
        next: () => this.clearSession(),
        error: () => {
          // Continue with logout even if API call fails
          this.clearSession();
        }
      });
    } else {
      this.clearSession();
    }
  }

  /**
   * Clear session data
   */
  private clearSession(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/admin-login']);
  }
}

