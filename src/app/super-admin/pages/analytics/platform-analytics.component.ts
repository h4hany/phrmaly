/**
 * Platform Analytics Component
 * 
 * Classification: NEW PAGE
 * 
 * Business Purpose: Understand how Pharmly is being used
 */

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatformAnalyticsService } from '../../../core/services/platform-analytics.service';
import { FeatureUsage } from '../../../core/models/platform.model';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { ChartComponent } from '../../../shared/components/chart/chart.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-platform-analytics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatCardComponent,
    ChartComponent,
    TranslatePipe,
    TableComponent,
    ButtonComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-[var(--text-primary)]">{{ 'platform.analytics.title' | translate }}</h1>
        <p class="text-sm text-[var(--card-text)] mt-1">{{ 'platform.analytics.subtitle' | translate }}</p>
      </div>

      <!-- Date Range Filter -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.analytics.startDate' | translate }}</label>
            <input
              type="date"
              [(ngModel)]="startDate"
              class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.analytics.endDate' | translate }}</label>
            <input
              type="date"
              [(ngModel)]="endDate"
              class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
            />
          </div>
          <div class="flex items-end">
            <app-button variant="primary" size="sm" (onClick)="loadData()">
              {{ 'common.search' | translate }}
            </app-button>
          </div>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <app-stat-card
          [label]="'platform.analytics.totalAccounts'"
          [value]="metrics?.totalAccounts || 0"
          [icon]="'users'"
        />
        <app-stat-card
          [label]="'platform.analytics.activePharmacies'"
          [value]="metrics?.activePharmacies || 0"
          [icon]="'package'"
        />
        <app-stat-card
          [label]="'platform.analytics.monthlyRevenue'"
          [value]="formatCurrency(metrics?.monthlyRevenue || 0)"
          [icon]="'chart'"
        />
        <app-stat-card
          [label]="'platform.analytics.openTickets'"
          [value]="metrics?.openTickets || 0"
          [icon]="'alert'"
        />
      </div>

      <!-- Charts Row 1 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
          <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'platform.analytics.signupsOverTime' | translate }}</h3>
          <app-chart [type]="'line'" [data]="signupsData" [options]="chartOptions" />
        </div>
        <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
          <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'platform.analytics.activePharmaciesOverTime' | translate }}</h3>
          <app-chart [type]="'line'" [data]="activePharmaciesData" [options]="chartOptions" />
        </div>
      </div>

      <!-- Charts Row 2 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
          <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'platform.analytics.subscriptionDistribution' | translate }}</h3>
          <app-chart [type]="'pie'" [data]="subscriptionDistributionData" [options]="chartOptions" />
        </div>
        <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
          <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'platform.analytics.featureUsage' | translate }}</h3>
          <app-chart [type]="'bar'" [data]="featureUsageData" [options]="chartOptions" />
        </div>
      </div>

      <!-- Feature Usage Table -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
        <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'platform.analytics.featureAdoption' | translate }}</h3>
        <app-table
          [columns]="usageColumns"
          [data]="featureUsageTable"
          [loading]="loading"
          [emptyMessage]="'platform.analytics.noData' | translate"
        />
      </div>
    </div>
  `,
  styles: []
})
export class PlatformAnalyticsComponent implements OnInit {
  private analyticsService = inject(PlatformAnalyticsService);
  private translationService = inject(TranslationService);

  loading = false;
  metrics: any = null;

  startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  endDate = new Date().toISOString().split('T')[0];

  signupsData: any = {};
  activePharmaciesData: any = {};
  subscriptionDistributionData: any = {};
  featureUsageData: any = {};
  chartOptions: any = {};

  featureUsageTable: any[] = [];
  usageColumns: TableColumn[] = [
    { key: 'module', label: 'platform.analytics.module', sortable: true },
    { key: 'accountCount', label: 'platform.analytics.accounts', sortable: true },
    { key: 'pharmacyCount', label: 'platform.analytics.pharmacies', sortable: true },
    { key: 'usagePercentage', label: 'platform.analytics.usage', sortable: true },
    { key: 'trend', label: 'platform.analytics.trend', sortable: true }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    this.analyticsService.getMetrics(start, end).subscribe({
      next: (metrics) => {
        this.metrics = metrics;
        this.loadCharts(start, end);
        this.loadFeatureUsage();
        this.loading = false;
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

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false
    };
  }

  loadFeatureUsage(): void {
    this.analyticsService.getFeatureUsage().subscribe({
      next: (usage) => {
        this.featureUsageTable = usage.map(u => ({
          ...u,
          module: this.translationService.translate(this.getModuleLabel(u.module)),
          usagePercentage: u.usagePercentage + '%',
          trend: this.translationService.translate(this.getTrendLabel(u.trend))
        }));

        this.featureUsageData = {
          labels: usage.map(u => this.translationService.translate(this.getModuleLabel(u.module))),
          datasets: [{
            label: 'Usage %',
            data: usage.map(u => u.usagePercentage),
            backgroundColor: 'rgba(22, 101, 52, 0.8)'
          }]
        };
      }
    });
  }

  getModuleLabel(module: string): string {
    const labels: { [key: string]: string } = {
      inventory: 'platform.modules.inventory',
      hr: 'platform.modules.hr',
      finance: 'platform.modules.finance',
      automation: 'platform.modules.automation',
      loyalty: 'platform.modules.loyalty',
      api_access: 'platform.modules.api_access',
      ai_features: 'platform.modules.ai_features',
      analytics: 'platform.modules.analytics'
    };
    return labels[module] || module;
  }

  getTrendLabel(trend: string): string {
    const labels: { [key: string]: string } = {
      up: 'platform.analytics.trendUp',
      down: 'platform.analytics.trendDown',
      stable: 'platform.analytics.trendStable'
    };
    return labels[trend] || trend;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  }
}
