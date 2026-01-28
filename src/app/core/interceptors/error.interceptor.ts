import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

/**
 * Error Interceptor
 * 
 * Handles API errors and transforms them into ApiResponse format.
 * 
 * Rules:
 * - If response has success === false, throw formatted error
 * - Surface errors[] array and message
 * - Preserve meta information
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // If error response has ApiResponse format
      if (error.error && typeof error.error === 'object' && 'success' in error.error) {
        const apiResponse = error.error as ApiResponse<any>;
        
        // If success is false, throw the ApiResponse
        if (!apiResponse.success) {
          return throwError(() => apiResponse);
        }
      }

      // Transform HTTP error to ApiResponse format
      const apiError: ApiResponse<null> = {
        success: false,
        message: error.error?.message || error.message || 'An unknown error occurred',
        data: null,
        errors: error.error?.errors || [{
          code: error.status?.toString() || 'HTTP_ERROR',
          message: error.error?.message || error.message || 'An unknown error occurred'
        }],
        meta: {
          traceId: error.error?.meta?.traceId,
          timestamp: new Date().toISOString(),
          version: error.error?.meta?.version
        }
      };

      return throwError(() => apiError);
    })
  );
};

