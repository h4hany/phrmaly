import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PlatformContextService } from '../services/platform-context.service';

/**
 * Pharmacy Route Guard
 * 
 * Prevents platform admins from accessing pharmacy routes.
 * Redirects them to system dashboard.
 */
export const pharmacyGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const platformContext = inject(PlatformContextService);
  const router = inject(Router);

  // Must be authenticated
  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // If platform admin, redirect to system dashboard
  if (platformContext.isPlatformMode()) {
    router.navigate(['/system/dashboard']);
    return false;
  }

  return true;
};

