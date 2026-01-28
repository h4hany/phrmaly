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
   */
  get<T>(
    path: string,
    params?: Record<string, any>,
    usePharmacy: boolean = false
  ): Observable<ApiResponse<T>> {
    const url = usePharmacy 
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
    return this.get<T[]>(path, params, usePharmacy) as Observable<PaginatedApiResponse<T>>;
  }

  /**
   * POST request
   */
  post<T>(
    path: string,
    body: any,
    usePharmacy: boolean = false
  ): Observable<ApiResponse<T>> {
    const url = usePharmacy
      ? this.endpointResolver.resolvePharmacy(path)
      : this.endpointResolver.resolve(path);

    return this.http.post<ApiResponse<T>>(url, body, {
      headers: this.getHeaders()
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
    usePharmacy: boolean = false
  ): Observable<ApiResponse<T>> {
    const url = usePharmacy
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
    usePharmacy: boolean = false
  ): Observable<ApiResponse<T>> {
    const url = usePharmacy
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
    const token = localStorage.getItem('auth_token');
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

