import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Pharmacy } from '../models/user.model';
import { AuthService } from './auth.service';

export const ALL_PHARMACIES_ID = 'all';

@Injectable({
  providedIn: 'root'
})
export class PharmacyContextService {
  private authService = inject(AuthService);
  private currentPharmacySubject = new BehaviorSubject<Pharmacy | null>(null);
  public currentPharmacy$ = this.currentPharmacySubject.asObservable();
  private isAllPharmaciesSubject = new BehaviorSubject<boolean>(false);
  public isAllPharmacies$ = this.isAllPharmaciesSubject.asObservable();

  constructor() {
    // Initialize with user's pharmacy
    const user = this.authService.getCurrentUser();
    if (user) {
      if (user.role === 'account_owner' && user.pharmacies && user.pharmacies.length > 0) {
        const savedPharmacyId = localStorage.getItem('currentPharmacyId');
        if (savedPharmacyId === ALL_PHARMACIES_ID) {
          // Set to "All" mode
          this.setAllPharmacies();
        } else {
          const pharmacy = savedPharmacyId
            ? user.pharmacies.find(p => p.id === savedPharmacyId)
            : user.pharmacies[0];
          if (pharmacy) {
            this.setCurrentPharmacy(pharmacy);
          }
        }
      } else if (user.pharmacyId) {
        // Staff/Manager - locked to one pharmacy
        const pharmacy: Pharmacy = {
          id: user.pharmacyId,
          name: 'Main Pharmacy',
          primaryColor: '#166534',
          secondaryColor: '#22c55e',
          sidebarColor: '#14532d'
        };
        this.setCurrentPharmacy(pharmacy);
      }
    }
  }

  setCurrentPharmacy(pharmacy: Pharmacy): void {
    localStorage.setItem('currentPharmacyId', pharmacy.id);
    this.currentPharmacySubject.next(pharmacy);
    this.isAllPharmaciesSubject.next(false);
  }

  setAllPharmacies(): void {
    localStorage.setItem('currentPharmacyId', ALL_PHARMACIES_ID);
    this.currentPharmacySubject.next(null);
    this.isAllPharmaciesSubject.next(true);
  }

  getCurrentPharmacy(): Pharmacy | null {
    return this.currentPharmacySubject.value;
  }

  getCurrentPharmacyId(): string | null {
    if (this.isAllPharmaciesSubject.value) {
      return null; // null means "all pharmacies"
    }
    return this.currentPharmacySubject.value?.id || null;
  }

  isAllPharmaciesSelected(): boolean {
    return this.isAllPharmaciesSubject.value;
  }

  canSwitchPharmacies(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'account_owner' && (user.pharmacies?.length || 0) > 1;
  }

  getAvailablePharmacies(): Pharmacy[] {
    const user = this.authService.getCurrentUser();
    return user?.pharmacies || [];
  }
}











