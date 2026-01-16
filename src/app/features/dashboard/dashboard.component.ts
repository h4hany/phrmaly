import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { ChartComponent } from '../../shared/components/chart/chart.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { RiskBadgeComponent } from '../../shared/components/risk-badge/risk-badge.component';
import { InsightsEngineService, RiskInsight } from '../../core/engines/insights-engine.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent, ChartComponent, BadgeComponent, RiskBadgeComponent, TranslatePipe],
  template: `
    <div class="space-y-6">
      <!-- What Needs Attention Today -->
      @if (attentionItems.length > 0) {
        <div class="p-6 rounded-lg border-2" style="background-color: var(--card-bg); border-color: #f59e0b;">
          <h3 class="text-lg font-semibold mb-4" style="color: var(--card-text);">{{ 'dashboard.attention' | translate }}</h3>
          <ul class="space-y-2">
            @for (item of attentionItems; track $index) {
              <li class="flex items-start gap-2 text-sm" style="color: var(--card-text);">
                <span class="text-amber-500 mt-0.5">•</span>
                <span>{{ item | translate }}</span>
              </li>
            }
          </ul>
        </div>
      }

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        @for (kpi of kpis; track kpi.label) {
          <app-stat-card
            [label]="kpi.label | translate"
            [value]="kpi.value"
            [trend]="kpi.trend"
            [trendPositive]="kpi.trendPositive"
            [subtitle]="kpi.subtitle | translate"
          ></app-stat-card>
        }
      </div>

      <!-- Risk Panels -->
      @if (riskInsights.length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (insight of riskInsights; track insight.type) {
            <div class="p-4 rounded-lg" [style]="getRiskPanelStyles(insight)">
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-semibold text-sm">{{ insight.title | translate }}</h4>
                <app-risk-badge [level]="insight.level"></app-risk-badge>
              </div>
              <p class="text-xs mb-2" style="opacity: 0.8;">{{ insight.description | translate }}</p>
              @if (insight.actionRequired) {
                <button 
                  (click)="handleRiskAction(insight)"
                  class="text-xs font-medium underline"
                >
                  {{ 'dashboard.takeAction' | translate }}
                </button>
              }
            </div>
          }
        </div>
      }

      <!-- KPI Cards (Original) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" style="display: none;">
        <app-stat-card
          label="Total Revenue"
          value="112,200"
          trend="+2% Since last week"
          [trendPositive]="true"
          [highlighted]="true"
        >
          <div icon class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </app-stat-card>

        <app-stat-card
          label="Total Profit"
          value="12,500"
          trend="+8% Since last week"
          [trendPositive]="true"
        >
          <div icon class="w-8 h-8 bg-[#166534]/10 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-[#166534]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </app-stat-card>

        <app-stat-card
          label="Total Cost"
          value="48,200"
          trend="+0.2% Since last week"
          [trendPositive]="false"
        >
          <div icon class="w-8 h-8 bg-[#166534]/10 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-[#166534]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </app-stat-card>

        <app-stat-card
          label="Average Order Value"
          value="96.50"
          trend="+5% Since last week"
          [trendPositive]="true"
        >
          <div icon class="w-8 h-8 bg-[#166534]/10 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-[#166534]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </app-stat-card>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Revenue Chart -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ 'dashboard.chart.revenue' | translate }}</h3>
            <select class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#166534]">
              <option>{{ 'dashboard.chart.thisMonth' | translate }}</option>
              <option>{{ 'dashboard.chart.lastMonth' | translate }}</option>
              <option>{{ 'dashboard.chart.thisYear' | translate }}</option>
            </select>
          </div>
          <div style="height: 300px;">
            <app-chart
              [type]="'bar'"
              [data]="revenueChartData"
              [options]="revenueChartOptions"
            />
          </div>
        </div>

        <!-- Orders Chart -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ 'dashboard.chart.orders' | translate }}</h3>
            <select class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#166534]">
              <option>{{ 'dashboard.chart.thisWeek' | translate }}</option>
              <option>{{ 'dashboard.chart.thisMonth' | translate }}</option>
            </select>
          </div>
          <div style="height: 300px;">
            <app-chart
              [type]="'line'"
              [data]="ordersChartData"
              [options]="ordersChartOptions"
            />
          </div>
        </div>
      </div>

      <!-- Recent Orders Table -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">{{ 'dashboard.recentOrders' | translate }}</h3>
          <a href="#" class="text-sm text-[#166534] hover:underline">{{ 'dashboard.viewAll' | translate }}</a>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'dashboard.table.orderId' | translate }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'dashboard.table.medicineName' | translate }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'dashboard.table.price' | translate }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'dashboard.table.orderStatus' | translate }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'dashboard.table.paymentStatus' | translate }}</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'dashboard.table.action' | translate }}</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (order of recentOrders; track order.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ order.id }}</td>
                  <td class="px-6 py-4 text-sm text-gray-900">{{ order.medicineName }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ order.price }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <app-badge [variant]="order.orderStatus === 'Paid' ? 'success' : 'warning'">
                      {{ order.orderStatus }}
                    </app-badge>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <app-badge [variant]="order.paymentStatus === 'Completed' ? 'success' : order.paymentStatus === 'Pending' ? 'warning' : 'default'">
                      {{ order.paymentStatus }}
                    </app-badge>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button class="hover:text-gray-900">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  private insightsEngine = inject(InsightsEngineService);
  router = inject(Router);

  kpis: any[] = [];
  riskInsights: RiskInsight[] = [];
  attentionItems: string[] = [];

  revenueChartData: any;
  revenueChartOptions: any;
  ordersChartData: any;
  ordersChartOptions: any;

  recentOrders = [
    { id: '#ORD576', medicineName: 'Paracetamol (2), Ibuprofen (1)', price: '25.50', orderStatus: 'Paid', paymentStatus: 'Completed' },
    { id: '#ORD575', medicineName: 'Amoxicillin (3), Cetirizine (2)', price: '42.00', orderStatus: 'Pending', paymentStatus: 'In progress' },
    { id: '#ORD574', medicineName: 'Loratadine (1), Omeprazole (1)', price: '15.00', orderStatus: 'Paid', paymentStatus: 'Pending' },
    { id: '#ORD573', medicineName: 'Aspirin (4), Hydrocodone (1)', price: '48.00', orderStatus: 'Paid', paymentStatus: 'Completed' }
  ];

  ngOnInit(): void {
    this.initRevenueChart();
    this.initOrdersChart();
    this.loadInsights();
  }

  loadInsights(): void {
    this.insightsEngine.getKPIs().subscribe(kpis => {
      this.kpis = kpis;
    });

    this.insightsEngine.getRiskInsights().subscribe(insights => {
      this.riskInsights = insights;
    });

    this.insightsEngine.getAttentionItems().subscribe(items => {
      this.attentionItems = items;
    });
  }

  getRiskPanelStyles(insight: RiskInsight): string {
    const colors: { [key: string]: string } = {
      low: 'background-color: #dbeafe; border: 1px solid #3b82f6;',
      medium: 'background-color: #fef3c7; border: 1px solid #f59e0b;',
      high: 'background-color: #fee2e2; border: 1px solid #ef4444;',
      critical: 'background-color: #fee2e2; border: 2px solid #dc2626;'
    };
    return colors[insight.level] || colors['medium'];
  }

  handleRiskAction(insight: RiskInsight): void {
    if (insight.type === 'inventory') {
      this.router.navigate(['/inventory/movements/risk']);
    } else if (insight.type === 'staff') {
      this.router.navigate(['/pharmacy-staff']);
    } else if (insight.type === 'expiry') {
      this.router.navigate(['/inventory/alerts']);
    } else if (insight.type === 'supplier') {
      this.router.navigate(['/suppliers']);
    }
  }

  private initRevenueChart(): void {
    this.revenueChartData = {
      labels: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13'],
      datasets: [{
        label: 'Revenue',
        data: [12000, 19000, 15000, 25000, 22000, 30000, 18657, 28000, 24000, 26000, 30000, 32000, 28000],
        backgroundColor: '#166534',
        borderRadius: 4
      }]
    };

    this.revenueChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value: any) {
              return (value / 1000) + 'k';
            }
          },
          grid: {
            color: '#f3f4f6'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    };
  }

  private initOrdersChart(): void {
    this.ordersChartData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Orders',
        data: [65, 59, 80, 81, 56, 55, 40],
        borderColor: '#84cc16',
        backgroundColor: 'rgba(132, 204, 22, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };

    this.ordersChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: '#f3f4f6'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    };
  }
}
