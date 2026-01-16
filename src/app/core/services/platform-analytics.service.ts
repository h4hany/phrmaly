import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { PlatformMetrics, FeatureUsage } from '../models/platform.model';
import { PlatformAccountsService } from './platform-accounts.service';
import { PlatformSubscriptionsService } from './platform-subscriptions.service';
import { PlatformTicketsService } from './platform-tickets.service';

@Injectable({
  providedIn: 'root'
})
export class PlatformAnalyticsService {
  constructor(
    private accountsService: PlatformAccountsService,
    private subscriptionsService: PlatformSubscriptionsService,
    private ticketsService: PlatformTicketsService
  ) {}

  getMetrics(startDate: Date, endDate: Date): Observable<PlatformMetrics> {
    // Mock platform metrics
    const metrics: PlatformMetrics = {
      totalAccounts: 150,
      activeAccounts: 140,
      totalPharmacies: 480,
      activePharmacies: 465,
      totalSubscriptions: 140,
      activeSubscriptions: 135,
      monthlyRevenue: 32860,
      openTickets: 12,
      systemStatus: 'healthy',
      period: { startDate, endDate }
    };
    return of(metrics).pipe(delay(500));
  }

  getFeatureUsage(): Observable<FeatureUsage[]> {
    // Mock feature usage data
    const usage: FeatureUsage[] = [
      {
        module: 'inventory',
        accountCount: 150,
        pharmacyCount: 450,
        usagePercentage: 95,
        trend: 'up'
      },
      {
        module: 'hr',
        accountCount: 80,
        pharmacyCount: 200,
        usagePercentage: 50,
        trend: 'up'
      },
      {
        module: 'finance',
        accountCount: 140,
        pharmacyCount: 420,
        usagePercentage: 90,
        trend: 'stable'
      },
      {
        module: 'automation',
        accountCount: 60,
        pharmacyCount: 150,
        usagePercentage: 40,
        trend: 'up'
      },
      {
        module: 'loyalty',
        accountCount: 30,
        pharmacyCount: 75,
        usagePercentage: 20,
        trend: 'stable'
      },
      {
        module: 'api_access',
        accountCount: 25,
        pharmacyCount: 60,
        usagePercentage: 15,
        trend: 'up'
      }
    ];
    return of(usage).pipe(delay(500));
  }

  getSignupsOverTime(startDate: Date, endDate: Date): Observable<Array<{ date: Date; count: number }>> {
    // Mock signup data
    const signups = [
      { date: new Date('2024-11-01'), count: 5 },
      { date: new Date('2024-11-08'), count: 8 },
      { date: new Date('2024-11-15'), count: 12 },
      { date: new Date('2024-11-22'), count: 15 },
      { date: new Date('2024-11-27'), count: 18 }
    ];
    return of(signups).pipe(delay(500));
  }

  getActivePharmaciesOverTime(startDate: Date, endDate: Date): Observable<Array<{ date: Date; count: number }>> {
    // Mock active pharmacies data
    const active = [
      { date: new Date('2024-11-01'), count: 420 },
      { date: new Date('2024-11-08'), count: 435 },
      { date: new Date('2024-11-15'), count: 450 },
      { date: new Date('2024-11-22'), count: 465 },
      { date: new Date('2024-11-27'), count: 480 }
    ];
    return of(active).pipe(delay(500));
  }

  getSubscriptionDistribution(): Observable<Array<{ plan: string; count: number; revenue: number }>> {
    // Mock subscription distribution
    const distribution = [
      { plan: 'Starter', count: 80, revenue: 7920 },
      { plan: 'Professional', count: 50, revenue: 14950 },
      { plan: 'Enterprise', count: 10, revenue: 9990 }
    ];
    return of(distribution).pipe(delay(500));
  }

  getMonthlyRevenue(startDate: Date, endDate: Date): Observable<number> {
    // Mock MRR calculation
    return of(32860).pipe(delay(300));
  }
}

