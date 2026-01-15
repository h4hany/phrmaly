import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Invoice } from '../models/invoice.model';
import { PaginatedResponse, PaginationParams } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class InvoicesService {
  private invoices: Invoice[] = [
    {
      id: 'INV001',
      invoiceNumber: 'SALES-2024-001',
      patientId: 'PAT001',
      items: [
        {
          id: '1',
          drugId: 'PDRG001',
          drugName: 'Paracetamol 500mg',
          quantity: 2,
          unitPrice: 5.50,
          totalPrice: 11.00
        }
      ],
      subtotal: 11.00,
      discount: 0,
      total: 11.00,
      paymentStatus: 'paid',
      paymentMethod: 'cash',
      pharmacyId: 'ph1',
      createdAt: new Date('2024-11-27'),
      updatedAt: new Date('2024-11-27')
    }
  ];

  getAll(params?: PaginationParams): Observable<PaginatedResponse<Invoice>> {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const filtered = [...this.invoices];
    const paginated = filtered.slice(start, end);

    return of({
      data: paginated,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize)
    }).pipe(delay(500));
  }

  getById(id: string): Observable<Invoice | null> {
    const invoice = this.invoices.find(i => i.id === id);
    return of(invoice || null).pipe(delay(300));
  }

  create(invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt'>): Observable<Invoice> {
    const newInvoice: Invoice = {
      ...invoice,
      id: `INV${String(this.invoices.length + 1).padStart(3, '0')}`,
      invoiceNumber: `SALES-2024-${String(this.invoices.length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.invoices.push(newInvoice);
    // Decrease stock for each item
    return of(newInvoice).pipe(delay(500));
  }

  update(id: string, invoice: Partial<Invoice>): Observable<Invoice> {
    const index = this.invoices.findIndex(i => i.id === id);
    if (index === -1) {
      throw new Error('Invoice not found');
    }
    this.invoices[index] = {
      ...this.invoices[index],
      ...invoice,
      id,
      updatedAt: new Date()
    };
    return of(this.invoices[index]).pipe(delay(500));
  }

  delete(id: string): Observable<boolean> {
    const index = this.invoices.findIndex(i => i.id === id);
    if (index === -1) {
      return of(false).pipe(delay(300));
    }
    this.invoices.splice(index, 1);
    return of(true).pipe(delay(500));
  }

  search(query: string): Observable<Invoice[]> {
    const lowerQuery = query.toLowerCase();
    return of(this.invoices.filter(i =>
      i.invoiceNumber.toLowerCase().includes(lowerQuery) ||
      i.patientId.toLowerCase().includes(lowerQuery)
    )).pipe(delay(300));
  }
}

