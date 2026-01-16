import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { PlatformRole } from '../models/platform.model';

/**
 * Platform Context Service
 * 
 * Manages platform-level context separate from pharmacy context.
 * Used by Super Admin and platform staff.
 */
@Injectable({
  providedIn: 'root'
})
export class PlatformContextService {
  private authService = inject(AuthService);
  private isPlatformModeSubject = new BehaviorSubject<boolean>(false);
  public isPlatformMode$ = this.isPlatformModeSubject.asObservable();

  constructor() {
    this.checkPlatformMode();
    // Listen to auth changes
    this.authService.currentUser$.subscribe(() => {
      this.checkPlatformMode();
    });
  }

  private checkPlatformMode(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      // Check if user has platform role
      const platformRoles = [
        'super_admin',
        'support_admin',
        'sales_admin',
        'finance_admin'
      ];
      const hasPlatformRole = platformRoles.includes(user.role);
      this.isPlatformModeSubject.next(hasPlatformRole);
    } else {
      this.isPlatformModeSubject.next(false);
    }
  }

  isPlatformMode(): boolean {
    return this.isPlatformModeSubject.value;
  }

  hasPlatformRole(role: PlatformRole | string): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === role;
  }

  hasAnyPlatformRole(roles: (PlatformRole | string)[]): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    return roles.some(role => user.role === role);
  }

  canAccessSystemConsole(): boolean {
    return this.hasAnyPlatformRole([
      'super_admin',
      'support_admin',
      'sales_admin',
      'finance_admin'
    ]);
  }
}

