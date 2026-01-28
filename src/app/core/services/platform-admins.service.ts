import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AdminUser, PlatformRole } from '../models/platform.model';
import { PaginatedResponse, PaginationParams } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class PlatformAdminsService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5000/api/platform/v1';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    });
  }

  getAll(params?: PaginationParams & { role?: string; status?: string }): Observable<PaginatedResponse<AdminUser>> {
    let httpParams = new HttpParams();
    
    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.pageSize) {
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }
    if (params?.role) {
      httpParams = httpParams.set('role', params.role);
    }
    if (params?.status) {
      httpParams = httpParams.set('status', params.status);
    }

    return this.http.get<PaginatedResponse<AdminUser>>(`${this.baseUrl}/admins`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      map(response => ({
        ...response,
        data: response.data.map(admin => this.mapAdminResponse(admin))
      })),
      catchError(error => {
        const errorMessage = error.error?.message || error.message || 'Failed to fetch admins';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getById(id: string): Observable<AdminUser | null> {
    return this.http.get<AdminUser>(`${this.baseUrl}/admins/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(admin => this.mapAdminResponse(admin)),
      catchError(error => {
        if (error.status === 404) {
          return throwError(() => new Error('Admin not found'));
        }
        const errorMessage = error.error?.message || error.message || 'Failed to fetch admin';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  create(admin: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>): Observable<AdminUser> {
    return this.http.post<AdminUser>(`${this.baseUrl}/admins`, admin, {
      headers: this.getHeaders()
    }).pipe(
      map(response => this.mapAdminResponse(response)),
      catchError(error => {
        const errorMessage = error.error?.message || error.message || 'Failed to create admin';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  update(id: string, updates: Partial<AdminUser>): Observable<AdminUser> {
    return this.http.put<AdminUser>(`${this.baseUrl}/admins/${id}`, updates, {
      headers: this.getHeaders()
    }).pipe(
      map(response => this.mapAdminResponse(response)),
      catchError(error => {
        if (error.status === 404) {
          return throwError(() => new Error('Admin not found'));
        }
        const errorMessage = error.error?.message || error.message || 'Failed to update admin';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admins/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        if (error.status === 404) {
          return throwError(() => new Error('Admin not found'));
        }
        const errorMessage = error.error?.message || error.message || 'Failed to delete admin';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  assignRoles(id: string, roles: string[]): Observable<AdminUser> {
    return this.http.post<AdminUser>(`${this.baseUrl}/admins/${id}/roles`, { roles }, {
      headers: this.getHeaders()
    }).pipe(
      map(response => this.mapAdminResponse(response)),
      catchError(error => {
        const errorMessage = error.error?.message || error.message || 'Failed to assign roles';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Map API response to AdminUser model
   */
  private mapAdminResponse(admin: any): AdminUser {
    return {
      id: admin.id,
      email: admin.email,
      username: admin.username,
      fullName: admin.fullName || admin.name || '',
      role: admin.role as PlatformRole,
      status: admin.status,
      permissions: admin.permissions || [],
      lastLoginAt: admin.lastLoginAt ? new Date(admin.lastLoginAt) : undefined,
      createdAt: new Date(admin.createdAt),
      updatedAt: new Date(admin.updatedAt),
      createdBy: admin.createdBy || '',
      auditTrail: admin.auditTrail
    };
  }
}





