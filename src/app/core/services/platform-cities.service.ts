import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PaginatedResponse, PaginationParams } from '../models/common.model';
import { CoreApiService } from './core-api.service';
import { PLATFORM_ENDPOINTS } from '../constants/platform-endpoints';
import { ApiResponse, PaginatedApiResponse } from '../models/api-response.model';
import { CityMapper } from '../../platform/mappers/city.mapper';

export interface City {
  id: string;
  name: string;
  countryId: string;
  countryName: string;
  country?: { id: string; name: string; code: string };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PlatformCitiesService {
  private coreApi = inject(CoreApiService);

  getAll(params?: PaginationParams & { countryId?: string; searchTerm?: string; isActive?: boolean }): Observable<PaginatedResponse<City>> {
    const queryParams: Record<string, any> = {};

    if (params?.page) {
      queryParams['PageNumber'] = params.page;
    }
    if (params?.pageSize) {
      queryParams['pageSize'] = params.pageSize;
    }
    if (params?.countryId) {
      queryParams['countryId'] = params.countryId;
    }
    if (params?.searchTerm) {
      queryParams['searchTerm'] = params.searchTerm;
    }
    if (params?.isActive !== undefined) {
      queryParams['isActive'] = params.isActive;
    }

    return this.coreApi.getPaginated<City>(
      PLATFORM_ENDPOINTS.cities.root,
      queryParams
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch cities');
        }

        const cities = response.data.map(city => CityMapper.fromApi(city));

        return {
          data: cities,
          total: response.meta?.pagination?.totalItems ?? cities.length,
          page: response.meta?.pagination?.page ?? 1,
          pageSize: response.meta?.pagination?.pageSize ?? 10,
          totalPages: response.meta?.pagination?.totalPages ?? 1
        };
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to fetch cities';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getById(id: string): Observable<City> {
    return this.coreApi.get<City>(
      PLATFORM_ENDPOINTS.cities.byId(id)
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'City not found');
        }
        return CityMapper.fromApi(response.data);
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to fetch city';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  create(city: Omit<City, 'id' | 'createdAt' | 'updatedAt'>): Observable<City> {
    return this.coreApi.post<City>(
      PLATFORM_ENDPOINTS.cities.root,
      city
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          const errorMsg = response.errors?.[0]?.message || response.message || 'Failed to create city';
          throw new Error(errorMsg);
        }
        return CityMapper.fromApi(response.data);
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to create city';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  update(id: string, updates: Partial<City>): Observable<City> {
    return this.coreApi.put<City>(
      PLATFORM_ENDPOINTS.cities.byId(id),
      updates
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          const errorMsg = response.errors?.[0]?.message || response.message || 'Failed to update city';
          throw new Error(errorMsg);
        }
        return CityMapper.fromApi(response.data);
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to update city';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.coreApi.delete<void>(
      PLATFORM_ENDPOINTS.cities.byId(id)
    ).pipe(
      map(response => {
        if (!response.success) {
          const errorMsg = response.errors?.[0]?.message || response.message || 'Failed to delete city';
          throw new Error(errorMsg);
        }
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to delete city';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

}

