import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { PharmacyContextService } from '../services/pharmacy-context.service';
import { TimelineEvent } from '../../shared/components/timeline/timeline.component';

export interface LoyaltyWallet {
  patientId: string;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalSpent: number;
  nextTierPoints?: number;
}

export interface RefillReminder {
  id: string;
  patientId: string;
  drugId: string;
  drugName: string;
  lastFilledDate: Date;
  nextRefillDate: Date;
  daysUntilRefill: number;
  status: 'upcoming' | 'due' | 'overdue';
}

@Injectable({
  providedIn: 'root'
})
export class PatientEngagementEngineService {
  private pharmacyContextService = inject(PharmacyContextService);

  getPatientTimeline(patientId: string): Observable<TimelineEvent[]> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of([]).pipe(delay(300));
    }

    const events: TimelineEvent[] = [
      {
        id: '1',
        title: 'Prescription Filled',
        description: 'Paracetamol 500mg - 2 boxes',
        timestamp: new Date('2024-11-25'),
        type: 'success',
        metadata: { invoice: 'INV-001', amount: '15.00' }
      },
      {
        id: '2',
        title: 'Refill Reminder Sent',
        description: 'Amoxicillin 250mg refill due in 5 days',
        timestamp: new Date('2024-11-20'),
        type: 'info',
        metadata: { drug: 'Amoxicillin 250mg' }
      },
      {
        id: '3',
        title: 'Loyalty Points Earned',
        description: '+150 points for purchase',
        timestamp: new Date('2024-11-25'),
        type: 'success',
        metadata: { points: '150' }
      }
    ];

    return of(events).pipe(delay(300));
  }

  getLoyaltyWallet(patientId: string): Observable<LoyaltyWallet | null> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of(null).pipe(delay(300));
    }

    const wallet: LoyaltyWallet = {
      patientId,
      points: 1250,
      tier: 'gold',
      totalSpent: 2450,
      nextTierPoints: 250
    };

    return of(wallet).pipe(delay(300));
  }

  getRefillReminders(patientId: string): Observable<RefillReminder[]> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of([]).pipe(delay(300));
    }

    const reminders: RefillReminder[] = [
      {
        id: '1',
        patientId,
        drugId: 'PDRG001',
        drugName: 'Paracetamol 500mg',
        lastFilledDate: new Date('2024-11-01'),
        nextRefillDate: new Date('2024-12-01'),
        daysUntilRefill: 4,
        status: 'upcoming'
      },
      {
        id: '2',
        patientId,
        drugId: 'PDRG003',
        drugName: 'Amoxicillin 250mg',
        lastFilledDate: new Date('2024-11-15'),
        nextRefillDate: new Date('2024-11-29'),
        daysUntilRefill: -2,
        status: 'overdue'
      }
    ];

    return of(reminders).pipe(delay(300));
  }
}

