import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { User, UserRole } from '../models/user.model';
import { PermissionContext } from '../models/permission.model';
import { BaseAuthService } from './base-auth.service';
import { CoreApiService } from './core-api.service';
import { TENANT_ENDPOINTS } from '../constants/platform-endpoints';
import { ApiResponse } from '../models/api-response.model';

/**
 * Tenant Login Response Interface
 */
interface TenantLoginResponseData {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: {
    id: string;
    accountId: string;
    accountName: string;
    accountSlug: string;
    subdomain: string;
    email: string;
    username: string;
    fullName: string;
    pharmacyId?: string;
    pharmacyName?: string;
    roleName?: string;
    permissions: string[];
    modules: string[];
  };
  pharmacies?: Array<{
    id: string;
    name: string;
    address?: string;
  }>;
}

/**
 * Pharmacy Authentication Service
 *
 * Handles authentication for pharmacy users:
 * - Account Owners
 * - Pharmacy Managers
 * - Pharmacy Staff
 * - Pharmacy Inventory Managers
 * - Pharmacy Accounting Managers
 */
@Injectable({
  providedIn: 'root'
})
export class PharmacyAuthService extends BaseAuthService {
  private coreApi = inject(CoreApiService);

  constructor() {
    super();
  }

  /**
   * Login pharmacy user
   * Only allows pharmacy roles to login
   */
  login(identifier: string, password: string, accountSlug?: string): Observable<User> {
    const loginRequest = {
      emailOrUsernameOrPhone: identifier,
      password: password,
      accountSlug: accountSlug,
      subdomain: undefined as string | undefined,
      pharmacyId: undefined as string | undefined
    };

    return this.coreApi.post<TenantLoginResponseData>(
      TENANT_ENDPOINTS.auth.login,
      loginRequest,
      false, // usePharmacy
      true   // useTenant
    ).pipe(
      map((response: ApiResponse<TenantLoginResponseData>) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Login failed');
        }

        const data = response.data;
        
        // Store tokens
        if (data.accessToken) {
          localStorage.setItem('tenant_auth_token', data.accessToken);
          localStorage.setItem('tenant_refresh_token', data.refreshToken);
        }

        // If pharmacies list is returned (multiple pharmacies), throw error to handle selection
        if (data.pharmacies && data.pharmacies.length > 0 && !data.user) {
          throw new Error('PHARMACY_SELECTION_REQUIRED');
        }

        // Map backend response to User model
        const user: User = {
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          fullName: data.user.fullName,
          role: this.mapRoleNameToUserRole(data.user.roleName || ''),
          pharmacyId: data.user.pharmacyId,
          pharmacies: data.pharmacies?.map(p => ({
            id: p.id,
            name: p.name,
            address: p.address
          })) || (data.user.pharmacyId ? [{
            id: data.user.pharmacyId,
            name: data.user.pharmacyName || ''
          }] : []),
          password: '' // Don't store password
        };

        // Store permissions and modules in user object for permission context
        // Map backend permission format (read/write/delete/manage) to frontend format (view/create/edit/delete/manage)
        const mappedPermissions: string[] = [];
        const additionalPermissions: string[] = [];
        
        (data.user.permissions || []).forEach((perm: string) => {
          // Convert backend format to frontend format
          // read -> view
          if (perm.endsWith('.read')) {
            const viewPerm = perm.replace('.read', '.view');
            mappedPermissions.push(viewPerm);
            return;
          }
          
          // write -> create (for create actions) and also keep write for some cases
          if (perm.endsWith('.write')) {
            const resource = perm.substring(0, perm.lastIndexOf('.'));
            // Add create permission for resources that support creation
            const createPerm = `${resource}.create`;
            mappedPermissions.push(createPerm);
            // Also add view permission if user can write (they should be able to view)
            const viewPerm = `${resource}.view`;
            if (!additionalPermissions.includes(viewPerm)) {
              additionalPermissions.push(viewPerm);
            }
            // Keep the write permission as well for actions that use it
            mappedPermissions.push(perm);
            return;
          }
          
          // delete -> delete (same)
          if (perm.endsWith('.delete')) {
            mappedPermissions.push(perm);
            const resource = perm.substring(0, perm.lastIndexOf('.'));
            // Add view permission if user can delete (they should be able to view)
            const viewPerm = `${resource}.view`;
            if (!additionalPermissions.includes(viewPerm)) {
              additionalPermissions.push(viewPerm);
            }
            return;
          }
          
          // manage -> manage (same), but also add view permission
          if (perm.endsWith('.manage')) {
            mappedPermissions.push(perm);
            const resource = perm.substring(0, perm.lastIndexOf('.'));
            // Add view permission if user can manage (they should be able to view)
            const viewPerm = `${resource}.view`;
            if (!additionalPermissions.includes(viewPerm)) {
              additionalPermissions.push(viewPerm);
            }
            return;
          }
          
          // Keep any other permissions as-is
          mappedPermissions.push(perm);
        });
        
        // Combine all permissions, removing duplicates
        const allPermissions = [...new Set([...mappedPermissions, ...additionalPermissions])];
        
        (user as any).permissions = allPermissions;
        (user as any).modules = data.user.modules || [];
        (user as any).accountId = data.user.accountId;
        (user as any).accountSlug = data.user.accountSlug;
        (user as any).subdomain = data.user.subdomain;

        this.storeUser(user);
        
        // Force reload of permission context by emitting user change
        // This ensures RbacService picks up the new permissions immediately
        setTimeout(() => {
          this.currentUserSubject.next(user);
        }, 0);
        
        return user;
      }),
      catchError((error) => {
        if (error.error?.message) {
          throw new Error(error.error.message);
        }
        throw error;
      })
    );
  }

  /**
   * Map backend role name to UserRole enum
   */
  private mapRoleNameToUserRole(roleName: string): UserRole {
    const roleMap: Record<string, UserRole> = {
      'ACCOUNT_OWNER': UserRole.ACCOUNT_OWNER,
      'PHARMACY_MANAGER': UserRole.PHARMACY_MANAGER,
      'PHARMACY_STAFF': UserRole.PHARMACY_STAFF,
      'PHARMACY_INVENTORY_MANAGER': UserRole.PHARMACY_INVENTORY_MANAGER,
      'PHARMACY_ACCOUNTING_MANAGER': UserRole.PHARMACY_ACCOUNTING_MANAGER
    };
    return roleMap[roleName.toUpperCase()] || UserRole.PHARMACY_STAFF;
  }

  /**
   * Get permission context for pharmacy users
   * Uses permissions and modules from the authenticated user (stored in JWT/user object)
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

    // Get permissions and modules from user object (set during login)
    const permissions = (user as any).permissions || [];
    const modules = (user as any).modules || [];

    // Get limits based on role (fallback to mock if not available)
    const limits = this.getLimitsForRole(user.role);

    return of({
      permissions: permissions.length > 0 ? permissions : this.getPharmacyPermissionContext(user.role).permissions,
      modules: modules.length > 0 ? modules : this.getPharmacyPermissionContext(user.role).modules,
      limits: limits
    });
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

    // Get permissions and modules from user object (set during login)
    const permissions = (user as any).permissions || [];
    const modules = (user as any).modules || [];
    const limits = this.getLimitsForRole(user.role);

    return {
      permissions: permissions.length > 0 ? permissions : this.getPharmacyPermissionContext(user.role).permissions,
      modules: modules.length > 0 ? modules : this.getPharmacyPermissionContext(user.role).modules,
      limits: limits
    };
  }

  /**
   * Get limits for role
   */
  private getLimitsForRole(role: UserRole): { maxUsers: number; maxPharmacies: number } {
    switch (role) {
      case UserRole.ACCOUNT_OWNER:
        return { maxUsers: 100, maxPharmacies: 10 };
      case UserRole.PHARMACY_MANAGER:
        return { maxUsers: 50, maxPharmacies: 5 };
      case UserRole.PHARMACY_STAFF:
        return { maxUsers: 20, maxPharmacies: 1 };
      case UserRole.PHARMACY_INVENTORY_MANAGER:
        return { maxUsers: 30, maxPharmacies: 3 };
      default:
        return { maxUsers: 0, maxPharmacies: 0 };
    }
  }

  /**
   * Get mock permission context for pharmacy roles
   */
  private getPharmacyPermissionContext(role: UserRole): PermissionContext {
    switch (role) {
      case UserRole.ACCOUNT_OWNER:
        return {
          permissions: [
            // Dashboard
            'dashboard.view',
            // Patients
            'patients.view', 'patients.kpi.view', 'patients.orders.view',
            'patients.loyalty.view', 'patients.revenue.view', 'patients.vouchers.view',
            // Staff
            'staff.view', 'staff.details.view', 'staff.performance.view',
            'staff.risk.view', 'staff.activity.view',
            // People
            'attendance.view', 'payroll.view', 'performance.view', 'training.view',
            // Drugs & Inventory
            'drugs.view', 'drugs.create',
            'bundles.view',
            'inventory.alerts.view', 'inventory.map.view', 'inventory.transfers.view',
            'inventory.movements.view', 'inventory.requested.view',
            // Procurement
            'purchases.view', 'purchases.create', 'suppliers.view',
            // Finance
            'invoices.view', 'invoices.create', 'invoices.edit', 'invoices.actions',
            'audit.view', 'payments.view', 'payments.methods.manage',
            // Growth
            'referrals.view',
            // System
            'settings.view', 'settings.account.view',
            'system.permissions.manage', 'system.features.manage',
            'system.automation.manage', 'system.migration.manage',
            'reports.view',
            // Vouchers
            'vouchers.view', 'vouchers.create', 'vouchers.edit', 'vouchers.actions',
          ],
          modules: ['dashboard', 'patients', 'staff', 'inventory', 'procurement', 'finance', 'growth', 'system'],
          limits: { maxUsers: 100, maxPharmacies: 10 }
        };

      case UserRole.PHARMACY_MANAGER:
        return {
          permissions: [
            // Patients (limited access)
            'patients.view',
            // Staff (limited access)
            'staff.view', 'staff.details.view',
            // Attendance
            'invoices.view', 'invoices.create', 'invoices.actions',
            // Drugs (home screen for manager)
            'drugs.view', 'drugs.create',
            // Inventory (limited)
            'inventory.alerts.view', 'inventory.requested.view',
            // Settings (can view but NOT Account Information tab)
            'settings.view',
            // Vouchers
            'vouchers.view', 'vouchers.create', 'vouchers.edit', 'vouchers.actions',
          ],
          modules: ['patients', 'staff', 'inventory', 'settings'],
          limits: { maxUsers: 50, maxPharmacies: 5 }
        };

      case UserRole.PHARMACY_STAFF:
        return {
          permissions: [
            // Invoices
            'invoices.view', 'invoices.create', 'invoices.actions',
            // Drugs
            'drugs.view', 'drugs.create',
            // Bundles
            'bundles.view',
            // Inventory
            'inventory.map.view', 'inventory.transfers.view', 'inventory.requested.view',
            // Vouchers
            'vouchers.view', 'vouchers.create', 'vouchers.edit', 'vouchers.actions',
            // Patients (for vouchers tab)
            'patients.vouchers.view',
          ],
          modules: ['invoices', 'drugs', 'bundles', 'inventory'],
          limits: { maxUsers: 20, maxPharmacies: 1 }
        };

      case UserRole.PHARMACY_INVENTORY_MANAGER:
        return {
          permissions: [
            // Procurement
            'purchases.view', 'purchases.create', 'suppliers.view',
            // Inventory
            'inventory.alerts.view', 'inventory.requested.view',
            // Invoices (view only)
            'invoices.view',
            // Payments
            'payments.methods.manage',
            // Settings
            'settings.view',
          ],
          modules: ['procurement', 'inventory', 'finance', 'settings'],
          limits: { maxUsers: 30, maxPharmacies: 3 }
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
   * Override logout to redirect to pharmacy login
   */
  override logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Switch pharmacy (for users with access to multiple pharmacies)
   */
  switchPharmacy(pharmacyId: string): Observable<User> {
    return this.coreApi.post<TenantLoginResponseData>(
      TENANT_ENDPOINTS.auth.switchPharmacy,
      { pharmacyId: pharmacyId },
      false, // usePharmacy
      true   // useTenant
    ).pipe(
      map((response: ApiResponse<TenantLoginResponseData>) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to switch pharmacy');
        }

        const data = response.data;
        
        // Update tokens
        if (data.accessToken) {
          localStorage.setItem('tenant_auth_token', data.accessToken);
          localStorage.setItem('tenant_refresh_token', data.refreshToken);
        }

        // Map to User model
        const user: User = {
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          fullName: data.user.fullName,
          role: this.mapRoleNameToUserRole(data.user.roleName || ''),
          pharmacyId: data.user.pharmacyId,
          pharmacies: data.pharmacies?.map(p => ({
            id: p.id,
            name: p.name,
            address: p.address
          })) || [],
          password: ''
        };

        (user as any).permissions = data.user.permissions || [];
        (user as any).modules = data.user.modules || [];
        (user as any).accountId = data.user.accountId;
        (user as any).accountSlug = data.user.accountSlug;
        (user as any).subdomain = data.user.subdomain;

        this.storeUser(user);
        return user;
      })
    );
  }
}

