import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

/**
 * Auth Interceptor
 * 
 * Automatically injects JWT token from localStorage into all HTTP requests.
 * 
 * Token key: 'auth_token'
 * Header format: 'Authorization: Bearer <token>'
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
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

