import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { GeneralDrug, PharmacyDrug, InventoryCostingMethod } from '../models/drug.model';
import { PaginatedResponse, PaginationParams } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class DrugsService {
  private generalDrugs: GeneralDrug[] = [
    {
      id: 'DRG001',
      name: 'Paracetamol 500mg',
      description: 'Pain reliever and fever reducer',
      manufacturer: 'ABC Pharmaceuticals',
      internationalBarcode: '1234567890123'
    },
    {
      id: 'DRG002',
      name: 'Ibuprofen 200mg',
      description: 'Nonsteroidal anti-inflammatory drug',
      manufacturer: 'MedTech Industries',
      internationalBarcode: '1234567890124'
    },
    {
      id: 'DRG003',
      name: 'Amoxicillin 250mg',
      description: 'Antibiotic',
      manufacturer: 'ABC Pharmaceuticals',
      internationalBarcode: '1234567890125'
    }
  ];

  private pharmacyDrugs: PharmacyDrug[] = [
    {
      id: 'PDRG001',
      generalDrugId: 'DRG001',
      pharmacyId: 'ph1',
      internalBarcode: '123456',
      price: 5.50,
      priceAfterDiscount: 5.00,
      stockQuantity: 150,
      minimumStock: 50,
      expiryDate: new Date('2025-12-31'),
      status: 'active',
      costLayers: [
        { quantity: 150, unitCost: 3.50, purchaseDate: new Date('2024-01-15'), expiryDate: new Date('2025-12-31') }
      ],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-11-27')
    },
    {
      id: 'PDRG002',
      generalDrugId: 'DRG002',
      pharmacyId: 'ph1',
      internalBarcode: '123457',
      price: 8.00,
      priceAfterDiscount: 7.50,
      stockQuantity: 100,
      minimumStock: 30,
      expiryDate: new Date('2025-11-30'),
      status: 'active',
      costLayers: [
        { quantity: 100, unitCost: 5.00, purchaseDate: new Date('2024-02-10'), expiryDate: new Date('2025-11-30') }
      ],
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-11-26')
    },
    {
      id: 'PDRG003',
      generalDrugId: 'DRG003',
      pharmacyId: 'ph1',
      internalBarcode: '123458',
      price: 12.00,
      priceAfterDiscount: 11.50,
      stockQuantity: 25,
      minimumStock: 50,
      expiryDate: new Date('2025-06-30'),
      status: 'active',
      costLayers: [
        { quantity: 50, unitCost: 8.00, purchaseDate: new Date('2024-03-15'), expiryDate: new Date('2025-06-30') }
      ],
      createdAt: new Date('2024-03-15'),
      updatedAt: new Date('2024-11-25')
    },
    {
      id: 'PDRG004',
      generalDrugId: 'DRG001',
      pharmacyId: 'ph1',
      internalBarcode: '123459',
      price: 6.00,
      priceAfterDiscount: 5.50,
      stockQuantity: 15,
      minimumStock: 40,
      expiryDate: new Date('2025-01-15'),
      status: 'active',
      costLayers: [
        { quantity: 40, unitCost: 4.00, purchaseDate: new Date('2024-04-20'), expiryDate: new Date('2025-01-15') }
      ],
      createdAt: new Date('2024-04-20'),
      updatedAt: new Date('2024-11-24')
    },
    {
      id: 'PDRG005',
      generalDrugId: 'DRG002',
      pharmacyId: 'ph1',
      internalBarcode: '123460',
      price: 9.00,
      priceAfterDiscount: 8.50,
      stockQuantity: 200,
      minimumStock: 50,
      expiryDate: new Date('2026-01-24'),
      status: 'active',
      costLayers: [
        { quantity: 200, unitCost: 6.00, purchaseDate: new Date('2024-05-10'), expiryDate: new Date('2026-01-24') }
      ],
      createdAt: new Date('2024-05-10'),
      updatedAt: new Date('2024-11-23')
    },
    {
      id: 'PDRG006',
      generalDrugId: 'DRG003',
      pharmacyId: 'ph1',
      internalBarcode: '123461',
      price: 15.00,
      priceAfterDiscount: 14.00,
      stockQuantity: 8,
      minimumStock: 30,
      expiryDate: new Date('2026-01-17'),
      status: 'active',
      costLayers: [
        { quantity: 30, unitCost: 10.00, purchaseDate: new Date('2024-06-01'), expiryDate: new Date('2026-01-17') }
      ],
      createdAt: new Date('2024-06-01'),
      updatedAt: new Date('2024-11-22')
    },
    {
      id: 'PDRG007',
      generalDrugId: 'DRG001',
      pharmacyId: 'ph1',
      internalBarcode: '123462',
      price: 5.75,
      priceAfterDiscount: 5.25,
      stockQuantity: 45,
      minimumStock: 60,
      expiryDate: new Date('2025-03-15'),
      status: 'active',
      costLayers: [
        { quantity: 60, unitCost: 3.75, purchaseDate: new Date('2024-07-15'), expiryDate: new Date('2025-03-15') }
      ],
      createdAt: new Date('2024-07-15'),
      updatedAt: new Date('2024-11-21')
    }
  ];

  // General Drugs
  getAllGeneralDrugs(): Observable<GeneralDrug[]> {
    return of([...this.generalDrugs]).pipe(delay(300));
  }

  getGeneralDrugById(id: string): Observable<GeneralDrug | null> {
    const drug = this.generalDrugs.find(d => d.id === id);
    return of(drug || null).pipe(delay(200));
  }

  // Pharmacy Drugs
  getPharmacyDrugs(params?: PaginationParams): Observable<PaginatedResponse<PharmacyDrug>> {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const filtered = [...this.pharmacyDrugs];
    const paginated = filtered.slice(start, end);
    
    // Map drugs to include generalDrug information
    const mapped = paginated.map(drug => {
      const generalDrug = this.generalDrugs.find(gd => gd.id === drug.generalDrugId);
      return { ...drug, generalDrug: generalDrug || undefined };
    });

    return of({
      data: mapped,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize)
    }).pipe(delay(500));
  }

  getPharmacyDrugById(id: string): Observable<PharmacyDrug | null> {
    const drug = this.pharmacyDrugs.find(d => d.id === id);
    if (drug) {
      const generalDrug = this.generalDrugs.find(gd => gd.id === drug.generalDrugId);
      return of({ ...drug, generalDrug: generalDrug || undefined }).pipe(delay(300));
    }
    return of(null).pipe(delay(300));
  }

  getPharmacyDrugByBarcode(barcode: string): Observable<PharmacyDrug | null> {
    const drug = this.pharmacyDrugs.find(d => d.internalBarcode === barcode);
    if (drug) {
      const generalDrug = this.generalDrugs.find(gd => gd.id === drug.generalDrugId);
      return of({ ...drug, generalDrug: generalDrug || undefined }).pipe(delay(300));
    }
    return of(null).pipe(delay(300));
  }

  createPharmacyDrug(drug: Omit<PharmacyDrug, 'id' | 'createdAt' | 'updatedAt' | 'costLayers'> & { costLayers?: any[] }): Observable<PharmacyDrug> {
    const newDrug: PharmacyDrug = {
      ...drug,
      id: `PDRG${String(this.pharmacyDrugs.length + 1).padStart(3, '0')}`,
      costLayers: drug.costLayers || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.pharmacyDrugs.push(newDrug);
    return of(newDrug).pipe(delay(500));
  }

  updatePharmacyDrug(id: string, drug: Partial<PharmacyDrug>): Observable<PharmacyDrug> {
    const index = this.pharmacyDrugs.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error('Pharmacy drug not found');
    }
    this.pharmacyDrugs[index] = {
      ...this.pharmacyDrugs[index],
      ...drug,
      id,
      updatedAt: new Date()
    };
    return of(this.pharmacyDrugs[index]).pipe(delay(500));
  }

  deletePharmacyDrug(id: string): Observable<boolean> {
    const index = this.pharmacyDrugs.findIndex(d => d.id === id);
    if (index === -1) {
      return of(false).pipe(delay(300));
    }
    this.pharmacyDrugs.splice(index, 1);
    return of(true).pipe(delay(500));
  }

  searchPharmacyDrugs(query: string): Observable<PharmacyDrug[]> {
    const lowerQuery = query.toLowerCase();
    const filtered = this.pharmacyDrugs.filter(d => {
      const generalDrug = this.generalDrugs.find(gd => gd.id === d.generalDrugId);
      return d.internalBarcode.includes(query) ||
        generalDrug?.name.toLowerCase().includes(lowerQuery) ||
        generalDrug?.internationalBarcode.includes(query);
    });
    
    // Map drugs to include generalDrug information
    const mapped = filtered.map(drug => {
      const generalDrug = this.generalDrugs.find(gd => gd.id === drug.generalDrugId);
      return { ...drug, generalDrug: generalDrug || undefined };
    });
    
    return of(mapped).pipe(delay(300));
  }

  getLowStockDrugs(minimumThreshold?: number): Observable<PharmacyDrug[]> {
    const filtered = this.pharmacyDrugs.filter(d => d.stockQuantity <= (minimumThreshold || d.minimumStock));
    const mapped = filtered.map(drug => {
      const generalDrug = this.generalDrugs.find(gd => gd.id === drug.generalDrugId);
      return { ...drug, generalDrug: generalDrug || undefined };
    });
    return of(mapped).pipe(delay(300));
  }

  getExpiringDrugs(days: number = 30): Observable<PharmacyDrug[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + days);
    const filtered = this.pharmacyDrugs.filter(d =>
      d.expiryDate && d.expiryDate <= thresholdDate && d.expiryDate >= new Date()
    );
    const mapped = filtered.map(drug => {
      const generalDrug = this.generalDrugs.find(gd => gd.id === drug.generalDrugId);
      return { ...drug, generalDrug: generalDrug || undefined };
    });
    return of(mapped).pipe(delay(300));
  }
}



