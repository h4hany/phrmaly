import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { AutomationRule, AutomationEvent, AutomationStatus } from '../models/automation.model';
import { PaginatedResponse, PaginationParams } from '../models/common.model';
import { PharmacyContextService } from '../services/pharmacy-context.service';
import { EventBusService } from './event-bus.service';

@Injectable({
  providedIn: 'root'
})
export class AutomationEngineService {
  private pharmacyContextService = inject(PharmacyContextService);
  private eventBus = inject(EventBusService);

  private rules: AutomationRule[] = [
    {
      id: 'AUT001',
      pharmacyId: 'ph1',
      name: 'Auto Reorder Low Stock',
      description: 'Automatically create purchase order when stock falls below minimum',
      trigger: 'stock_low',
      triggerConditions: { threshold: 'minimum' },
      action: 'reorder',
      actionConfig: { supplierId: 'supplier1' },
      status: 'active',
      priority: 1,
      enabled: true,
      executionCount: 12,
      createdAt: new Date('2024-10-01'),
      updatedAt: new Date('2024-11-20'),
      createdBy: 'admin'
    }
  ];

  getRules(params?: PaginationParams): Observable<PaginatedResponse<AutomationRule>> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of({ data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }).pipe(delay(300));
    }

    const filtered = this.rules.filter(r => r.pharmacyId === pharmacyId);
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

  createRule(rule: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt' | 'pharmacyId' | 'executionCount'>): Observable<AutomationRule> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      throw new Error('No pharmacy context');
    }

    const newRule: AutomationRule = {
      ...rule,
      id: `AUT${String(this.rules.length + 1).padStart(3, '0')}`,
      pharmacyId,
      executionCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.rules.push(newRule);

    this.eventBus.emit({
      type: 'automation_rule_created',
      payload: newRule,
      source: 'automation-engine'
    });

    return of(newRule).pipe(delay(500));
  }

  updateRule(id: string, updates: Partial<AutomationRule>): Observable<AutomationRule> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      throw new Error('No pharmacy context');
    }

    const index = this.rules.findIndex(r => r.id === id && r.pharmacyId === pharmacyId);
    if (index === -1) {
      throw new Error('Rule not found');
    }

    this.rules[index] = {
      ...this.rules[index],
      ...updates,
      updatedAt: new Date()
    };

    return of(this.rules[index]).pipe(delay(500));
  }

  toggleRule(id: string, enabled: boolean): Observable<AutomationRule> {
    return this.updateRule(id, { enabled });
  }
}





