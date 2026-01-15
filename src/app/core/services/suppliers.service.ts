import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Supplier } from '../models/supplier.model';
import { PaginatedResponse, PaginationParams } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class SuppliersService {
  private suppliers: Supplier[] = [
    {
      id: 'SUP001',
      name: 'ABC Pharmaceuticals',
      type: 'manufacturer',
      phone: '+1-555-0101',
      email: 'contact@abcpharma.com',
      address: '123 Pharma Street, New York',
      notes: 'Primary manufacturer',
      status: 'active',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-11-27')
    },
    {
      id: 'SUP002',
      name: 'Global Medical Warehouse',
      type: 'warehouse',
      phone: '+1-555-0102',
      email: 'info@globalwarehouse.com',
      address: '456 Medical Ave, Los Angeles',
      notes: 'Bulk supplier',
      status: 'active',
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-11-26')
    },
    {
      id: 'SUP003',
      name: 'MedTech Industries',
      type: 'manufacturer',
      phone: '+1-555-0103',
      email: 'sales@medtech.com',
      address: '789 Industry Blvd, Chicago',
      status: 'active',
      createdAt: new Date('2024-03-20'),
      updatedAt: new Date('2024-11-25')
    }
  ];

  getAll(params?: PaginationParams): Observable<PaginatedResponse<Supplier>> {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const filtered = [...this.suppliers];
    const paginated = filtered.slice(start, end);

    return of({
      data: paginated,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize)
    }).pipe(delay(500));
  }

  getById(id: string): Observable<Supplier | null> {
    const supplier = this.suppliers.find(s => s.id === id);
    return of(supplier || null).pipe(delay(300));
  }

  create(supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Observable<Supplier> {
    const newSupplier: Supplier = {
      ...supplier,
      id: `SUP${String(this.suppliers.length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.suppliers.push(newSupplier);
    return of(newSupplier).pipe(delay(500));
  }

  update(id: string, supplier: Partial<Supplier>): Observable<Supplier> {
    const index = this.suppliers.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Supplier not found');
    }
    this.suppliers[index] = {
      ...this.suppliers[index],
      ...supplier,
      id,
      updatedAt: new Date()
    };
    return of(this.suppliers[index]).pipe(delay(500));
  }

  delete(id: string): Observable<boolean> {
    const index = this.suppliers.findIndex(s => s.id === id);
    if (index === -1) {
      return of(false).pipe(delay(300));
    }
    this.suppliers.splice(index, 1);
    return of(true).pipe(delay(500));
  }

  search(query: string): Observable<Supplier[]> {
    const lowerQuery = query.toLowerCase();
    return of(this.suppliers.filter(s =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.email?.toLowerCase().includes(lowerQuery) ||
      s.phone?.includes(query)
    )).pipe(delay(300));
  }

  filterByType(type: 'manufacturer' | 'warehouse'): Observable<Supplier[]> {
    return of(this.suppliers.filter(s => s.type === type)).pipe(delay(300));
  }

  filterByStatus(status: 'active' | 'inactive'): Observable<Supplier[]> {
    return of(this.suppliers.filter(s => s.status === status)).pipe(delay(300));
  }
}







