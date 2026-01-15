import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { PurchaseInvoice } from '../models/purchase.model';
import { PaginatedResponse, PaginationParams } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class PurchasesService {
  private purchases: PurchaseInvoice[] = [
    {
      id: 'PUR001',
      invoiceNumber: 'INV-2024-001',
      supplierId: 'SUP001',
      purchaseDate: new Date('2024-11-20'),
      dueDate: new Date('2024-12-20'),
      items: [
        {
          id: '1',
          drugId: 'PDRG001',
          drugName: 'Paracetamol 500mg',
          quantity: 100,
          unitCost: 3.50,
          totalCost: 350
        }
      ],
      totalAmount: 350,
      paidAmount: 150,
      remainingAmount: 200,
      paymentStatus: 'partial',
      pharmacyId: 'ph1',
      createdAt: new Date('2024-11-20'),
      updatedAt: new Date('2024-11-20')
    },
    {
      id: 'PUR002',
      invoiceNumber: 'INV-2024-002',
      supplierId: 'SUP002',
      purchaseDate: new Date('2024-11-25'),
      dueDate: new Date('2024-12-25'),
      items: [
        {
          id: '2',
          drugId: 'PDRG002',
          drugName: 'Ibuprofen 200mg',
          quantity: 50,
          unitCost: 5.00,
          totalCost: 250
        }
      ],
      totalAmount: 250,
      paidAmount: 250,
      remainingAmount: 0,
      paymentStatus: 'paid',
      pharmacyId: 'ph1',
      createdAt: new Date('2024-11-25'),
      updatedAt: new Date('2024-11-25')
    }
  ];

  getAll(params?: PaginationParams): Observable<PaginatedResponse<PurchaseInvoice>> {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const filtered = [...this.purchases];
    const paginated = filtered.slice(start, end);

    return of({
      data: paginated,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize)
    }).pipe(delay(500));
  }

  getById(id: string): Observable<PurchaseInvoice | null> {
    const purchase = this.purchases.find(p => p.id === id);
    return of(purchase || null).pipe(delay(300));
  }

  create(purchase: Omit<PurchaseInvoice, 'id' | 'createdAt' | 'updatedAt'>): Observable<PurchaseInvoice> {
    const newPurchase: PurchaseInvoice = {
      ...purchase,
      id: `PUR${String(this.purchases.length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.purchases.push(newPurchase);
    // Increase stock for each item
    return of(newPurchase).pipe(delay(500));
  }

  update(id: string, purchase: Partial<PurchaseInvoice>): Observable<PurchaseInvoice> {
    const index = this.purchases.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Purchase invoice not found');
    }
    this.purchases[index] = {
      ...this.purchases[index],
      ...purchase,
      id,
      updatedAt: new Date()
    };
    return of(this.purchases[index]).pipe(delay(500));
  }

  delete(id: string): Observable<boolean> {
    const index = this.purchases.findIndex(p => p.id === id);
    if (index === -1) {
      return of(false).pipe(delay(300));
    }
    this.purchases.splice(index, 1);
    return of(true).pipe(delay(500));
  }

  search(query: string): Observable<PurchaseInvoice[]> {
    const lowerQuery = query.toLowerCase();
    return of(this.purchases.filter(p =>
      p.invoiceNumber.toLowerCase().includes(lowerQuery) ||
      p.supplierId.toLowerCase().includes(lowerQuery)
    )).pipe(delay(300));
  }
}






