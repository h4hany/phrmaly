import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PlatformContextService } from '../services/platform-context.service';

/**
 * Super Admin Route Guard
 * 
 * Protects /super-admin routes - only platform admins can access.
 */
export const superAdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const platformContext = inject(PlatformContextService);
  const router = inject(Router);

  // Must be authenticated
  if (!authService.isAuthenticated()) {
    router.navigate(['/admin-login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Must have platform role
  if (!platformContext.canAccessSystemConsole()) {
    // Redirect to access denied or login
    router.navigate(['/access-denied']);
    return false;
  }

  return true;
};

