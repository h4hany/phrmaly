import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PaginatedResponse, PaginationParams } from '../models/common.model';

export interface PlatformModule {
  id: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  capabilities: string;
  capabilitiesAr?: string;
  pricePerMonth?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PlatformModulesService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5000/api/platform/v1';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    });
  }

  getAll(params?: PaginationParams): Observable<PaginatedResponse<PlatformModule>> {
    let httpParams = new HttpParams();
    
    if (params?.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.pageSize) {
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }

    return this.http.get<PaginatedResponse<PlatformModule>>(`${this.baseUrl}/modules`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      map(response => ({
        ...response,
        data: response.data.map(module => this.mapModuleResponse(module))
      })),
      catchError(error => {
        const errorMessage = error.error?.message || error.message || 'Failed to fetch modules';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getById(id: string): Observable<PlatformModule> {
    return this.http.get<PlatformModule>(`${this.baseUrl}/modules/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(module => this.mapModuleResponse(module)),
      catchError(error => {
        if (error.status === 404) {
          return throwError(() => new Error('Module not found'));
        }
        const errorMessage = error.error?.message || error.message || 'Failed to fetch module';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  create(module: Omit<PlatformModule, 'id' | 'createdAt' | 'updatedAt'>): Observable<PlatformModule> {
    return this.http.post<PlatformModule>(`${this.baseUrl}/modules`, module, {
      headers: this.getHeaders()
    }).pipe(
      map(response => this.mapModuleResponse(response)),
      catchError(error => {
        const errorMessage = error.error?.message || error.message || 'Failed to create module';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  update(id: string, updates: Partial<PlatformModule>): Observable<PlatformModule> {
    return this.http.put<PlatformModule>(`${this.baseUrl}/modules/${id}`, updates, {
      headers: this.getHeaders()
    }).pipe(
      map(response => this.mapModuleResponse(response)),
      catchError(error => {
        if (error.status === 404) {
          return throwError(() => new Error('Module not found'));
        }
        const errorMessage = error.error?.message || error.message || 'Failed to update module';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/modules/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        if (error.status === 404) {
          return throwError(() => new Error('Module not found'));
        }
        const errorMessage = error.error?.message || error.message || 'Failed to delete module';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Map API response to PlatformModule model
   */
  private mapModuleResponse(module: any): PlatformModule {
    return {
      id: module.id,
      name: module.name,
      nameAr: module.nameAr,
      description: module.description || '',
      descriptionAr: module.descriptionAr,
      capabilities: module.capabilities || '',
      capabilitiesAr: module.capabilitiesAr,
      pricePerMonth: module.pricePerMonth,
      isActive: module.isActive !== undefined ? module.isActive : true,
      createdAt: new Date(module.createdAt),
      updatedAt: new Date(module.updatedAt)
    };
  }
}

