import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { PlatformAccount, PlatformModule } from '../models/platform.model';
import { PaginatedResponse, PaginationParams } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class PlatformAccountsService {
  private accounts: PlatformAccount[] = [
    {
      id: 'ACC001',
      name: 'Green Valley Pharmacy Chain',
      email: 'admin@greenvalley.com',
      phone: '+1234567890',
      status: 'active',
      subscriptionPlanId: 'PLAN001',
      maxPharmacies: 5,
      maxStaff: 50,
      pharmaciesCreated: 3,
      staffCreated: 25,
      enabledModules: ['inventory', 'hr', 'finance', 'automation', 'analytics'],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-11-27'),
      lastLoginAt: new Date('2024-11-27')
    },
    {
      id: 'ACC002',
      name: 'City Health Pharmacy',
      email: 'contact@cityhealth.com',
      phone: '+1234567891',
      status: 'trial',
      subscriptionPlanId: 'PLAN002',
      maxPharmacies: 1,
      maxStaff: 10,
      pharmaciesCreated: 1,
      staffCreated: 5,
      enabledModules: ['inventory', 'finance'],
      createdAt: new Date('2024-11-20'),
      updatedAt: new Date('2024-11-27'),
      trialEndsAt: new Date('2024-12-20'),
      lastLoginAt: new Date('2024-11-26')
    },
    {
      id: 'ACC003',
      name: 'MediCare Solutions',
      email: 'info@medicare.com',
      phone: '+1234567892',
      status: 'suspended',
      subscriptionPlanId: 'PLAN001',
      maxPharmacies: 10,
      maxStaff: 100,
      pharmaciesCreated: 8,
      staffCreated: 75,
      enabledModules: ['inventory', 'hr', 'finance', 'automation', 'loyalty', 'api_access'],
      createdAt: new Date('2023-06-10'),
      updatedAt: new Date('2024-11-25'),
      lastLoginAt: new Date('2024-11-20')
    }
  ];

  getAll(params?: PaginationParams & { status?: string; search?: string }): Observable<PaginatedResponse<PlatformAccount>> {
    let filtered = [...this.accounts];

    if (params?.status) {
      filtered = filtered.filter(a => a.status === params.status);
    }

    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(search) ||
        a.email.toLowerCase().includes(search)
      );
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

  getById(id: string): Observable<PlatformAccount | null> {
    const account = this.accounts.find(a => a.id === id);
    return of(account || null).pipe(delay(300));
  }

  create(account: Omit<PlatformAccount, 'id' | 'createdAt' | 'updatedAt' | 'pharmaciesCreated' | 'staffCreated'>): Observable<PlatformAccount> {
    const newAccount: PlatformAccount = {
      ...account,
      id: `ACC${String(this.accounts.length + 1).padStart(3, '0')}`,
      pharmaciesCreated: 0,
      staffCreated: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.accounts.push(newAccount);
    return of(newAccount).pipe(delay(500));
  }

  update(id: string, updates: Partial<PlatformAccount>): Observable<PlatformAccount> {
    const account = this.accounts.find(a => a.id === id);
    if (!account) {
      throw new Error('Account not found');
    }
    Object.assign(account, updates, { updatedAt: new Date() });
    return of(account).pipe(delay(500));
  }

  updateModules(id: string, modules: PlatformModule[]): Observable<PlatformAccount> {
    return this.update(id, { enabledModules: modules });
  }

  suspend(id: string, reason?: string): Observable<boolean> {
    return this.update(id, { status: 'suspended' }).pipe(
      delay(500),
      map(() => true)
    );
  }

  activate(id: string): Observable<boolean> {
    return this.update(id, { status: 'active' }).pipe(
      delay(500),
      map(() => true)
    );
  }
}

