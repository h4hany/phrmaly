import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, merge } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { User, UserRole } from '../models/user.model';
import { PermissionContext } from '../models/permission.model';
import { PharmacyAuthService } from './pharmacy-auth.service';
import { PlatformAuthService } from './platform-auth.service';

/**
 * Unified Authentication Service (Facade)
 * 
 * Acts as a facade/router that delegates to the appropriate authentication service
 * based on user type (pharmacy vs platform admin).
 * 
 * This maintains backward compatibility while separating concerns:
 * - PharmacyAuthService: handles pharmacy users
 * - PlatformAuthService: handles platform admins
 * 
 * The AuthService automatically routes calls to the correct service based on
 * the current user's role or login attempt.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private pharmacyAuthService = inject(PharmacyAuthService);
  private platformAuthService = inject(PlatformAuthService);
  private router = inject(Router);
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  // Unified currentUser$ that merges both services
  public currentUser$: Observable<User | null>;

  constructor() {
    // Initialize with current user if available
    const currentUser = this.getCurrentUser();
    this.currentUserSubject.next(currentUser);

    // Merge currentUser$ from both services and update our subject
    merge(
      this.pharmacyAuthService.currentUser$,
      this.platformAuthService.currentUser$
    ).subscribe(() => {
      const user = this.getCurrentUser();
      this.currentUserSubject.next(user);
    });

    // Expose our unified subject as observable
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  /**
   * Login - generic login that tries both services
   * Note: In production, use loginPharmacy() or loginPlatform() directly
   * based on the login endpoint being used
   */
  login(identifier: string, password: string): Observable<User> {
    // Try pharmacy login first, fallback to platform if it fails
    return this.pharmacyAuthService.login(identifier, password).pipe(
      // If pharmacy login succeeds, return the user
      // If it fails, the error will be thrown (handled by caller)
      // For now, we'll just use pharmacy login as default
      // Components should use loginPharmacy() or loginPlatform() directly
    );
  }

  /**
   * Login for pharmacy users
   */
  loginPharmacy(identifier: string, password: string): Observable<User> {
    return this.pharmacyAuthService.login(identifier, password);
  }

  /**
   * Login for platform admins
   */
  loginPlatform(identifier: string, password: string): Observable<User> {
    return this.platformAuthService.login(identifier, password);
  }

  /**
   * Logout - uses the appropriate service based on current user
   */
  logout(): void {
    const user = this.getCurrentUser();
    if (user && this.isPlatformRole(user.role)) {
      this.platformAuthService.logout();
    } else {
      this.pharmacyAuthService.logout();
    }
  }

  /**
   * Get current authenticated user
   * Checks both services
   */
  getCurrentUser(): User | null {
    return this.pharmacyAuthService.getCurrentUser() || 
           this.platformAuthService.getCurrentUser();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    if (!user) {
      return false;
    }
    return roles.includes(user.role);
  }

  /**
   * Get permission context for the current user
   * Routes to appropriate service based on user role
   */
  getPermissionContext(): Observable<PermissionContext> {
    const user = this.getCurrentUser();
    if (!user) {
      return new Observable(subscriber => {
        subscriber.next({
          permissions: [],
          modules: [],
          limits: { maxUsers: 0, maxPharmacies: 0 }
        });
        subscriber.complete();
      });
    }

    if (this.isPlatformRole(user.role)) {
      return this.platformAuthService.getPermissionContext();
    } else {
      return this.pharmacyAuthService.getPermissionContext();
    }
  }

  /**
   * Get permission context synchronously
   * Routes to appropriate service based on user role
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

    if (this.isPlatformRole(user.role)) {
      return this.platformAuthService.getPermissionContextSync();
    } else {
      return this.pharmacyAuthService.getPermissionContextSync();
    }
  }

  /**
   * Set mock role for development/testing
   * Routes to appropriate service
   */
  setMockRole(role: UserRole): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return;
    }

    // Update the user's role
    const updatedUser = { ...currentUser, role };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // Update the appropriate service
    if (this.isPlatformRole(role)) {
      // Update platform service's current user
      (this.platformAuthService as any).currentUserSubject?.next(updatedUser);
    } else {
      // Update pharmacy service's current user
      if ((this.pharmacyAuthService as any).setMockRole) {
        (this.pharmacyAuthService as any).setMockRole(role);
      } else {
        (this.pharmacyAuthService as any).currentUserSubject?.next(updatedUser);
      }
    }
    
    // Update our unified subject
    this.currentUserSubject.next(updatedUser);
  }

  /**
   * Check if a role is a platform role
   */
  private isPlatformRole(role: UserRole): boolean {
    return [
      UserRole.SUPER_ADMIN,
      UserRole.SUPPORT_ADMIN,
      UserRole.SALES_ADMIN,
      UserRole.FINANCE_ADMIN
    ].includes(role);
  }
}







