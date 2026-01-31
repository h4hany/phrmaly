import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PharmacyStaff } from '../models/pharmacy-staff.model';
import { PaginatedResponse, PaginationParams } from '../models/common.model';
import { CoreApiService } from './core-api.service';
import { TENANT_ENDPOINTS } from '../constants/platform-endpoints';
import { UserRole } from '../models/user.model';

export interface StaffPermissions {
  modules: Array<{
    moduleCode: string;
    moduleName: string;
    permissions: Array<{
      permissionId: string;
      resource: string;
      action: string;
      permissionKey: string;
      isGranted: boolean;
    }>;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class PharmacyStaffService {
  private coreApi = inject(CoreApiService);

  getAll(params?: PaginationParams & { searchTerm?: string; sortBy?: string; sortDescending?: boolean }): Observable<PaginatedResponse<PharmacyStaff>> {
    const queryParams: any = {
      PageNumber: params?.page || 1,
      PageSize: params?.pageSize || 10
    };

    if (params?.searchTerm) {
      queryParams.SearchTerm = params.searchTerm;
    }
    if (params?.sortBy) {
      queryParams.SortBy = params.sortBy;
    }
    if (params?.sortDescending !== undefined) {
      queryParams.SortDescending = params.sortDescending;
    }

    return this.coreApi.get<any>(TENANT_ENDPOINTS.staff.root, queryParams, false, true).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch staff');
        }
        // Map backend DTO to frontend model
        // Backend returns TenantPaginatedResult with Items, Page, PageSize, TotalItems, TotalPages
        const backendData = response.data;
        return {
          data: (backendData.items || []).map((item: any) => this.mapStaffDto(item)),
          total: backendData.totalItems || 0,
          page: backendData.page || 1,
          pageSize: backendData.pageSize || 10,
          totalPages: backendData.totalPages || 0
        };
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to fetch staff';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getById(id: string): Observable<PharmacyStaff | null> {
    return this.coreApi.get<PharmacyStaff>(TENANT_ENDPOINTS.staff.byId(id), {}, false, true).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch staff member');
        }
        return this.mapStaffDto(response.data);
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to fetch staff member';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getPermissions(staffId: string, pharmacyId: string): Observable<StaffPermissions> {
    return this.coreApi.get<StaffPermissions>(TENANT_ENDPOINTS.staff.permissions(staffId), { pharmacyId }, false, true).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch staff permissions');
        }
        return response.data;
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to fetch staff permissions';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  updatePermissions(staffId: string, pharmacyId: string, permissionIds: string[]): Observable<void> {
    return this.coreApi.put<void>(TENANT_ENDPOINTS.staff.permissions(staffId), { pharmacyId, permissionIds }, false, true).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to update staff permissions');
        }
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to update staff permissions';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  search(query: string): Observable<PharmacyStaff[]> {
    return this.getAll({ page: 1, pageSize: 100, searchTerm: query }).pipe(
      map(response => response.data)
    );
  }

  create(staff: Omit<PharmacyStaff, 'id' | 'createdAt' | 'updatedAt'>): Observable<PharmacyStaff> {
    return this.coreApi.post<PharmacyStaff>(TENANT_ENDPOINTS.staff.root, staff, false, true).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to create staff member');
        }
        return this.mapStaffDto(response.data);
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to create staff member';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  update(id: string, staff: Partial<PharmacyStaff>): Observable<PharmacyStaff> {
    return this.coreApi.put<PharmacyStaff>(TENANT_ENDPOINTS.staff.byId(id), staff, false, true).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to update staff member');
        }
        return this.mapStaffDto(response.data);
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to update staff member';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  delete(id: string): Observable<boolean> {
    return this.coreApi.delete<boolean>(TENANT_ENDPOINTS.staff.byId(id), false, true).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to delete staff member');
        }
        return true;
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to delete staff member';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  private mapStaffDto(dto: any): PharmacyStaff {
    // Map backend DTO to frontend model
    // Get the first pharmacy role as the primary role
    const primaryRole = dto.pharmacyRoles && dto.pharmacyRoles.length > 0 ? dto.pharmacyRoles[0] : null;
    
    return {
      id: dto.id,
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      username: dto.username,
      role: this.mapRoleName(dto.pharmacyRoles?.[0]?.roleName),
      pharmacyId: primaryRole?.pharmacyId || '',
      status: dto.status?.toLowerCase() || 'active',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(dto.fullName)}`,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt || dto.createdAt),
      pharmacyRoles: dto.pharmacyRoles || []
    };
  }

  private mapRoleName(roleName: string): UserRole {
    const roleMap: { [key: string]: UserRole } = {
      'ACCOUNT_OWNER': UserRole.ACCOUNT_OWNER,
      'PHARMACY_MANAGER': UserRole.PHARMACY_MANAGER,
      'PHARMACY_STAFF': UserRole.PHARMACY_STAFF,
      'PHARMACY_INVENTORY_MANAGER': UserRole.PHARMACY_INVENTORY_MANAGER
    };
    return roleMap[roleName] || UserRole.PHARMACY_STAFF;
  }
}
