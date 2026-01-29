/**
 * RBAC Route Guard
 *
 * Hard security layer that protects every route.
 *
 * Behavior:
 * - Checks if user can access the route using RbacService
 * - If unauthorized, redirects to /access-denied
 * - Does NOT load feature modules if unauthorized
 * - Does NOT call APIs if unauthorized
 */

import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RbacService } from './rbac.service';

export const rbacGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(AuthService);
  const rbacService = inject(RbacService);
  const router = inject(Router);

  // Must be authenticated first
  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Get the route path
  const routePath = state.url.split('?')[0]; // Remove query params

  // Check if user can access this route
  if (!rbacService.canAccessRoute(routePath)) {
    // Redirect to access denied page
    router.navigate(['/access-denied'], {
      queryParams: {
        returnUrl: state.url,
        attemptedRoute: routePath
      }
    });
    return false;
  }

  return true;
};





