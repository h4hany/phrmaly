import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { PaymentMethod } from '../models/payment-method.model';
import { PaginatedResponse, PaginationParams } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodsService {
  private paymentMethods: PaymentMethod[] = [
    {
      id: 'PM001',
      name: 'Cash',
      deductionRate: 0,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 'PM002',
      name: 'Credit Card',
      deductionRate: 2.5,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 'PM003',
      name: 'Bank Transfer',
      deductionRate: 1.0,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    }
  ];

  getAll(params?: PaginationParams): Observable<PaginatedResponse<PaymentMethod>> {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const filtered = [...this.paymentMethods];
    const paginated = filtered.slice(start, end);

    return of({
      data: paginated,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize)
    }).pipe(delay(500));
  }

  getById(id: string): Observable<PaymentMethod | null> {
    const paymentMethod = this.paymentMethods.find(pm => pm.id === id);
    return of(paymentMethod || null).pipe(delay(300));
  }

  create(paymentMethod: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>): Observable<PaymentMethod> {
    const newPaymentMethod: PaymentMethod = {
      ...paymentMethod,
      id: `PM${String(this.paymentMethods.length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.paymentMethods.push(newPaymentMethod);
    return of(newPaymentMethod).pipe(delay(500));
  }

  update(id: string, paymentMethod: Partial<PaymentMethod>): Observable<PaymentMethod> {
    const index = this.paymentMethods.findIndex(pm => pm.id === id);
    if (index === -1) {
      throw new Error('Payment method not found');
    }
    this.paymentMethods[index] = {
      ...this.paymentMethods[index],
      ...paymentMethod,
      id,
      updatedAt: new Date()
    };
    return of(this.paymentMethods[index]).pipe(delay(500));
  }

  delete(id: string): Observable<boolean> {
    const index = this.paymentMethods.findIndex(pm => pm.id === id);
    if (index === -1) {
      return of(false).pipe(delay(300));
    }
    this.paymentMethods.splice(index, 1);
    return of(true).pipe(delay(500));
  }

  search(query: string): Observable<PaymentMethod[]> {
    const lowerQuery = query.toLowerCase();
    return of(this.paymentMethods.filter(pm =>
      pm.name.toLowerCase().includes(lowerQuery)
    )).pipe(delay(300));
  }
}



