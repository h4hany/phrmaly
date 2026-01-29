import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User, UserRole } from '../models/user.model';
import { PermissionContext } from '../models/permission.model';
import { BaseAuthService } from './base-auth.service';

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

  // Mock pharmacy users
  private mockUsers: User[] = [
    {
      id: '1',
      email: 'owner@pharmly.com',
      username: 'owner',
      phone: '+1234567890',
      password: 'password',
      role: UserRole.ACCOUNT_OWNER,
      fullName: 'James Bond',
      avatarUrl: 'https://ui-avatars.com/api/?name=James+Bond',
      pharmacies: [
        {
          id: 'ph1',
          name: 'Main Pharmacy',
          address: '123 Main St',
          phone: '+1234567890',
          email: 'main@pharmly.com',
          primaryColor: '#166534',
          secondaryColor: '#22c55e',
          sidebarColor: '#14532d',
          rtlEnabled: false
        },
        {
          id: 'ph2',
          name: 'Branch Pharmacy',
          address: '456 Branch Ave',
          phone: '+1234567891',
          email: 'branch@pharmly.com',
          primaryColor: '#166534',
          secondaryColor: '#22c55e',
          sidebarColor: '#14532d',
          rtlEnabled: false
        }
      ]
    },
    {
      id: '2',
      email: 'manager@pharmly.com',
      username: 'manager',
      password: '',
      role: UserRole.PHARMACY_MANAGER,
      fullName: 'John Manager',
      pharmacyId: 'ph1'
    },
    {
      id: '3',
      email: 'staff@pharmly.com',
      username: 'staff',
      password: 'password',
      role: UserRole.PHARMACY_STAFF,
      fullName: 'Jane Staff',
      pharmacyId: 'ph1'
    },
    {
      id: '5',
      email: 'inventory@pharmly.com',
      username: 'inventory',
      password: 'password',
      role: UserRole.PHARMACY_INVENTORY_MANAGER,
      fullName: 'Inventory Manager',
      avatarUrl: 'https://ui-avatars.com/api/?name=Inventory+Manager',
      pharmacies: [
        {
          id: 'ph1',
          name: 'Main Pharmacy',
          address: '123 Main St',
          phone: '+1234567890',
          email: 'main@pharmly.com',
          primaryColor: '#166534',
          secondaryColor: '#22c55e',
          sidebarColor: '#14532d',
          rtlEnabled: false
        },
        {
          id: 'ph2',
          name: 'Branch Pharmacy',
          address: '456 Branch Ave',
          phone: '+1234567891',
          email: 'branch@pharmly.com',
          primaryColor: '#166534',
          secondaryColor: '#22c55e',
          sidebarColor: '#14532d',
          rtlEnabled: false
        }
      ]
    }
  ];

  constructor() {
    super();
  }

  /**
   * Login pharmacy user
   * Only allows pharmacy roles to login
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

    // Verify user is a pharmacy role (not platform admin)
    const pharmacyRoles = [
      UserRole.ACCOUNT_OWNER,
      UserRole.PHARMACY_MANAGER,
      UserRole.PHARMACY_STAFF,
      UserRole.PHARMACY_INVENTORY_MANAGER,
      UserRole.PHARMACY_ACCOUNTING_MANAGER
    ];

    if (!pharmacyRoles.includes(user.role)) {
      throw new Error('Access denied. Pharmacy credentials required.');
    }

    this.storeUser(user);
    return of(user).pipe(delay(500));
  }

  /**
   * Get permission context for pharmacy users
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

    const context = this.getPharmacyPermissionContext(user.role);
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
    return this.getPharmacyPermissionContext(user.role);
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
   * Set mock role for development/testing
   */
  setMockRole(role: UserRole): void {
    const user = this.getCurrentUser();
    if (user) {
      const updatedUser = { ...user, role };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
    }
  }
}

