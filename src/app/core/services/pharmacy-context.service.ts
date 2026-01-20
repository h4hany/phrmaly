import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Pharmacy } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PharmacyContextService {
  private authService = inject(AuthService);
  private currentPharmacySubject = new BehaviorSubject<Pharmacy | null>(null);
  public currentPharmacy$ = this.currentPharmacySubject.asObservable();

  constructor() {
    // Initialize with user's pharmacy
    const user = this.authService.getCurrentUser();
    if (user) {
      if (user.role === 'account_owner' && user.pharmacies && user.pharmacies.length > 0) {
        const savedPharmacyId = localStorage.getItem('currentPharmacyId');
        const pharmacy = savedPharmacyId
          ? user.pharmacies.find(p => p.id === savedPharmacyId)
          : user.pharmacies[0];
        if (pharmacy) {
          this.setCurrentPharmacy(pharmacy);
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
  }

  getCurrentPharmacy(): Pharmacy | null {
    return this.currentPharmacySubject.value;
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









