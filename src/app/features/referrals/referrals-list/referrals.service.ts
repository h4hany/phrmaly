import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Doctor, Referral } from '../../../core/models/referral.model';
import { PharmacyContextService } from '../../../core/services/pharmacy-context.service';

@Injectable({
  providedIn: 'root'
})
export class ReferralsService {
  private pharmacyContextService = inject(PharmacyContextService);

  private referrals: Referral[] = [
    {
      id: 'REF001',
      pharmacyId: 'ph1',
      doctorId: 'DOC001',
      doctorName: 'Dr. Ahmed Ali',
      patientId: 'PAT001',
      patientName: 'John Doe',
      revenue: 150.00,
      referralDate: new Date('2024-11-25'),
      createdAt: new Date('2024-11-25'),
      createdBy: 'staff1'
    },
    {
      id: 'REF002',
      pharmacyId: 'ph1',
      doctorId: 'DOC002',
      doctorName: 'Dr. Sarah Mohamed',
      patientId: 'PAT002',
      patientName: 'Jane Smith',
      revenue: 85.50,
      referralDate: new Date('2024-11-24'),
      createdAt: new Date('2024-11-24'),
      createdBy: 'staff1'
    }
  ];

  private doctors: Doctor[] = [
    {
      id: 'DOC001',
      pharmacyId: 'ph1',
      name: 'Dr. Ahmed Ali',
      specialty: 'Cardiology',
      totalReferrals: 45,
      totalRevenue: 6750.00,
      lastReferralDate: new Date('2024-11-25'),
      createdAt: new Date('2024-01-01'),
      createdBy: 'admin'
    },
    {
      id: 'DOC002',
      pharmacyId: 'ph1',
      name: 'Dr. Sarah Mohamed',
      specialty: 'Pediatrics',
      totalReferrals: 32,
      totalRevenue: 2736.00,
      lastReferralDate: new Date('2024-11-24'),
      createdAt: new Date('2024-01-01'),
      createdBy: 'admin'
    }
  ];

  getReferrals(): Observable<Referral[]> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of([]).pipe(delay(300));
    }
    const filtered = this.referrals.filter(r => r.pharmacyId === pharmacyId);
    return of(filtered).pipe(delay(500));
  }

  getDoctors(): Observable<Doctor[]> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of([]).pipe(delay(300));
    }
    const filtered = this.doctors.filter(d => d.pharmacyId === pharmacyId);
    return of(filtered).pipe(delay(500));
  }

  getReferralById(id: string): Observable<Referral | null> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of(null).pipe(delay(300));
    }
    const referral = this.referrals.find(r => r.id === id && r.pharmacyId === pharmacyId);
    return of(referral || null).pipe(delay(300));
  }
}



