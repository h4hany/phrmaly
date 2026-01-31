import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PaginatedResponse, PaginationParams } from '../models/common.model';
import { CoreApiService } from './core-api.service';
import { PLATFORM_ENDPOINTS } from '../constants/platform-endpoints';
import { ApiResponse, PaginatedApiResponse } from '../models/api-response.model';
import { AreaMapper } from '../../platform/mappers/area.mapper';

export interface Area {
  id: string;
  name: string;
  cityId: string;
  cityName: string;
  city?: { id: string; name: string; countryId: string };
  country?: { id: string; name: string; code: string };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PlatformAreasService {
  private coreApi = inject(CoreApiService);

  getAll(params?: PaginationParams & { cityId?: string; searchTerm?: string; isActive?: boolean }): Observable<PaginatedResponse<Area>> {
    const queryParams: Record<string, any> = {};

    if (params?.page) {
      queryParams['PageNumber'] = params.page;
    }
    if (params?.pageSize) {
      queryParams['pageSize'] = params.pageSize;
    }
    if (params?.cityId) {
      queryParams['cityId'] = params.cityId;
    }
    if (params?.searchTerm) {
      queryParams['searchTerm'] = params.searchTerm;
    }
    if (params?.isActive !== undefined) {
      queryParams['isActive'] = params.isActive;
    }

    return this.coreApi.getPaginated<Area>(
      PLATFORM_ENDPOINTS.areas.root,
      queryParams
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch areas');
        }

        const areas = response.data.map(area => AreaMapper.fromApi(area));

        return {
          data: areas,
          total: response.meta?.pagination?.totalItems ?? areas.length,
          page: response.meta?.pagination?.page ?? 1,
          pageSize: response.meta?.pagination?.pageSize ?? 10,
          totalPages: response.meta?.pagination?.totalPages ?? 1
        };
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to fetch areas';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getById(id: string): Observable<Area> {
    return this.coreApi.get<Area>(
      PLATFORM_ENDPOINTS.areas.byId(id)
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Area not found');
        }
        return AreaMapper.fromApi(response.data);
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to fetch area';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  create(area: Omit<Area, 'id' | 'createdAt' | 'updatedAt'>): Observable<Area> {
    return this.coreApi.post<Area>(
      PLATFORM_ENDPOINTS.areas.root,
      area
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          const errorMsg = response.errors?.[0]?.message || response.message || 'Failed to create area';
          throw new Error(errorMsg);
        }
        return AreaMapper.fromApi(response.data);
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to create area';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  update(id: string, updates: Partial<Area>): Observable<Area> {
    return this.coreApi.put<Area>(
      PLATFORM_ENDPOINTS.areas.byId(id),
      updates
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          const errorMsg = response.errors?.[0]?.message || response.message || 'Failed to update area';
          throw new Error(errorMsg);
        }
        return AreaMapper.fromApi(response.data);
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to update area';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.coreApi.delete<void>(
      PLATFORM_ENDPOINTS.areas.byId(id)
    ).pipe(
      map(response => {
        if (!response.success) {
          const errorMsg = response.errors?.[0]?.message || response.message || 'Failed to delete area';
          throw new Error(errorMsg);
        }
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to delete area';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

}

