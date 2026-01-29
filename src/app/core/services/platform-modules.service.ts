import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PaginatedResponse, PaginationParams } from '../models/common.model';
import { CoreApiService } from './core-api.service';
import { PLATFORM_ENDPOINTS } from '../constants/platform-endpoints';
import { ApiResponse, PaginatedApiResponse } from '../models/api-response.model';

/**
 * Platform Module DTO matching backend structure
 */
export interface PlatformModule {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  code: string;
  capabilities: string; // Comma-separated string
  capabilitiesAr: string; // Comma-separated string
  price: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Create/Update Module DTO
 */
export interface CreateModuleDto {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  code: string;
  capabilities: string; // Comma-separated string
  capabilitiesAr: string; // Comma-separated string
  price: number;
  isActive: boolean;
}

/**
 * Platform Modules Service
 * 
 * Feature service for module management.
 * 
 * Architecture Rules:
 * - Orchestration only (calls CoreApiService)
 * - Handles pagination meta
 * - Handles success/error responses
 */
@Injectable({
  providedIn: 'root'
})
export class PlatformModulesService {
  private coreApi = inject(CoreApiService);

  /**
   * Get all modules with pagination
   */
  getAll(params?: PaginationParams): Observable<PaginatedResponse<PlatformModule>> {
    const queryParams: Record<string, any> = {};
    
    if (params?.page) {
      queryParams['PageNumber'] = params.page;
    }
    if (params?.pageSize) {
      queryParams['pageSize'] = params.pageSize;
    }

    return this.coreApi.get<PlatformModule[]>(
      PLATFORM_ENDPOINTS.modules.root,
      queryParams
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch modules');
        }

        // Handle both array and single object responses
        const modulesArray = Array.isArray(response.data) 
          ? response.data 
          : [response.data];
        
        const modules = modulesArray.map(module => this.mapModuleResponse(module));
        
        return {
          data: modules,
          total: response.meta?.pagination?.totalItems ?? modules.length,
          page: response.meta?.pagination?.page ?? 1,
          pageSize: response.meta?.pagination?.pageSize ?? 10,
          totalPages: response.meta?.pagination?.totalPages ?? 1
        };
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to fetch modules';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Get module by ID
   */
  getById(id: string): Observable<PlatformModule> {
    return this.coreApi.get<PlatformModule>(
      PLATFORM_ENDPOINTS.modules.byId(id)
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Module not found');
        }
        return this.mapModuleResponse(response.data);
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to fetch module';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Create module
   */
  create(moduleDto: CreateModuleDto): Observable<PlatformModule> {
    return this.coreApi.post<PlatformModule>(
      PLATFORM_ENDPOINTS.modules.root,
      moduleDto
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          const errorMsg = response.errors?.[0]?.message || response.message || 'Failed to create module';
          throw new Error(errorMsg);
        }
        return this.mapModuleResponse(response.data);
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to create module';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Update module
   */
  update(id: string, updates: CreateModuleDto): Observable<PlatformModule> {
    return this.coreApi.put<PlatformModule>(
      PLATFORM_ENDPOINTS.modules.byId(id),
      updates
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          const errorMsg = response.errors?.[0]?.message || response.message || 'Failed to update module';
          throw new Error(errorMsg);
        }
        return this.mapModuleResponse(response.data);
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to update module';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Delete module
   */
  delete(id: string): Observable<void> {
    return this.coreApi.delete<void>(
      PLATFORM_ENDPOINTS.modules.byId(id)
    ).pipe(
      map(response => {
        if (!response.success) {
          const errorMsg = response.errors?.[0]?.message || response.message || 'Failed to delete module';
          throw new Error(errorMsg);
        }
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to delete module';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Map API response to PlatformModule model
   * Handles both PascalCase (from backend) and camelCase
   */
  private mapModuleResponse(module: any): PlatformModule {
    return {
      id: module.id || module.Id || '',
      name: module.name || module.Name || '',
      nameAr: module.nameAr || module.NameAr || '',
      description: module.description || module.Description || '',
      descriptionAr: module.descriptionAr || module.DescriptionAr || '',
      code: module.code || module.Code || '',
      capabilities: module.capabilities || module.Capabilities || '',
      capabilitiesAr: module.capabilitiesAr || module.CapabilitiesAr || '',
      price: module.price ?? module.Price ?? 0,
      isActive: module.isActive !== undefined ? module.isActive : (module.IsActive !== undefined ? module.IsActive : true),
      createdAt: module.createdAt ? new Date(module.createdAt) : (module.CreatedAt ? new Date(module.CreatedAt) : undefined),
      updatedAt: module.updatedAt ? new Date(module.updatedAt) : (module.UpdatedAt ? new Date(module.UpdatedAt) : undefined)
    };
  }
}

