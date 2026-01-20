import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { GlobalDrug } from '../models/platform.model';

export interface PublicDrug {
  id: string;
  name: string;
  genericName: string;
  description?: string;
  manufacturer?: string;
  activeIngredient?: string;
  type?: string;
  barcode?: string;
  atcCode?: string;
  therapeuticClass?: string;
  priceReference?: number;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PublicDrugService {
  private drugs: PublicDrug[] = [
    {
      id: 'GD001',
      name: 'Paracetamol 500mg',
      genericName: 'Acetaminophen',
      description: 'Pain reliever and fever reducer. Used to treat mild to moderate pain and reduce fever.',
      manufacturer: 'ABC Pharmaceuticals',
      activeIngredient: 'Paracetamol',
      type: 'Tablets',
      barcode: '1234567890123',
      atcCode: 'N02BE01',
      therapeuticClass: 'Analgesics',
      priceReference: 5.50,
      isActive: true
    },
    {
      id: 'GD002',
      name: 'Ibuprofen 200mg',
      genericName: 'Ibuprofen',
      description: 'Nonsteroidal anti-inflammatory drug (NSAID) used to reduce fever and treat pain or inflammation.',
      manufacturer: 'MedTech Industries',
      activeIngredient: 'Ibuprofen',
      type: 'Tablets',
      barcode: '1234567890124',
      atcCode: 'M01AE01',
      therapeuticClass: 'NSAIDs',
      priceReference: 8.00,
      isActive: true
    },
    {
      id: 'GD003',
      name: 'Amoxicillin 250mg',
      genericName: 'Amoxicillin',
      description: 'Antibiotic used to treat bacterial infections including pneumonia, ear infections, and urinary tract infections.',
      manufacturer: 'ABC Pharmaceuticals',
      activeIngredient: 'Amoxicillin Trihydrate',
      type: 'Capsules',
      barcode: '1234567890125',
      atcCode: 'J01CA04',
      therapeuticClass: 'Antibiotics',
      priceReference: 12.00,
      isActive: true
    },
    {
      id: 'GD004',
      name: 'Aspirin 100mg',
      genericName: 'Acetylsalicylic Acid',
      description: 'Used to reduce pain, fever, or inflammation. Also used to prevent heart attacks and strokes.',
      manufacturer: 'Bayer',
      activeIngredient: 'Acetylsalicylic Acid',
      type: 'Tablets',
      barcode: '1234567890126',
      atcCode: 'B01AC06',
      therapeuticClass: 'Antiplatelet',
      priceReference: 3.50,
      isActive: true
    },
    {
      id: 'GD005',
      name: 'Metformin 500mg',
      genericName: 'Metformin',
      description: 'Oral diabetes medicine that helps control blood sugar levels in type 2 diabetes.',
      manufacturer: 'Merck',
      activeIngredient: 'Metformin Hydrochloride',
      type: 'Tablets',
      barcode: '1234567890127',
      atcCode: 'A10BA02',
      therapeuticClass: 'Antidiabetic',
      priceReference: 8.50,
      isActive: true
    },
    {
      id: 'GD006',
      name: 'Lisinopril 10mg',
      genericName: 'Lisinopril',
      description: 'ACE inhibitor used to treat high blood pressure and heart failure.',
      manufacturer: 'AstraZeneca',
      activeIngredient: 'Lisinopril Dihydrate',
      type: 'Tablets',
      barcode: '1234567890128',
      atcCode: 'C09AA03',
      therapeuticClass: 'ACE Inhibitors',
      priceReference: 10.00,
      isActive: true
    },
    {
      id: 'GD007',
      name: 'Omeprazole 20mg',
      genericName: 'Omeprazole',
      description: 'Proton pump inhibitor that decreases stomach acid production. Used to treat GERD and ulcers.',
      manufacturer: 'GlaxoSmithKline',
      activeIngredient: 'Omeprazole Magnesium',
      type: 'Capsules',
      barcode: '1234567890129',
      atcCode: 'A02BC01',
      therapeuticClass: 'Proton Pump Inhibitors',
      priceReference: 15.00,
      isActive: true
    },
    {
      id: 'GD008',
      name: 'Atorvastatin 20mg',
      genericName: 'Atorvastatin',
      description: 'Statin medication used to prevent cardiovascular disease and treat high cholesterol.',
      manufacturer: 'Pfizer',
      activeIngredient: 'Atorvastatin Calcium',
      type: 'Tablets',
      barcode: '1234567890130',
      atcCode: 'C10AA05',
      therapeuticClass: 'Statins',
      priceReference: 18.00,
      isActive: true
    },
    {
      id: 'GD009',
      name: 'Amoxicillin Suspension 250mg/5ml',
      genericName: 'Amoxicillin',
      description: 'Liquid antibiotic for children and adults who have difficulty swallowing pills.',
      manufacturer: 'GlaxoSmithKline',
      activeIngredient: 'Amoxicillin Trihydrate',
      type: 'Liquid Suspension',
      barcode: '1234567890131',
      atcCode: 'J01CA04',
      therapeuticClass: 'Antibiotics',
      priceReference: 12.50,
      isActive: true
    },
    {
      id: 'GD010',
      name: 'Insulin Glargine 100 Units/ml',
      genericName: 'Insulin Glargine',
      description: 'Long-acting insulin for diabetes management. Provides steady insulin levels for 24 hours.',
      manufacturer: 'Sanofi',
      activeIngredient: 'Insulin Glargine',
      type: 'Injection',
      barcode: '1234567890132',
      atcCode: 'A10AE04',
      therapeuticClass: 'Insulins',
      priceReference: 65.00,
      isActive: true
    }
  ];

  getAll(params?: { search?: string; type?: string; manufacturer?: string; sortBy?: string }): Observable<PublicDrug[]> {
    let filtered = [...this.drugs].filter(d => d.isActive);

    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(search) ||
        d.genericName.toLowerCase().includes(search) ||
        d.manufacturer?.toLowerCase().includes(search) ||
        d.activeIngredient?.toLowerCase().includes(search) ||
        d.description?.toLowerCase().includes(search) ||
        d.barcode?.toLowerCase().includes(search)
      );
    }

    if (params?.type && params.type !== 'all') {
      filtered = filtered.filter(d => d.type?.toLowerCase().includes(params.type!.toLowerCase()));
    }

    if (params?.manufacturer && params.manufacturer !== 'all') {
      filtered = filtered.filter(d => d.manufacturer === params.manufacturer);
    }

    // Sort
    if (params?.sortBy) {
      const [sortBy, sortDir] = params.sortBy.split('-');
      filtered.sort((a, b) => {
        let aVal: any, bVal: any;
        
        switch(sortBy) {
          case 'name':
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
            break;
          case 'price':
            aVal = a.priceReference || 0;
            bVal = b.priceReference || 0;
            break;
          default:
            return 0;
        }

        if (sortDir === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    return of(filtered).pipe(delay(500));
  }

  getById(id: string): Observable<PublicDrug | null> {
    const drug = this.drugs.find(d => d.id === id && d.isActive);
    return of(drug || null).pipe(delay(300));
  }

  getManufacturers(): Observable<string[]> {
    const manufacturers = [...new Set(this.drugs.filter(d => d.isActive && d.manufacturer).map(d => d.manufacturer!))];
    return of(manufacturers).pipe(delay(200));
  }
}



