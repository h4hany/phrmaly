import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

/**
 * Auth Interceptor
 * 
 * Automatically injects JWT token from localStorage into all HTTP requests.
 * 
 * Token key: 'auth_token'
 * Header format: 'Authorization: Bearer <token>'
 * 
 * Note: Skips auth endpoints (login, refresh) as they don't need tokens
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip adding token for auth endpoints
  if (req.url.includes('/auth/login') || req.url.includes('/auth/refresh')) {
    return next(req);
  }

  const token = localStorage.getItem('auth_token');

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};

