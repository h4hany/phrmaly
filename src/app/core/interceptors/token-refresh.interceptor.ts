import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError, EMPTY } from 'rxjs';
import { catchError, switchMap, filter, take, finalize } from 'rxjs/operators';
import { PlatformAuthService } from '../services/platform-auth.service';
import { Router } from '@angular/router';
import { ApiResponse } from '../models/api-response.model';

/**
 * Token Refresh Interceptor
 * 
 * Automatically refreshes expired tokens and retries failed requests.
 * 
 * Behavior:
 * - Intercepts 401 errors or TOKEN_EXPIRED errors
 * - Automatically calls refreshToken()
 * - Retries the original request with new token
 * - Prevents multiple simultaneous refresh attempts
 * - Logs out if refresh fails
 */
let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const tokenRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(PlatformAuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Check if error is token expiration
      const apiError = error.error as ApiResponse<any>;
      const isTokenExpired = 
        error.status === 401 ||
        (apiError && 
         typeof apiError === 'object' && 
         'errors' in apiError &&
         Array.isArray(apiError.errors) &&
         apiError.errors.some((e: any) => e.code === 'TOKEN_EXPIRED'));

      // Skip refresh for auth endpoints
      if (req.url.includes('/auth/login') || req.url.includes('/auth/refresh') || req.url.includes('/auth/logout')) {
        return throwError(() => error);
      }

      // If token expired and not already refreshing
      if (isTokenExpired && !isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          // No refresh token, logout
          authService.logout();
          router.navigate(['/login']);
          return throwError(() => new Error('Session expired. Please login again.'));
        }

        return authService.refreshToken().pipe(
          switchMap((tokenData) => {
            isRefreshing = false;
            refreshTokenSubject.next(tokenData.accessToken);
            
            // Retry original request with new token
            const clonedRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${tokenData.accessToken}`
              }
            });
            return next(clonedRequest);
          }),
          catchError((refreshError) => {
            isRefreshing = false;
            refreshTokenSubject.next(null);
            
            // Refresh failed, logout
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => new Error('Session expired. Please login again.'));
          }),
          finalize(() => {
            isRefreshing = false;
          })
        );
      }

      // If already refreshing, wait for token and retry
      if (isRefreshing) {
        return refreshTokenSubject.pipe(
          filter(token => token !== null),
          take(1),
          switchMap((token) => {
            const clonedRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            });
            return next(clonedRequest);
          })
        );
      }

      // Other errors, pass through
      return throwError(() => error);
    })
  );
};

