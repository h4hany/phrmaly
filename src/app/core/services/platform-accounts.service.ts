import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PlatformAccount, PlatformModule } from '../models/platform.model';
import { PaginatedResponse, PaginationParams } from '../models/common.model';
import { CoreApiService } from './core-api.service';
import { PLATFORM_ENDPOINTS } from '../constants/platform-endpoints';
import { ApiResponse, PaginatedApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class PlatformAccountsService {
  private coreApi = inject(CoreApiService);

  getAll(params?: PaginationParams & { status?: string; search?: string }): Observable<PaginatedResponse<PlatformAccount>> {
    const queryParams: Record<string, any> = {};
    
    if (params?.page) {
      queryParams['PageNumber'] = params.page;
    }
    if (params?.pageSize) {
      queryParams['PageSize'] = params.pageSize;
    }
    if (params?.search) {
      queryParams['SearchTerm'] = params.search;
    }
    if (params?.status) {
      queryParams['Status'] = params.status;
    }

    return this.coreApi.get<PaginatedResult<any>>(
      PLATFORM_ENDPOINTS.accounts.root,
      queryParams
    ).pipe(
      map((response: ApiResponse<PaginatedResult<any>>) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch accounts');
        }

        const accounts = response.data.data.map((account: any) => ({
          id: account.id,
          name: account.name,
          email: account.email,
          phone: account.phone,
          status: account.status,
          subscriptionPlanId: '', // Will be populated from subscription
          maxPharmacies: 0, // Not in response
          maxStaff: 0, // Not in response
          pharmaciesCreated: 0, // Will be fetched separately
          staffCreated: 0, // Will be fetched separately
          enabledModules: [], // Will be fetched from detail
          createdAt: new Date(account.createdAt),
          updatedAt: new Date(account.updatedAt),
          lastLoginAt: undefined
        } as PlatformAccount));
        
        return {
          data: accounts,
          total: response.data.totalCount,
          page: response.data.pageNumber,
          pageSize: response.data.pageSize,
          totalPages: response.data.totalPages
        };
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to fetch accounts';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getById(id: string): Observable<PlatformAccount | null> {
    return this.coreApi.get<TenantAccountDetail>(
      PLATFORM_ENDPOINTS.accounts.byId(id)
    ).pipe(
      map((response: ApiResponse<TenantAccountDetail>) => {
        if (!response.success || !response.data) {
          return null;
        }
        const account = response.data;
        return {
          id: account.id,
          name: account.name,
          email: account.email,
          phone: account.phone,
          status: account.status as any,
          subscriptionPlanId: account.latestSubscription?.planId || '',
          maxPharmacies: 0,
          maxStaff: 0,
          pharmaciesCreated: 0,
          staffCreated: 0,
          enabledModules: account.enabledModules as PlatformModule[],
          createdAt: new Date(account.createdAt),
          updatedAt: new Date(account.updatedAt),
          lastLoginAt: undefined
        } as PlatformAccount;
      }),
      catchError(error => {
        return throwError(() => new Error(error.message || 'Failed to fetch account'));
      })
    );
  }

  getAccountDetail(id: string): Observable<TenantAccountDetail | null> {
    return this.coreApi.get<TenantAccountDetail>(
      PLATFORM_ENDPOINTS.accounts.byId(id)
    ).pipe(
      map((response: ApiResponse<TenantAccountDetail>) => {
        if (!response.success || !response.data) {
          return null;
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.message || 'Failed to fetch account detail'));
      })
    );
  }

  getAccountStaff(accountId: string, params?: PaginationParams & { search?: string }): Observable<PaginatedResponse<TenantStaff>> {
    const queryParams: Record<string, any> = {};
    
    if (params?.page) {
      queryParams['PageNumber'] = params.page;
    }
    if (params?.pageSize) {
      queryParams['PageSize'] = params.pageSize;
    }
    if (params?.search) {
      queryParams['SearchTerm'] = params.search;
    }

    return this.coreApi.get<TenantPaginatedResult<TenantStaff>>(
      `${PLATFORM_ENDPOINTS.accounts.byId(accountId)}/staff`,
      queryParams
    ).pipe(
      map((response: ApiResponse<TenantPaginatedResult<TenantStaff>>) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch staff');
        }
        return {
          data: response.data.items,
          total: response.data.totalItems,
          page: response.data.page,
          pageSize: response.data.pageSize,
          totalPages: response.data.totalPages
        };
      }),
      catchError(error => {
        return throwError(() => new Error(error.message || 'Failed to fetch staff'));
      })
    );
  }

  getAccountPharmacies(accountId: string, params?: PaginationParams & { search?: string }): Observable<PaginatedResponse<TenantPharmacy>> {
    const queryParams: Record<string, any> = {};
    
    if (params?.page) {
      queryParams['PageNumber'] = params.page;
    }
    if (params?.pageSize) {
      queryParams['PageSize'] = params.pageSize;
    }
    if (params?.search) {
      queryParams['SearchTerm'] = params.search;
    }

    return this.coreApi.get<TenantPaginatedResult<TenantPharmacy>>(
      `${PLATFORM_ENDPOINTS.accounts.byId(accountId)}/pharmacies`,
      queryParams
    ).pipe(
      map((response: ApiResponse<TenantPaginatedResult<TenantPharmacy>>) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch pharmacies');
        }
        return {
          data: response.data.items,
          total: response.data.totalItems,
          page: response.data.page,
          pageSize: response.data.pageSize,
          totalPages: response.data.totalPages
        };
      }),
      catchError(error => {
        return throwError(() => new Error(error.message || 'Failed to fetch pharmacies'));
      })
    );
  }

  updateModules(id: string, modules: PlatformModule[]): Observable<PlatformAccount> {
    // TODO: Implement module update endpoint
    return throwError(() => new Error('Not implemented yet'));
  }

  suspend(id: string, reason?: string): Observable<boolean> {
    // TODO: Implement suspend endpoint
    return throwError(() => new Error('Not implemented yet'));
  }

  activate(id: string): Observable<boolean> {
    // TODO: Implement activate endpoint
    return throwError(() => new Error('Not implemented yet'));
  }

  /**
   * Update enabled modules for an account
   */
  updateAccountModules(accountId: string, enabledModuleCodes: string[]): Observable<TenantAccountDetail> {
    return this.coreApi.put<TenantAccountDetail>(
      `${PLATFORM_ENDPOINTS.accounts.byId(accountId)}/modules`,
      { enabledModuleCodes }
    ).pipe(
      map((response: ApiResponse<TenantAccountDetail>) => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to update account modules');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.message || 'Failed to update account modules'));
      })
    );
  }

  /**
   * Provision a new tenant account
   */
  provisionAccount(request: ProvisionAccountRequest): Observable<ApiResponse<ProvisionAccountResponse>> {
    // Create FormData for file upload
    const formData = new FormData();
    
    formData.append('planId', request.planId);
    request.selectedModules.forEach(moduleId => {
      formData.append('selectedModules', moduleId);
    });
    
    // Account info - use nested object notation for FormData
    formData.append('accountInfo.name', request.accountInfo.name);
    formData.append('accountInfo.email', request.accountInfo.email);
    if (request.accountInfo.website) {
      formData.append('accountInfo.website', request.accountInfo.website);
    }
    if (request.accountInfo.phone) {
      formData.append('accountInfo.phone', request.accountInfo.phone);
    }
    if (request.accountInfo.logoUrl) {
      formData.append('accountInfo.logoUrl', request.accountInfo.logoUrl);
    }
    if (request.accountInfo.contract) {
      formData.append('accountInfo.contract', request.accountInfo.contract);
    }
    
    // Pharmacies - use array notation
    request.pharmacies.forEach((pharmacy, index) => {
      formData.append(`pharmacies[${index}].name`, pharmacy.name);
      if (pharmacy.address) {
        formData.append(`pharmacies[${index}].address`, pharmacy.address);
      }
      if (pharmacy.areaId) {
        formData.append(`pharmacies[${index}].areaId`, pharmacy.areaId);
      }
      if (pharmacy.latitude !== undefined && pharmacy.latitude !== null) {
        formData.append(`pharmacies[${index}].latitude`, pharmacy.latitude.toString());
      }
      if (pharmacy.longitude !== undefined && pharmacy.longitude !== null) {
        formData.append(`pharmacies[${index}].longitude`, pharmacy.longitude.toString());
      }
    });
    
    // Account owner
    formData.append('accountOwner.fullName', request.accountOwner.fullName);
    formData.append('accountOwner.email', request.accountOwner.email);
    formData.append('accountOwner.username', request.accountOwner.username);
    formData.append('accountOwner.password', request.accountOwner.password);

    return this.coreApi.postFormData<ProvisionAccountResponse>(
      PLATFORM_ENDPOINTS.accounts.root,
      formData
    );
  }
}

