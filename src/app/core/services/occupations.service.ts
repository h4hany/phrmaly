import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Occupation } from '../models/occupation.model';
import { PaginatedResponse, PaginationParams } from '../models/common.model';
import { CoreApiService } from './core-api.service';
import { PLATFORM_ENDPOINTS } from '../constants/platform-endpoints';
import { ApiResponse, PaginatedApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class OccupationsService {
  private coreApi = inject(CoreApiService);

  getAll(params?: PaginationParams & { searchTerm?: string }): Observable<PaginatedResponse<Occupation>> {
    const queryParams: Record<string, any> = {};
    
    if (params?.page) {
      queryParams['PageNumber'] = params.page;
    }
    if (params?.pageSize) {
      queryParams['pageSize'] = params.pageSize;
    }
    if (params?.searchTerm) {
      queryParams['searchTerm'] = params.searchTerm;
    }

    return this.coreApi.getPaginated<Occupation>(
      PLATFORM_ENDPOINTS.occupations.root,
      queryParams
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch occupations');
        }

        const occupations = response.data.map(occupation => this.mapOccupationResponse(occupation));
        
        return {
          data: occupations,
          total: response.meta?.pagination?.totalItems ?? occupations.length,
          page: response.meta?.pagination?.page ?? 1,
          pageSize: response.meta?.pagination?.pageSize ?? 10,
          totalPages: response.meta?.pagination?.totalPages ?? 1
        };
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to fetch occupations';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getById(id: string): Observable<Occupation> {
    return this.coreApi.get<Occupation>(
      PLATFORM_ENDPOINTS.occupations.byId(id)
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Occupation not found');
        }
        return this.mapOccupationResponse(response.data);
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to fetch occupation';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  create(occupation: Omit<Occupation, 'id' | 'createdAt' | 'updatedAt'>): Observable<Occupation> {
    return this.coreApi.post<Occupation>(
      PLATFORM_ENDPOINTS.occupations.root,
      occupation
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          const errorMsg = response.errors?.[0]?.message || response.message || 'Failed to create occupation';
          throw new Error(errorMsg);
        }
        return this.mapOccupationResponse(response.data);
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to create occupation';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  update(id: string, occupation: Partial<Occupation>): Observable<Occupation> {
    return this.coreApi.put<Occupation>(
      PLATFORM_ENDPOINTS.occupations.byId(id),
      occupation
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          const errorMsg = response.errors?.[0]?.message || response.message || 'Failed to update occupation';
          throw new Error(errorMsg);
        }
        return this.mapOccupationResponse(response.data);
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to update occupation';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.coreApi.delete<void>(
      PLATFORM_ENDPOINTS.occupations.byId(id)
    ).pipe(
      map(response => {
        if (!response.success) {
          const errorMsg = response.errors?.[0]?.message || response.message || 'Failed to delete occupation';
          throw new Error(errorMsg);
        }
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to delete occupation';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  search(query: string): Observable<Occupation[]> {
    return this.coreApi.get<Occupation[]>(
      PLATFORM_ENDPOINTS.occupations.root,
      { search: query }
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          return [];
        }
        return Array.isArray(response.data) ? response.data.map(o => this.mapOccupationResponse(o)) : [];
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to search occupations';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Map API response to Occupation model
   */
  private mapOccupationResponse(occupation: any): Occupation {
    return {
      id: occupation.id,
      name: occupation.name,
      createdAt: typeof occupation.createdAt === 'string' ? new Date(occupation.createdAt) : occupation.createdAt,
      updatedAt: typeof occupation.updatedAt === 'string' ? new Date(occupation.updatedAt) : occupation.updatedAt
    };
  }
}











