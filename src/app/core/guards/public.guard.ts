import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RbacService } from '../security/rbac.service';

/**
 * Public Guard
 * 
 * Prevents authenticated users from accessing public routes (like homepage).
 * If user is authenticated, redirects them to their role-based home screen.
 * If user is not authenticated, allows access to the public route.
 */
export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const rbacService = inject(RbacService);

  // If user is authenticated, redirect to their home screen
  if (authService.isAuthenticated()) {
    const homeRoute = rbacService.getHomeRoute();
    router.navigate([homeRoute]);
    return false;
  }

  // Allow unauthenticated users to access public routes
  return true;
};

