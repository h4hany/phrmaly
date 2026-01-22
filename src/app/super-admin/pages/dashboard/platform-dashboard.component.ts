/**
 * Global Platform Dashboard Component
 * 
 * Classification: NEW PAGE
 * 
 * Business Purpose: Give Super Admin a real-time health and growth view of the entire SaaS platform
 */

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformAnalyticsService } from '../../../core/services/platform-analytics.service';
import { PlatformMetrics } from '../../../core/models/platform.model';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { ChartComponent } from '../../../shared/components/chart/chart.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-platform-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent, ChartComponent, TranslatePipe, AlertComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-[var(--text-primary)]">{{ 'platform.dashboard.title' | translate }}</h1>
        <p class="text-sm text-[var(--card-text)] mt-1">{{ 'platform.dashboard.subtitle' | translate }}</p>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-stat-card
          [label]="'platform.dashboard.totalAccounts'"
          [value]="metrics?.totalAccounts || 0"
          [icon]="'users'"
        />
        <app-stat-card
          [label]="'platform.dashboard.totalPharmacies'"
          [value]="metrics?.totalPharmacies || 0"
          [icon]="'package'"
        />
        <app-stat-card
          [label]="'platform.dashboard.activeSubscriptions'"
          [value]="metrics?.activeSubscriptions || 0"
          [icon]="'credit-card'"
        />
        <app-stat-card
          [label]="'platform.dashboard.monthlyRevenue'"
          [value]="formatCurrency(metrics?.monthlyRevenue || 0)"
          [icon]="'chart'"
        />
      </div>

      <!-- System Status Alert -->
      @if (metrics?.systemStatus !== 'healthy') {
        <app-alert
          [type]="metrics?.systemStatus === 'down' ? 'error' : 'warning'"
          [title]="getSystemStatusTitle()"
        >
          {{ getSystemStatusDescription() }}
        </app-alert>
      }

      <!-- Charts Row 1 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
          <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'platform.dashboard.signupsOverTime' | translate }}</h3>
          <app-chart [type]="'line'" [data]="signupsData" [options]="chartOptions" />
        </div>
        <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
          <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'platform.dashboard.activePharmacies' | translate }}</h3>
          <app-chart [type]="'line'" [data]="activePharmaciesData" [options]="chartOptions" />
        </div>
      </div>

      <!-- Charts Row 2 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
          <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'platform.dashboard.subscriptionDistribution' | translate }}</h3>
          <app-chart [type]="'pie'" [data]="subscriptionDistributionData" [options]="chartOptions" />
        </div>
        <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
          <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'platform.dashboard.featureUsage' | translate }}</h3>
          <app-chart [type]="'bar'" [data]="featureUsageData" [options]="chartOptions" />
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PlatformDashboardComponent implements OnInit {
  private analyticsService = inject(PlatformAnalyticsService);
  private translationService = inject(TranslationService);

  metrics: PlatformMetrics | null = null;
  loading = false;

  signupsData: any = {};
  activePharmaciesData: any = {};
  subscriptionDistributionData: any = {};
  featureUsageData: any = {};
  chartOptions: any = {};

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    this.analyticsService.getMetrics(startDate, endDate).subscribe({
      next: (metrics) => {
        this.metrics = metrics;
        this.loading = false;
        this.loadCharts(startDate, endDate);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadCharts(startDate: Date, endDate: Date): void {
    // Signups over time
    this.analyticsService.getSignupsOverTime(startDate, endDate).subscribe({
      next: (data) => {
        this.signupsData = {
          labels: data.map(d => d.date.toLocaleDateString()),
          datasets: [{
            label: 'Signups',
            data: data.map(d => d.count),
            borderColor: 'rgba(22, 101, 52, 1)',
            backgroundColor: 'rgba(22, 101, 52, 0.1)',
            fill: true
          }]
        };
      }
    });

    // Active pharmacies
    this.analyticsService.getActivePharmaciesOverTime(startDate, endDate).subscribe({
      next: (data) => {
        this.activePharmaciesData = {
          labels: data.map(d => d.date.toLocaleDateString()),
          datasets: [{
            label: 'Active Pharmacies',
            data: data.map(d => d.count),
            borderColor: 'rgba(59, 130, 246, 1)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true
          }]
        };
      }
    });

    // Subscription distribution
    this.analyticsService.getSubscriptionDistribution().subscribe({
      next: (data) => {
        this.subscriptionDistributionData = {
          labels: data.map(d => d.plan),
          datasets: [{
            data: data.map(d => d.count),
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(22, 101, 52, 0.8)',
              'rgba(245, 158, 11, 0.8)'
            ]
          }]
        };
      }
    });

    // Feature usage
    this.analyticsService.getFeatureUsage().subscribe({
      next: (data) => {
        this.featureUsageData = {
          labels: data.map(d => d.module),
          datasets: [{
            label: 'Usage %',
            data: data.map(d => d.usagePercentage),
            backgroundColor: 'rgba(22, 101, 52, 0.8)'
          }]
        };
      }
    });

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false
    };
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getSystemStatusTitle(): string {
    if (!this.metrics?.systemStatus) return '';
    const status = this.metrics.systemStatus;
    const key = `platform.dashboard.systemStatus${status}`;
    return this.translationService.translate(key);
  }

  getSystemStatusDescription(): string {
    if (!this.metrics?.systemStatus) return '';
    const status = this.metrics.systemStatus;
    const key = `platform.dashboard.systemStatus${status}Desc`;
    return this.translationService.translate(key);
  }
}