export interface ProvisionAccountRequest {
  planId: string;
  selectedModules: string[];
  accountInfo: {
    name: string;
    website?: string;
    email: string;
    phone?: string;
    logoUrl?: string;
    contract?: File;
  };
  pharmacies: Array<{
    name: string;
    address?: string;
    areaId?: string;
    latitude?: number;
    longitude?: number;
  }>;
  accountOwner: {
    fullName: string;
    email: string;
    username: string;
    password: string;
  };
}

export interface ProvisionAccountResponse {
  accountId: string;
  accountName: string;
  slug: string;
  subdomain: string;
  ownerCredentials: {
    email: string;
    username: string;
    password: string;
  };
}

export interface TenantAccountDetail {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  email: string;
  phone?: string;
  website?: string;
  logoUrl?: string;
  contractUrl?: string;
  status: string;
  enabledModules: string[];
  latestSubscription?: {
    id: string;
    planId: string;
    planName: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    trialEndsAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TenantStaff {
  id: string;
  accountId: string;
  email: string;
  username: string;
  phone?: string;
  fullName: string;
  status: string;
  lastLoginAt?: string;
  createdAt: string;
  pharmacyRoles: Array<{
    pharmacyId: string;
    pharmacyName: string;
    roleId: string;
    roleName: string;
  }>;
}

export interface TenantPharmacy {
  id: string;
  accountId: string;
  name: string;
  address?: string;
  areaId?: string;
  areaName?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

export interface TenantPaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

