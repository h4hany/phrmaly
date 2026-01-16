import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { FeatureFlag } from '../models/permission.model';
import { PharmacyContextService } from '../services/pharmacy-context.service';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FeatureFlagService {
  private pharmacyContextService = inject(PharmacyContextService);
  private authService = inject(AuthService);

  private flags: FeatureFlag[] = [
    {
      id: 'FF001',
      pharmacyId: undefined,
      key: 'automation_engine',
      name: 'Automation Engine',
      description: 'Enable automation rules engine',
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    },
    {
      id: 'FF002',
      pharmacyId: 'ph1',
      key: 'advanced_analytics',
      name: 'Advanced Analytics',
      description: 'Enable advanced analytics dashboard',
      enabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin'
    }
  ];

  isEnabled(key: string): Observable<boolean> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    const user = this.authService.getCurrentUser();

    // Check pharmacy-specific flag first
    if (pharmacyId) {
      const pharmacyFlag = this.flags.find(f => f.key === key && f.pharmacyId === pharmacyId);
      if (pharmacyFlag) {
        return of(pharmacyFlag.enabled).pipe(delay(100));
      }
    }

    // Check global flag
    const globalFlag = this.flags.find(f => f.key === key && f.pharmacyId === null);
    if (globalFlag) {
      // Check role/user targeting
      if (globalFlag.targetRoles && user?.role) {
        const enabled = globalFlag.targetRoles.includes(user.role);
        return of(enabled && globalFlag.enabled).pipe(delay(100));
      }
      return of(globalFlag.enabled).pipe(delay(100));
    }

    return of(false).pipe(delay(100));
  }

  getFlags(): Observable<FeatureFlag[]> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    const filtered = this.flags.filter(f => !f.pharmacyId || f.pharmacyId === pharmacyId);
    return of(filtered).pipe(delay(300));
  }
}

