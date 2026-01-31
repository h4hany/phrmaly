import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiResponse, PaginatedApiResponse } from '../models/api-response.model';
import { EndpointResolverService } from './endpoint-resolver.service';

/**
 * Core API Service
 * 
 * Global HTTP wrapper for all API calls.
 * 
 * Rules:
 * - NEVER build URLs directly
 * - ALWAYS return Observable<ApiResponse<T>>
 * - NEVER strip meta from responses
 * - Support GET, POST, PUT, DELETE
 * - Strongly typed
 * 
 * Architecture:
 * Feature Services → CoreApiService → EndpointResolver → Environment
 */
@Injectable({
  providedIn: 'root'
})
export class CoreApiService {
  private http = inject(HttpClient);
  private endpointResolver = inject(EndpointResolverService);

  /**
   * GET request
   * 
   * @param path - Endpoint path (from PLATFORM_ENDPOINTS)
   * @param params - Query parameters
   * @param usePharmacy - Use pharmacy prefix instead of platform
   * @param useTenant - Use tenant prefix instead of platform
   */
  get<T>(
    path: string,
    params?: Record<string, any>,
    usePharmacy: boolean = false,
    useTenant: boolean = false
  ): Observable<ApiResponse<T>> {
    const url = useTenant
      ? this.endpointResolver.resolveTenant(path)
      : usePharmacy 
        ? this.endpointResolver.resolvePharmacy(path)
        : this.endpointResolver.resolve(path);
    
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return this.http.get<ApiResponse<T>>(url, {
      params: httpParams,
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * GET request for paginated responses
   */
  getPaginated<T>(
    path: string,
    params?: Record<string, any>,
    usePharmacy: boolean = false
  ): Observable<PaginatedApiResponse<T>> {
    return this.get<PaginatedApiResponse<T>>(path, params, usePharmacy).pipe(
      map(response => {
        // If response.data is already paginated, return as-is
        if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          return response as PaginatedApiResponse<T>;
        }
        // Otherwise wrap in paginated format
        return {
          ...response,
          data: response.data as any,
          meta: response.meta || {
            pagination: {
              page: 1,
              pageSize: 10,
              totalItems: Array.isArray(response.data) ? (response.data as any[]).length : 0,
              totalPages: 1,
              hasNext: false,
              hasPrevious: false
            }
          }
        } as PaginatedApiResponse<T>;
      })
    );
  }

  /**
   * POST request
   */
  post<T>(
    path: string,
    body: any,
    usePharmacy: boolean = false,
    useTenant: boolean = false
  ): Observable<ApiResponse<T>> {
    const url = useTenant
      ? this.endpointResolver.resolveTenant(path)
      : usePharmacy
        ? this.endpointResolver.resolvePharmacy(path)
        : this.endpointResolver.resolve(path);

    return this.http.post<ApiResponse<T>>(url, body, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * POST request with FormData (for file uploads)
   */
  postFormData<T>(
    path: string,
    formData: FormData,
    usePharmacy: boolean = false,
    useTenant: boolean = false
  ): Observable<ApiResponse<T>> {
    const url = useTenant
      ? this.endpointResolver.resolveTenant(path)
      : usePharmacy
        ? this.endpointResolver.resolvePharmacy(path)
        : this.endpointResolver.resolve(path);

    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      ...(token && { Authorization: `Bearer ${token}` })
      // Don't set Content-Type, let browser set it with boundary for FormData
    });

    return this.http.post<ApiResponse<T>>(url, formData, {
      headers: headers
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * PUT request
   */
  put<T>(
    path: string,
    body: any,
    usePharmacy: boolean = false,
    useTenant: boolean = false
  ): Observable<ApiResponse<T>> {
    const url = useTenant
      ? this.endpointResolver.resolveTenant(path)
      : usePharmacy
        ? this.endpointResolver.resolvePharmacy(path)
        : this.endpointResolver.resolve(path);

    return this.http.put<ApiResponse<T>>(url, body, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * DELETE request
   */
  delete<T>(
    path: string,
    usePharmacy: boolean = false,
    useTenant: boolean = false
  ): Observable<ApiResponse<T>> {
    const url = useTenant
      ? this.endpointResolver.resolveTenant(path)
      : usePharmacy
        ? this.endpointResolver.resolvePharmacy(path)
        : this.endpointResolver.resolve(path);

    return this.http.delete<ApiResponse<T>>(url, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get HTTP headers with authentication
   */
  private getHeaders(): HttpHeaders {
    // Check for tenant token first, then platform token
    const tenantToken = localStorage.getItem('tenant_auth_token');
    const platformToken = localStorage.getItem('auth_token');
    const token = tenantToken || platformToken;
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    });
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: any): Observable<never> => {
    // If error response has ApiResponse format, use it
    if (error.error && typeof error.error === 'object' && 'success' in error.error) {
      return throwError(() => error.error);
    }

    // Otherwise, create a standard ApiResponse error
    const apiError: ApiResponse<null> = {
      success: false,
      message: error.error?.message || error.message || 'An unknown error occurred',
      data: null,
      errors: [{
        code: error.status?.toString() || 'UNKNOWN_ERROR',
        message: error.error?.message || error.message || 'An unknown error occurred'
      }],
      meta: {
        traceId: error.error?.meta?.traceId,
        timestamp: new Date().toISOString()
      }
    };

    return throwError(() => apiError);
  };
}

