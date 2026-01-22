import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { User, UserRole } from '../models/user.model';
import { Pharmacy } from '../models/user.model';
import { PermissionContext } from '../models/permission.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Mock users
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
      id: '4',
      email: 'admin@pharmly.com',
      username: 'admin',
      password: 'password',
      role: UserRole.SUPER_ADMIN,
      fullName: 'Super Admin',
      avatarUrl: 'https://ui-avatars.com/api/?name=Super+Admin'
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
    // Check if user is already logged in (localStorage)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(identifier: string, password: string): Observable<User> {
    // Mock login - check email, username, or phone
    // For users with empty password, allow login without password check
    const user = this.mockUsers.find(u =>
      (u.email === identifier || u.username === identifier || u.phone === identifier) &&
      (u.password === '' || u.password === password)
    );

    if (user) {
      // Remove password before storing
      const { password: _, ...userWithoutPassword } = user;
      const userToStore = { ...user, password: '' };
      localStorage.setItem('currentUser', JSON.stringify(userToStore));
      this.currentUserSubject.next(userToStore);
      return of(userToStore).pipe(delay(500));
    }

    throw new Error('Invalid credentials');
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  hasRole(role: UserRole): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.currentUserSubject.value;
    return user ? roles.includes(user.role) : false;
  }

  /**
   * Get permission context for the current user
   * In production, this would call the backend API
   * For now, returns mock data based on user role
   *
   * Note: Using immediate return (no delay) to prevent race conditions
   * with route guards checking permissions before context is loaded
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

    // Mock permission context based on role
    // Return immediately (no delay) to ensure guards have context when checking
    const context = this.getMockPermissionContext(user.role);
    return of(context);
  }

  /**
   * Get permission context synchronously (for immediate access)
   * Used by RbacService to avoid race conditions
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
    return this.getMockPermissionContext(user.role);
  }

  /**
   * Get mock permission context for a given role
   * This simulates what the backend would return
   */
  private getMockPermissionContext(role: UserRole): PermissionContext {
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
            // Patients (limited access - can view but with restrictions on tabs/features)
            'patients.view',
            // Staff (limited access - can view details only, not performance/risk/activity)
            'staff.view', 'staff.details.view',
            // Attendance (can view attendance)
            'invoices.view', 'invoices.create', 'invoices.actions',
            // Drugs (home screen for manager)
            'drugs.view', 'drugs.create',
            // Inventory (limited - only alerts and requested products)
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
   * Set mock role for development/testing
   * This allows switching roles without re-login
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







