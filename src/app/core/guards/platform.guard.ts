import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PlatformContextService } from '../services/platform-context.service';
import { PlatformRole } from '../models/platform.model';

/**
 * Platform Route Guard
 * 
 * Protects /system routes - only platform admins can access.
 */
export const platformGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const platformContext = inject(PlatformContextService);
  const router = inject(Router);

  // Must be authenticated
  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Must have platform role
  if (!platformContext.canAccessSystemConsole()) {
    // Redirect to dashboard if not platform admin
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};

/**
 * Role-specific guard factory
 */
export const createRoleGuard = (allowedRoles: PlatformRole[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const platformContext = inject(PlatformContextService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    if (!platformContext.hasAnyPlatformRole(allowedRoles)) {
      router.navigate(['/super-admin/dashboard']);
      return false;
    }

    return true;
  };
};



