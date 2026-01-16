/**
 * Staff Performance & Risk Engine Component
 * 
 * Classification: NEW PAGE + SYSTEM EXTENSION
 * 
 * Business Purpose: Identify who grows the business and who puts it at risk
 */

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HRPerformanceService } from '../../../core/services/hr-performance.service';
import { PerformanceMetrics } from '../../../core/models/hr.model';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { RiskBadgeComponent } from '../../../shared/components/risk-badge/risk-badge.component';
import { PerformanceScoreRingComponent } from '../../../shared/components/performance-score-ring/performance-score-ring.component';
import { ChartComponent } from '../../../shared/components/chart/chart.component';
import { TabsComponent, TabComponent } from '../../../shared/components/tabs/tabs.component';

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableComponent,
    ButtonComponent,
    TranslatePipe,
    ChartComponent,
    TabsComponent,
    TabComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-[var(--text-primary)]">{{ 'hr.performance.title' | translate }}</h1>
        <div class="flex gap-3">
          <input
            type="date"
            [(ngModel)]="filters.startDate"
            class="px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
          />
          <input
            type="date"
            [(ngModel)]="filters.endDate"
            class="px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
          />
          <app-button variant="primary" size="sm" (onClick)="applyFilters()">
            {{ 'common.search' | translate }}
          </app-button>
        </div>
      </div>

      <app-tabs>
        <!-- Performance Leaderboard -->
        <app-tab [title]="'hr.performance.leaderboard' | translate" [active]="true">
          <div class="space-y-6 p-6">
            <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
              <app-table
                [columns]="performanceColumns"
                [data]="performanceLeaderboard"
                [loading]="loading"
                [emptyMessage]="'hr.performance.noData' | translate"
              />
            </div>
          </div>
        </app-tab>

        <!-- Risk Heatmap -->
        <app-tab [title]="'hr.performance.riskHeatmap' | translate" [active]="false">
          <div class="space-y-6 p-6">
            <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
              <app-table
                [columns]="riskColumns"
                [data]="riskLeaderboard"
                [loading]="loading"
                [emptyMessage]="'hr.performance.noData' | translate"
              />
            </div>
          </div>
        </app-tab>
      </app-tabs>

      <!-- Charts -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
          <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'hr.performance.riskTrend' | translate }}</h3>
          <app-chart [type]="'bar'" [data]="riskTrendData" [options]="chartOptions" />
        </div>
        <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
          <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'hr.performance.ranking' | translate }}</h3>
          <app-chart [type]="'bar'" [data]="rankingData" [options]="chartOptions" />
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PerformanceComponent implements OnInit {
  private hrPerformanceService = inject(HRPerformanceService);

  loading = false;
  performanceLeaderboard: any[] = [];
  riskLeaderboard: any[] = [];

  filters = {
    startDate: '',
    endDate: ''
  };

  performanceColumns: TableColumn[] = [
    { key: 'rank', label: 'hr.performance.rank', sortable: false },
    { key: 'staffName', label: 'hr.performance.staff', sortable: true },
    { key: 'overallScore', label: 'hr.performance.score', sortable: true },
    { key: 'performanceGrade', label: 'hr.performance.grade', sortable: true },
    { key: 'sales', label: 'hr.performance.sales', sortable: true },
    { key: 'attendance', label: 'hr.performance.attendance', sortable: true }
  ];

  riskColumns: TableColumn[] = [
    { key: 'rank', label: 'hr.performance.rank', sortable: false },
    { key: 'staffName', label: 'hr.performance.staff', sortable: true },
    { key: 'riskScore', label: 'hr.performance.riskScore', sortable: true },
    { key: 'riskLevel', label: 'hr.performance.riskLevel', sortable: true },
    { key: 'suspiciousMovements', label: 'hr.performance.suspiciousMovements', sortable: true },
    { key: 'errors', label: 'hr.performance.errors', sortable: true }
  ];

  riskTrendData: any = {};
  rankingData: any = {};
  chartOptions: any = {};

  ngOnInit(): void {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    this.filters.startDate = startDate.toISOString().split('T')[0];
    this.filters.endDate = endDate.toISOString().split('T')[0];

    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    const startDate = new Date(this.filters.startDate);
    const endDate = new Date(this.filters.endDate);

    this.hrPerformanceService.getPerformanceLeaderboard(startDate, endDate, 10).subscribe({
      next: (metrics) => {
        this.performanceLeaderboard = metrics.map((m, index) => ({
          ...m,
          rank: index + 1,
          sales: this.formatCurrency(m.sales.totalRevenue),
          attendance: `${m.attendance.percentage}%`
        }));
        this.loading = false;
        this.loadRiskLeaderboard(startDate, endDate);
        this.loadCharts(metrics);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadRiskLeaderboard(startDate: Date, endDate: Date): void {
    this.hrPerformanceService.getRiskLeaderboard(startDate, endDate, 10).subscribe({
      next: (metrics) => {
        this.riskLeaderboard = metrics.map((m, index) => ({
          ...m,
          rank: index + 1,
          suspiciousMovements: m.inventory.suspiciousMovements,
          errors: m.errors.totalErrors
        }));
      }
    });
  }

  loadCharts(metrics: PerformanceMetrics[]): void {
    // Risk Trend
    this.riskTrendData = {
      labels: metrics.map(m => m.staffName),
      datasets: [{
        label: 'Risk Score',
        data: metrics.map(m => m.riskScore),
        backgroundColor: metrics.map(m => {
          if (m.riskLevel === 'critical') return 'rgba(239, 68, 68, 0.8)';
          if (m.riskLevel === 'high') return 'rgba(245, 158, 11, 0.8)';
          if (m.riskLevel === 'medium') return 'rgba(59, 130, 246, 0.8)';
          return 'rgba(16, 185, 129, 0.8)';
        })
      }]
    };

    // Performance Ranking
    this.rankingData = {
      labels: metrics.map(m => m.staffName),
      datasets: [{
        label: 'Performance Score',
        data: metrics.map(m => m.overallScore),
        backgroundColor: 'rgba(22, 101, 52, 0.8)'
      }]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y'
    };
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  }

  applyFilters(): void {
    this.loadData();
  }
}

