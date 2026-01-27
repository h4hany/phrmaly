import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { PharmacyStaff } from '../models/pharmacy-staff.model';
import { PaginatedResponse, PaginationParams } from '../models/common.model';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class PharmacyStaffService {
  private staff: PharmacyStaff[] = [
    {
      id: 'ST001',
      fullName: 'Sarah Johnson',
      email: 'sarah.johnson@pharmly.com',
      phone: '+1234567890',
      username: 'sarah.j',
      role: UserRole.PHARMACY_MANAGER,
      pharmacyId: 'ph1',
      status: 'active',
      avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+Johnson',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-11-27')
    },
    {
      id: 'ST002',
      fullName: 'Michael Chen',
      email: 'michael.chen@pharmly.com',
      phone: '+1234567891',
      username: 'michael.c',
      role: UserRole.PHARMACY_STAFF,
      pharmacyId: 'ph1',
      status: 'active',
      avatarUrl: 'https://ui-avatars.com/api/?name=Michael+Chen',
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-11-26')
    },
    {
      id: 'ST003',
      fullName: 'Emily Davis',
      email: 'emily.davis@pharmly.com',
      phone: '+1234567892',
      username: 'emily.d',
      role: UserRole.PHARMACY_STAFF,
      pharmacyId: 'ph1',
      status: 'active',
      avatarUrl: 'https://ui-avatars.com/api/?name=Emily+Davis',
      createdAt: new Date('2024-03-20'),
      updatedAt: new Date('2024-11-25')
    }
  ];

  getAll(params?: PaginationParams): Observable<PaginatedResponse<PharmacyStaff>> {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const filtered = [...this.staff];
    const paginated = filtered.slice(start, end);

    return of({
      data: paginated,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize)
    }).pipe(delay(500));
  }

  getById(id: string): Observable<PharmacyStaff | null> {
    const staffMember = this.staff.find(s => s.id === id);
    return of(staffMember || null).pipe(delay(300));
  }

  search(query: string): Observable<PharmacyStaff[]> {
    const lowerQuery = query.toLowerCase();
    const filtered = this.staff.filter(member =>
      member.fullName.toLowerCase().includes(lowerQuery) ||
      member.email.toLowerCase().includes(lowerQuery) ||
      member.phone?.toLowerCase().includes(lowerQuery) ||
      member.username?.toLowerCase().includes(lowerQuery)
    );
    return of(filtered).pipe(delay(300));
  }

  create(staff: Omit<PharmacyStaff, 'id' | 'createdAt' | 'updatedAt'>): Observable<PharmacyStaff> {
    const newStaff: PharmacyStaff = {
      ...staff,
      id: `ST${String(this.staff.length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.staff.push(newStaff);
    return of(newStaff).pipe(delay(500));
  }

  update(id: string, staff: Partial<PharmacyStaff>): Observable<PharmacyStaff> {
    const index = this.staff.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Staff member not found');
    }
    this.staff[index] = {
      ...this.staff[index],
      ...staff,
      id,
      updatedAt: new Date()
    };
    return of(this.staff[index]).pipe(delay(500));
  }

  delete(id: string): Observable<boolean> {
    const index = this.staff.findIndex(s => s.id === id);
    if (index === -1) {
      return of(false).pipe(delay(300));
    }
    this.staff.splice(index, 1);
    return of(true).pipe(delay(300));
  }
}










