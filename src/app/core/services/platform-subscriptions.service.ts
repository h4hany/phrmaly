import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { SubscriptionPlan, Subscription, Invoice } from '../models/platform.model';
import { PaginatedResponse, PaginationParams } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class PlatformSubscriptionsService {
  private plans: SubscriptionPlan[] = [
    {
      id: 'PLAN001',
      name: 'Professional',
      description: 'For growing pharmacy chains',
      tier: 'professional',
      price: 299,
      currency: 'USD',
      billingCycle: 'monthly',
      maxPharmacies: 5,
      maxStaff: 50,
      enabledModules: ['inventory', 'hr', 'finance', 'automation', 'analytics'],
      features: {
        apiAccess: true,
        prioritySupport: true,
        customReports: true
      },
      isActive: true,
      isArchived: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 'PLAN002',
      name: 'Starter',
      description: 'For single pharmacies',
      tier: 'starter',
      price: 99,
      currency: 'USD',
      billingCycle: 'monthly',
      maxPharmacies: 1,
      maxStaff: 10,
      enabledModules: ['inventory', 'finance'],
      features: {
        apiAccess: false,
        prioritySupport: false,
        customReports: false
      },
      isActive: true,
      isArchived: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 'PLAN003',
      name: 'Enterprise',
      description: 'For large organizations',
      tier: 'enterprise',
      price: 999,
      currency: 'USD',
      billingCycle: 'monthly',
      maxPharmacies: -1, // Unlimited
      maxStaff: -1, // Unlimited
      enabledModules: ['inventory', 'hr', 'finance', 'automation', 'loyalty', 'api_access', 'ai_features', 'analytics'],
      features: {
        apiAccess: true,
        prioritySupport: true,
        customReports: true,
        whiteLabel: true,
        dedicatedSupport: true
      },
      isActive: true,
      isArchived: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ];

  private subscriptions: Subscription[] = [
    {
      id: 'SUB001',
      accountId: 'ACC001',
      planId: 'PLAN001',
      status: 'active',
      currentPeriodStart: new Date('2024-11-01'),
      currentPeriodEnd: new Date('2024-12-01'),
      cancelAtPeriodEnd: false,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-11-01')
    },
    {
      id: 'SUB002',
      accountId: 'ACC002',
      planId: 'PLAN002',
      status: 'trial',
      currentPeriodStart: new Date('2024-11-20'),
      currentPeriodEnd: new Date('2024-12-20'),
      cancelAtPeriodEnd: false,
      trialEndsAt: new Date('2024-12-20'),
      createdAt: new Date('2024-11-20'),
      updatedAt: new Date('2024-11-20')
    }
  ];

  private invoices: Invoice[] = [
    {
      id: 'INV001',
      subscriptionId: 'SUB001',
      accountId: 'ACC001',
      invoiceNumber: 'INV-2024-11-001',
      amount: 299,
      currency: 'USD',
      status: 'paid',
      dueDate: new Date('2024-11-01'),
      paidAt: new Date('2024-11-01'),
      createdAt: new Date('2024-11-01'),
      updatedAt: new Date('2024-11-01')
    }
  ];

  getPlans(params?: PaginationParams & { tier?: string; isActive?: boolean }): Observable<PaginatedResponse<SubscriptionPlan>> {
    let filtered = [...this.plans];

    if (params?.tier) {
      filtered = filtered.filter(p => p.tier === params.tier);
    }

    if (params?.isActive !== undefined) {
      filtered = filtered.filter(p => p.isActive === params.isActive);
    }

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginated = filtered.slice(start, end);

    return of({
      data: paginated,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize)
    }).pipe(delay(500));
  }

  getSubscriptions(params?: PaginationParams & { accountId?: string; status?: string }): Observable<PaginatedResponse<Subscription>> {
    let filtered = [...this.subscriptions];

    if (params?.accountId) {
      filtered = filtered.filter(s => s.accountId === params.accountId);
    }

    if (params?.status) {
      filtered = filtered.filter(s => s.status === params.status);
    }

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginated = filtered.slice(start, end);

    return of({
      data: paginated,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize)
    }).pipe(delay(500));
  }

  getInvoices(params?: PaginationParams & { accountId?: string; status?: string }): Observable<PaginatedResponse<Invoice>> {
    let filtered = [...this.invoices];

    if (params?.accountId) {
      filtered = filtered.filter(i => i.accountId === params.accountId);
    }

    if (params?.status) {
      filtered = filtered.filter(i => i.status === params.status);
    }

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginated = filtered.slice(start, end);

    return of({
      data: paginated,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize)
    }).pipe(delay(500));
  }

  createPlan(plan: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>): Observable<SubscriptionPlan> {
    const newPlan: SubscriptionPlan = {
      ...plan,
      id: `PLAN${String(this.plans.length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.plans.push(newPlan);
    return of(newPlan).pipe(delay(500));
  }

  assignPlan(accountId: string, planId: string): Observable<Subscription> {
    const subscription: Subscription = {
      id: `SUB${String(this.subscriptions.length + 1).padStart(3, '0')}`,
      accountId,
      planId,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.subscriptions.push(subscription);
    return of(subscription).pipe(delay(500));
  }
}

