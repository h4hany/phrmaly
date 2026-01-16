import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Permission, Role, ResourceType, PermissionAction } from '../models/permission.model';
import { PharmacyContextService } from '../services/pharmacy-context.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionEngineService {
  private pharmacyContextService = inject(PharmacyContextService);

  private roles: Role[] = [
    {
      id: 'role1',
      pharmacyId: 'ph1',
      name: 'Pharmacist',
      description: 'Full access to all operations',
      permissions: [],
      isSystemRole: true,
      createdAt: new Date(),
      createdBy: 'system'
    },
    {
      id: 'role2',
      pharmacyId: 'ph1',
      name: 'Cashier',
      description: 'Sales and payment operations',
      permissions: [],
      isSystemRole: false,
      createdAt: new Date(),
      createdBy: 'admin'
    }
  ];

  getRoles(): Observable<Role[]> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of([]).pipe(delay(300));
    }

    const filtered = this.roles.filter(r => r.pharmacyId === pharmacyId);
    return of(filtered).pipe(delay(300));
  }

  hasPermission(resource: ResourceType, action: PermissionAction): Observable<boolean> {
    // Mock implementation - in real app, check user's role permissions
    return of(true).pipe(delay(100));
  }

  getPermissionsForRole(roleId: string): Observable<Permission[]> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of([]).pipe(delay(300));
    }

    const role = this.roles.find(r => r.id === roleId && r.pharmacyId === pharmacyId);
    return of(role?.permissions || []).pipe(delay(300));
  }
}

