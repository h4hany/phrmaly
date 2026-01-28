import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PaginatedResponse, PaginationParams } from '../models/common.model';
import { CoreApiService } from './core-api.service';
import { PLATFORM_ENDPOINTS } from '../constants/platform-endpoints';
import { ApiResponse, PaginatedApiResponse } from '../models/api-response.model';
import { CountryMapper } from '../../platform/mappers/country.mapper';

export interface Country {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PlatformCountriesService {
  private coreApi = inject(CoreApiService);

  getAll(params?: PaginationParams & { searchTerm?: string; isActive?: boolean }): Observable<PaginatedResponse<Country>> {
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
    if (params?.isActive !== undefined) {
      queryParams['isActive'] = params.isActive;
    }

    return this.coreApi.getPaginated<Country>(
      PLATFORM_ENDPOINTS.countries.root,
      queryParams
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch countries');
        }

        const countries = response.data.map(country => CountryMapper.fromApi(country));
        
        return {
          data: countries,
          total: response.meta?.pagination?.totalItems ?? countries.length,
          page: response.meta?.pagination?.page ?? 1,
          pageSize: response.meta?.pagination?.pageSize ?? 10,
          totalPages: response.meta?.pagination?.totalPages ?? 1
        };
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to fetch countries';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getById(id: string): Observable<Country> {
    return this.coreApi.get<Country>(
      PLATFORM_ENDPOINTS.countries.byId(id)
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Country not found');
        }
        return CountryMapper.fromApi(response.data);
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to fetch country';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  create(country: Omit<Country, 'id' | 'createdAt' | 'updatedAt'>): Observable<Country> {
    return this.coreApi.post<Country>(
      PLATFORM_ENDPOINTS.countries.root,
      country
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          const errorMsg = response.errors?.[0]?.message || response.message || 'Failed to create country';
          throw new Error(errorMsg);
        }
        return CountryMapper.fromApi(response.data);
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to create country';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  update(id: string, updates: Partial<Country>): Observable<Country> {
    return this.coreApi.put<Country>(
      PLATFORM_ENDPOINTS.countries.byId(id),
      updates
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          const errorMsg = response.errors?.[0]?.message || response.message || 'Failed to update country';
          throw new Error(errorMsg);
        }
        return CountryMapper.fromApi(response.data);
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to update country';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.coreApi.delete<void>(
      PLATFORM_ENDPOINTS.countries.byId(id)
    ).pipe(
      map(response => {
        if (!response.success) {
          const errorMsg = response.errors?.[0]?.message || response.message || 'Failed to delete country';
          throw new Error(errorMsg);
        }
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to delete country';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

}

