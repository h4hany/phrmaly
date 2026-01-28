import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SubscriptionPlan, Subscription, Invoice } from '../models/platform.model';
import { PaginatedResponse, PaginationParams } from '../models/common.model';
import { CoreApiService } from './core-api.service';
import { PLATFORM_ENDPOINTS } from '../constants/platform-endpoints';
import { ApiResponse, PaginatedApiResponse } from '../models/api-response.model';
import { SubscriptionPlanMapper } from '../../platform/mappers/subscription-plan.mapper';
import { SubscriptionMapper } from '../../platform/mappers/subscription.mapper';
import { InvoiceMapper } from '../../platform/mappers/invoice.mapper';

/**
 * Platform Subscriptions Service
 * 
 * Feature service for subscription management.
 * 
 * Architecture Rules:
 * - Orchestration only (calls CoreApiService)
 * - Uses mappers for transformation (never transforms data directly)
 * - Handles pagination meta
 * - Handles success/error responses
 * - No knowledge of backend field formats
 */
@Injectable({
  providedIn: 'root'
})
export class PlatformSubscriptionsService {
  private coreApi = inject(CoreApiService);

  /**
   * Get subscription plans with pagination
   */
  getPlans(
    params?: PaginationParams & { tier?: string; isActive?: boolean }
  ): Observable<PaginatedResponse<SubscriptionPlan>> {
    const queryParams: Record<string, any> = {};
    
    if (params?.page) {
      queryParams['PageNumber'] = params.page;
    }
    if (params?.pageSize) {
      queryParams['pageSize'] = params.pageSize;
    }
    if (params?.tier) {
      queryParams['tier'] = params.tier;
    }
    if (params?.isActive !== undefined) {
      queryParams['isActive'] = params.isActive;
    }

    return this.coreApi.getPaginated<SubscriptionPlan>(
      PLATFORM_ENDPOINTS.plans.root,
      queryParams
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch subscription plans');
        }

        const plans = response.data.map(plan => SubscriptionPlanMapper.fromApi(plan));
        
        return {
          data: plans,
          total: response.meta?.pagination?.totalItems ?? plans.length,
          page: response.meta?.pagination?.page ?? 1,
          pageSize: response.meta?.pagination?.pageSize ?? 10,
          totalPages: response.meta?.pagination?.totalPages ?? 1
        };
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to fetch subscription plans';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Get subscription plan by ID
   */
  getPlanById(id: string): Observable<SubscriptionPlan> {
    return this.coreApi.get<SubscriptionPlan>(
      PLATFORM_ENDPOINTS.plans.byId(id)
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Subscription plan not found');
        }
        return SubscriptionPlanMapper.fromApi(response.data);
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to fetch subscription plan';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Create subscription plan
   */
  createPlan(
    plan: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>
  ): Observable<SubscriptionPlan> {
    return this.coreApi.post<SubscriptionPlan>(
      PLATFORM_ENDPOINTS.plans.root,
      plan
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          const errorMsg = response.errors?.[0]?.message || response.message || 'Failed to create subscription plan';
          throw new Error(errorMsg);
        }
        return SubscriptionPlanMapper.fromApi(response.data);
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to create subscription plan';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Update subscription plan
   */
  updatePlan(
    id: string,
    updates: Partial<SubscriptionPlan>
  ): Observable<SubscriptionPlan> {
    return this.coreApi.put<SubscriptionPlan>(
      PLATFORM_ENDPOINTS.plans.byId(id),
      updates
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          const errorMsg = response.errors?.[0]?.message || response.message || 'Failed to update subscription plan';
          throw new Error(errorMsg);
        }
        return SubscriptionPlanMapper.fromApi(response.data);
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to update subscription plan';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Delete subscription plan
   */
  deletePlan(id: string): Observable<void> {
    return this.coreApi.delete<void>(
      PLATFORM_ENDPOINTS.plans.byId(id)
    ).pipe(
      map(response => {
        if (!response.success) {
          const errorMsg = response.errors?.[0]?.message || response.message || 'Failed to delete subscription plan';
          throw new Error(errorMsg);
        }
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to delete subscription plan';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Get subscriptions with pagination
   */
  getSubscriptions(
    params?: PaginationParams & { accountId?: string; status?: string }
  ): Observable<PaginatedResponse<Subscription>> {
    const queryParams: Record<string, any> = {};
    
    if (params?.page) {
      queryParams['PageNumber'] = params.page;
    }
    if (params?.pageSize) {
      queryParams['pageSize'] = params.pageSize;
    }
    if (params?.accountId) {
      queryParams['accountId'] = params.accountId;
    }
    if (params?.status) {
      queryParams['status'] = params.status;
    }

    return this.coreApi.getPaginated<Subscription>(
      PLATFORM_ENDPOINTS.subscriptions.root,
      queryParams
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch subscriptions');
        }

        const subscriptions = response.data.map(sub => SubscriptionMapper.fromApi(sub));
        
        return {
          data: subscriptions,
          total: response.meta?.pagination?.totalItems ?? subscriptions.length,
          page: response.meta?.pagination?.page ?? 1,
          pageSize: response.meta?.pagination?.pageSize ?? 10,
          totalPages: response.meta?.pagination?.totalPages ?? 1
        };
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to fetch subscriptions';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Get invoices with pagination
   */
  getInvoices(
    params?: PaginationParams & { accountId?: string; status?: string }
  ): Observable<PaginatedResponse<Invoice>> {
    const queryParams: Record<string, any> = {};
    
    if (params?.page) {
      queryParams['PageNumber'] = params.page;
    }
    if (params?.pageSize) {
      queryParams['pageSize'] = params.pageSize;
    }
    if (params?.accountId) {
      queryParams['accountId'] = params.accountId;
    }
    if (params?.status) {
      queryParams['status'] = params.status;
    }

    return this.coreApi.getPaginated<Invoice>(
      PLATFORM_ENDPOINTS.invoices.root,
      queryParams
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch invoices');
        }

        const invoices = response.data.map(invoice => InvoiceMapper.fromApi(invoice));
        
        return {
          data: invoices,
          total: response.meta?.pagination?.totalItems ?? invoices.length,
          page: response.meta?.pagination?.page ?? 1,
          pageSize: response.meta?.pagination?.pageSize ?? 10,
          totalPages: response.meta?.pagination?.totalPages ?? 1
        };
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to fetch invoices';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Assign plan to account (creates subscription)
   */
  assignPlan(accountId: string, planId: string): Observable<Subscription> {
    return this.coreApi.post<Subscription>(
      PLATFORM_ENDPOINTS.subscriptions.root,
      { accountId, planId }
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          const errorMsg = response.errors?.[0]?.message || response.message || 'Failed to assign plan';
          throw new Error(errorMsg);
        }
        return SubscriptionMapper.fromApi(response.data);
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to assign plan';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

}
