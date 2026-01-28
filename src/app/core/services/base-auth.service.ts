import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, UserRole } from '../models/user.model';
import { PermissionContext } from '../models/permission.model';

/**
 * Base Authentication Service
 * 
 * Abstract base class providing common authentication functionality
 * for both pharmacy and platform users.
 */
@Injectable()
export abstract class BaseAuthService {
  protected router = inject(Router);
  protected currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.initializeFromStorage();
  }

  /**
   * Initialize user from localStorage if available
   */
  protected initializeFromStorage(): void {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }

  /**
   * Abstract method to be implemented by subclasses
   * Handles the actual login logic specific to user type
   */
  abstract login(identifier: string, password: string): Observable<User>;

  /**
   * Logout user and clear session
   */
  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: UserRole): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.currentUserSubject.value;
    if (!user) {
      return false;
    }
    return roles.includes(user.role);
  }

  /**
   * Get permission context for the current user
   * Abstract method to be implemented by subclasses
   */
  abstract getPermissionContext(): Observable<PermissionContext>;

  /**
   * Get permission context synchronously (for immediate access)
   * Abstract method to be implemented by subclasses
   */
  abstract getPermissionContextSync(): PermissionContext | null;

  /**
   * Store user in localStorage and update subject
   */
  protected storeUser(user: User): void {
    // Remove password before storing
    const userToStore = { ...user, password: '' };
    localStorage.setItem('currentUser', JSON.stringify(userToStore));
    this.currentUserSubject.next(userToStore);
  }
}

