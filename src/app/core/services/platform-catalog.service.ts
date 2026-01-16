import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { GlobalDrug } from '../models/platform.model';
import { PaginatedResponse, PaginationParams } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class PlatformCatalogService {
  private globalDrugs: GlobalDrug[] = [
    {
      id: 'GD001',
      name: 'Paracetamol 500mg',
      genericName: 'Acetaminophen',
      barcode: '1234567890123',
      atcCode: 'N02BE01',
      therapeuticClass: 'Analgesics',
      manufacturer: 'ABC Pharmaceuticals',
      priceReference: 5.50,
      alternatives: ['GD002'],
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-27'),
      createdBy: 'admin001',
      affectedPharmacies: 150
    },
    {
      id: 'GD002',
      name: 'Ibuprofen 200mg',
      genericName: 'Ibuprofen',
      barcode: '1234567890124',
      atcCode: 'M01AE01',
      therapeuticClass: 'NSAIDs',
      manufacturer: 'MedTech Industries',
      priceReference: 8.00,
      alternatives: ['GD001'],
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-27'),
      createdBy: 'admin001',
      affectedPharmacies: 120
    },
    {
      id: 'GD003',
      name: 'Amoxicillin 250mg',
      genericName: 'Amoxicillin',
      barcode: '1234567890125',
      atcCode: 'J01CA04',
      therapeuticClass: 'Antibiotics',
      manufacturer: 'ABC Pharmaceuticals',
      priceReference: 12.00,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-11-27'),
      createdBy: 'admin001',
      affectedPharmacies: 95
    }
  ];

  getAll(params?: PaginationParams & { search?: string; isActive?: boolean }): Observable<PaginatedResponse<GlobalDrug>> {
    let filtered = [...this.globalDrugs];

    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(search) ||
        d.genericName.toLowerCase().includes(search) ||
        d.barcode?.toLowerCase().includes(search)
      );
    }

    if (params?.isActive !== undefined) {
      filtered = filtered.filter(d => d.isActive === params.isActive);
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

  getById(id: string): Observable<GlobalDrug | null> {
    const drug = this.globalDrugs.find(d => d.id === id);
    return of(drug || null).pipe(delay(300));
  }

  create(drug: Omit<GlobalDrug, 'id' | 'createdAt' | 'updatedAt' | 'affectedPharmacies'>): Observable<GlobalDrug> {
    const newDrug: GlobalDrug = {
      ...drug,
      id: `GD${String(this.globalDrugs.length + 1).padStart(3, '0')}`,
      affectedPharmacies: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.globalDrugs.push(newDrug);
    return of(newDrug).pipe(delay(500));
  }

  update(id: string, updates: Partial<GlobalDrug>): Observable<GlobalDrug> {
    const drug = this.globalDrugs.find(d => d.id === id);
    if (!drug) {
      throw new Error('Drug not found');
    }
    Object.assign(drug, updates, { updatedAt: new Date() });
    return of(drug).pipe(delay(500));
  }

  deactivate(id: string): Observable<boolean> {
    return this.update(id, { isActive: false }).pipe(
      delay(500),
      map(() => true)
    );
  }
}

