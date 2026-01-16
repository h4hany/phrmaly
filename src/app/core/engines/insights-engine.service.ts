import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { PharmacyContextService } from '../services/pharmacy-context.service';

export interface RiskInsight {
  type: 'inventory' | 'staff' | 'expiry' | 'supplier';
  level: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  count?: number;
  value?: number;
  actionRequired?: boolean;
}

export interface DashboardKPI {
  label: string;
  value: string | number;
  trend?: string;
  trendPositive?: boolean;
  subtitle?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InsightsEngineService {
  private pharmacyContextService = inject(PharmacyContextService);

  getKPIs(): Observable<DashboardKPI[]> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of([]).pipe(delay(300));
    }

    const kpis: DashboardKPI[] = [
      {
        label: 'dashboard.kpi.totalRevenue',
        value: '45,230',
        trend: '+12.5%',
        trendPositive: true,
        subtitle: 'dashboard.kpi.thisMonth'
      },
      {
        label: 'dashboard.kpi.activePatients',
        value: 1248,
        trend: '+8.2%',
        trendPositive: true,
        subtitle: 'dashboard.kpi.last30Days'
      },
      {
        label: 'dashboard.kpi.lowStockItems',
        value: 23,
        trend: '-5',
        trendPositive: true,
        subtitle: 'dashboard.kpi.needsAttention'
      },
      {
        label: 'dashboard.kpi.expiringSoon',
        value: 12,
        trend: '+3',
        trendPositive: false,
        subtitle: 'dashboard.kpi.next30Days'
      }
    ];

    return of(kpis).pipe(delay(500));
  }

  getRiskInsights(): Observable<RiskInsight[]> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of([]).pipe(delay(300));
    }

    const insights: RiskInsight[] = [
      {
        type: 'inventory',
        level: 'high',
        title: 'dashboard.risk.inventoryTitle',
        description: 'dashboard.risk.inventoryDesc',
        count: 23,
        actionRequired: true
      },
      {
        type: 'staff',
        level: 'medium',
        title: 'dashboard.risk.staffTitle',
        description: 'dashboard.risk.staffDesc',
        count: 2,
        actionRequired: false
      },
      {
        type: 'expiry',
        level: 'medium',
        title: 'dashboard.risk.expiryTitle',
        description: 'dashboard.risk.expiryDesc',
        value: 2450,
        actionRequired: true
      },
      {
        type: 'supplier',
        level: 'low',
        title: 'dashboard.risk.supplierTitle',
        description: 'dashboard.risk.supplierDesc',
        count: 3,
        actionRequired: true
      }
    ];

    return of(insights).pipe(delay(500));
  }

  getAttentionItems(): Observable<string[]> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of([]).pipe(delay(300));
    }

    const items = [
      'dashboard.attention.reviewMovements',
      'dashboard.attention.approveTransfer',
      'dashboard.attention.updatePricing',
      'dashboard.attention.followUpPayments'
    ];

    return of(items).pipe(delay(300));
  }
}

