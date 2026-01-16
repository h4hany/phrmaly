import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { AdminUser, PlatformRole } from '../models/platform.model';
import { PaginatedResponse, PaginationParams } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class PlatformAdminsService {
  private admins: AdminUser[] = [
    {
      id: 'ADM001',
      email: 'support@pharmly.com',
      username: 'support_admin',
      fullName: 'Support Admin',
      role: 'support_admin' as PlatformRole,
      status: 'active',
      permissions: [
        { resource: 'tickets', actions: ['read', 'write', 'manage'] },
        { resource: 'accounts', actions: ['read'] }
      ],
      lastLoginAt: new Date('2024-11-27'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-27'),
      createdBy: 'admin001'
    },
    {
      id: 'ADM002',
      email: 'sales@pharmly.com',
      username: 'sales_admin',
      fullName: 'Sales Admin',
      role: 'sales_admin' as PlatformRole,
      status: 'active',
      permissions: [
        { resource: 'accounts', actions: ['read', 'write'] },
        { resource: 'subscriptions', actions: ['read', 'write', 'manage'] }
      ],
      lastLoginAt: new Date('2024-11-26'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-26'),
      createdBy: 'admin001'
    }
  ];

  getAll(params?: PaginationParams & { role?: string; status?: string }): Observable<PaginatedResponse<AdminUser>> {
    let filtered = [...this.admins];

    if (params?.role) {
      filtered = filtered.filter(a => a.role === params.role);
    }

    if (params?.status) {
      filtered = filtered.filter(a => a.status === params.status);
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

  getById(id: string): Observable<AdminUser | null> {
    const admin = this.admins.find(a => a.id === id);
    return of(admin || null).pipe(delay(300));
  }

  create(admin: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>): Observable<AdminUser> {
    const newAdmin: AdminUser = {
      ...admin,
      id: `ADM${String(this.admins.length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.admins.push(newAdmin);
    return of(newAdmin).pipe(delay(500));
  }

  update(id: string, updates: Partial<AdminUser>): Observable<AdminUser> {
    const admin = this.admins.find(a => a.id === id);
    if (!admin) {
      throw new Error('Admin not found');
    }
    Object.assign(admin, updates, { updatedAt: new Date() });
    return of(admin).pipe(delay(500));
  }
}

