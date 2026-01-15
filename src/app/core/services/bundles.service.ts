import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Bundle } from '../models/bundle.model';

@Injectable({
  providedIn: 'root'
})
export class BundlesService {
  private bundles: Bundle[] = [
    {
      id: 'BUN001',
      name: 'Cold & Flu Relief Pack',
      fixedPrice: 25.00,
      items: [
        { drugId: 'PDRG001', quantity: 2 },
        { drugId: 'PDRG002', quantity: 1 }
      ],
      pharmacyId: 'ph1',
      status: 'active',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    }
  ];

  getAll(): Observable<Bundle[]> {
    return of([...this.bundles]).pipe(delay(300));
  }

  getById(id: string): Observable<Bundle | null> {
    const bundle = this.bundles.find(b => b.id === id);
    return of(bundle || null).pipe(delay(200));
  }

  create(bundle: Omit<Bundle, 'id' | 'createdAt' | 'updatedAt'>): Observable<Bundle> {
    const newBundle: Bundle = {
      ...bundle,
      id: `BUN${String(this.bundles.length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.bundles.push(newBundle);
    return of(newBundle).pipe(delay(300));
  }

  update(id: string, bundle: Partial<Bundle>): Observable<Bundle> {
    const index = this.bundles.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error('Bundle not found');
    }
    this.bundles[index] = {
      ...this.bundles[index],
      ...bundle,
      id,
      updatedAt: new Date()
    };
    return of(this.bundles[index]).pipe(delay(300));
  }

  delete(id: string): Observable<boolean> {
    const index = this.bundles.findIndex(b => b.id === id);
    if (index === -1) {
      return of(false).pipe(delay(200));
    }
    this.bundles.splice(index, 1);
    return of(true).pipe(delay(300));
  }
}






