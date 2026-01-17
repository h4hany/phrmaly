import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { RequestedProduct } from '../models/requested-product.model';
import { ApiService } from './api.service';
import { PharmacyContextService } from './pharmacy-context.service';

@Injectable({
  providedIn: 'root'
})
export class RequestedProductsService {
  private apiService = inject(ApiService);
  private pharmacyContextService = inject(PharmacyContextService);

  // Mock data storage (in real app, this would be API calls)
  private mockRequestedProducts: RequestedProduct[] = [];

  createRequest(productName: string, notes?: string): Observable<RequestedProduct> {
    const pharmacy = this.pharmacyContextService.getCurrentPharmacy();
    const pharmacyId = pharmacy?.id || '';
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    const newRequest: RequestedProduct = {
      id: `req_${Date.now()}`,
      productName,
      requestedBy: currentUser.username || currentUser.email || 'Unknown',
      requestedAt: new Date(),
      status: 'pending',
      notes,
      pharmacyId
    };

    this.mockRequestedProducts.unshift(newRequest);
    
    // In real app: return this.apiService.post<RequestedProduct>('/requested-products', newRequest);
    return of(newRequest).pipe(delay(500));
  }

  getAll(): Observable<RequestedProduct[]> {
    const pharmacy = this.pharmacyContextService.getCurrentPharmacy();
    const pharmacyId = pharmacy?.id || '';
    const filtered = this.mockRequestedProducts.filter(
      req => req.pharmacyId === pharmacyId
    );
    
    // In real app: return this.apiService.get<RequestedProduct[]>('/requested-products');
    return of(filtered).pipe(delay(300));
  }

  getById(id: string): Observable<RequestedProduct | null> {
    const product = this.mockRequestedProducts.find(p => p.id === id);
    // In real app: return this.apiService.get<RequestedProduct>(`/requested-products/${id}`);
    return of(product || null).pipe(delay(200));
  }

  updateStatus(id: string, status: RequestedProduct['status']): Observable<boolean> {
    const product = this.mockRequestedProducts.find(p => p.id === id);
    if (product) {
      product.status = status;
      // In real app: return this.apiService.patch(`/requested-products/${id}`, { status });
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }

  delete(id: string): Observable<boolean> {
    const index = this.mockRequestedProducts.findIndex(p => p.id === id);
    if (index > -1) {
      this.mockRequestedProducts.splice(index, 1);
      // In real app: return this.apiService.delete(`/requested-products/${id}`);
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }
}

