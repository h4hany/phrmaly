import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AdminUser, PlatformRole } from '../models/platform.model';
import { PaginatedResponse, PaginationParams } from '../models/common.model';
import { ApiResponse } from '../models/api-response.model';

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

    return this.http.get<any>(`${this.baseUrl}/admins`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      map((response: any) => {
        // Handle both direct ApiResponse and wrapped response
        const apiResponse: ApiResponse<AdminUser[]> = response.success ? response : { 
          success: true, 
          data: response, 
          message: '', 
          errors: [],
          meta: response.meta
        };
        
        if (!apiResponse.success || !apiResponse.data) {
          throw new Error(apiResponse.message || 'Failed to fetch admins');
        }

        const admins = (Array.isArray(apiResponse.data) ? apiResponse.data : []).map(admin => this.mapAdminResponse(admin));
        
        return {
          data: admins,
          total: apiResponse.meta?.pagination?.totalItems ?? admins.length,
          page: apiResponse.meta?.pagination?.page ?? 1,
          pageSize: apiResponse.meta?.pagination?.pageSize ?? 10,
          totalPages: apiResponse.meta?.pagination?.totalPages ?? 1
        };
      }),
      catchError(error => {
        const errorMessage = error.error?.message || error.message || 'Failed to fetch admins';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getById(id: string): Observable<AdminUser | null> {
    return this.http.get<ApiResponse<AdminUser>>(`${this.baseUrl}/admins/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map((response: ApiResponse<AdminUser>) => {
        if (!response.success || !response.data) {
          return null;
        }
        return this.mapAdminResponse(response.data);
      }),
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
    // Handle firstName/lastName or fullName
    const fullName = admin.fullName || 
                     (admin.firstName && admin.lastName ? `${admin.firstName} ${admin.lastName}` : '') ||
                     admin.name || 
                     '';
    
    // Handle roles array or single role
    const role = admin.role || 
                 (admin.roles && admin.roles.length > 0 ? this.mapRoleFromString(admin.roles[0]) : PlatformRole.SUPER_ADMIN);
    
    // Handle status - map isActive boolean to status string
    const status = admin.status || (admin.isActive ? 'active' : 'inactive');

    return {
      id: admin.id,
      email: admin.email,
      username: admin.username || admin.email,
      fullName: fullName,
      role: role,
      status: status,
      permissions: admin.permissions || [],
      lastLoginAt: admin.lastLoginAt ? new Date(admin.lastLoginAt) : undefined,
      createdAt: admin.createdAt ? new Date(admin.createdAt) : new Date(),
      updatedAt: admin.updatedAt ? new Date(admin.updatedAt) : new Date(),
      createdBy: admin.createdBy || '',
      auditTrail: admin.auditTrail
    };
  }

  /**
   * Map role string from API to PlatformRole
   */
  private mapRoleFromString(roleString: string): PlatformRole {
    const roleMap: { [key: string]: PlatformRole } = {
      'Super Admin': PlatformRole.SUPER_ADMIN,
      'Support Admin': PlatformRole.SUPPORT_ADMIN,
      'Sales Admin': PlatformRole.SALES_ADMIN,
      'Finance Admin': PlatformRole.FINANCE_ADMIN
    };
    return roleMap[roleString] || PlatformRole.SUPER_ADMIN;
  }
}





