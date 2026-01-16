/**
 * Subscriptions & Billing Component
 * 
 * Classification: NEW PAGE + SYSTEM EXTENSION
 * 
 * Business Purpose: Manage monetization and revenue operations
 */

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatformSubscriptionsService } from '../../../core/services/platform-subscriptions.service';
import { SubscriptionPlan, Subscription, Invoice } from '../../../core/models/platform.model';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import { PlanCardComponent } from '../../../shared/components/plan-card/plan-card.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { ChartComponent } from '../../../shared/components/chart/chart.component';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableComponent,
    ButtonComponent,
    TranslatePipe,
    PlanCardComponent,
    StatCardComponent,
    ChartComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-[var(--text-primary)]">{{ 'platform.subscriptions.title' | translate }}</h1>
          <p class="text-sm text-[var(--card-text)] mt-1">{{ 'platform.subscriptions.subtitle' | translate }}</p>
        </div>
        <app-button variant="primary" (onClick)="showCreatePlanModal = true">
          <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ 'platform.subscriptions.createPlan' | translate }}
        </app-button>
      </div>

      <!-- Revenue KPIs -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <app-stat-card
          [label]="'platform.subscriptions.mrr'"
          [value]="formatCurrency(mrr)"
          [icon]="'chart'"
        />
        <app-stat-card
          [label]="'platform.subscriptions.totalSubscriptions'"
          [value]="totalSubscriptions"
          [icon]="'credit-card'"
        />
        <app-stat-card
          [label]="'platform.subscriptions.activeSubscriptions'"
          [value]="activeSubscriptions"
          [icon]="'check-circle'"
        />
        <app-stat-card
          [label]="'platform.subscriptions.churnRate'"
          [value]="churnRate + '%'"
          [icon]="'alert'"
        />
      </div>

      <!-- Tabs -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)]">
        <div class="border-b border-[var(--border-color)]">
          <nav class="flex -mb-px">
            <button
              (click)="activeTab = 'plans'"
              [class]="activeTab === 'plans' ? 'border-[var(--primary-color)] text-[var(--primary-color)]' : 'border-transparent text-[var(--card-text)] hover:text-[var(--text-primary)]'"
              class="px-6 py-4 border-b-2 font-medium text-sm transition-colors"
            >
              {{ 'platform.subscriptions.plans' | translate }}
            </button>
            <button
              (click)="activeTab = 'subscriptions'"
              [class]="activeTab === 'subscriptions' ? 'border-[var(--primary-color)] text-[var(--primary-color)]' : 'border-transparent text-[var(--card-text)] hover:text-[var(--text-primary)]'"
              class="px-6 py-4 border-b-2 font-medium text-sm transition-colors"
            >
              {{ 'platform.subscriptions.subscriptions' | translate }}
            </button>
            <button
              (click)="activeTab = 'invoices'"
              [class]="activeTab === 'invoices' ? 'border-[var(--primary-color)] text-[var(--primary-color)]' : 'border-transparent text-[var(--card-text)] hover:text-[var(--text-primary)]'"
              class="px-6 py-4 border-b-2 font-medium text-sm transition-colors"
            >
              {{ 'platform.subscriptions.invoices' | translate }}
            </button>
            <button
              (click)="activeTab = 'analytics'"
              [class]="activeTab === 'analytics' ? 'border-[var(--primary-color)] text-[var(--primary-color)]' : 'border-transparent text-[var(--card-text)] hover:text-[var(--text-primary)]'"
              class="px-6 py-4 border-b-2 font-medium text-sm transition-colors"
            >
              {{ 'platform.subscriptions.analytics' | translate }}
            </button>
          </nav>
        </div>

        <div class="p-6">
          <!-- Plans Tab -->
          @if (activeTab === 'plans') {
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              @for (plan of plans; track plan.id) {
                <app-plan-card
                  [plan]="plan"
                  [highlighted]="plan.tier === 'enterprise'"
                  [showActions]="true"
                  (onSelect)="assignPlan(plan)"
                  (onEdit)="editPlan(plan)"
                />
              }
            </div>
          }

          <!-- Subscriptions Tab -->
          @if (activeTab === 'subscriptions') {
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex gap-2">
                  <select
                    [(ngModel)]="subscriptionFilters.status"
                    class="px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
                  >
                    <option value="">{{ 'common.all' | translate }}</option>
                    <option value="active">{{ 'platform.subscriptions.statusActive' | translate }}</option>
                    <option value="trial">{{ 'platform.subscriptions.statusTrial' | translate }}</option>
                    <option value="cancelled">{{ 'platform.subscriptions.statusCancelled' | translate }}</option>
                  </select>
                </div>
              </div>
              <app-table
                [columns]="subscriptionColumns"
                [data]="subscriptions"
                [pagination]="subscriptionPagination"
                [loading]="loading"
                [emptyMessage]="'platform.subscriptions.noSubscriptions' | translate"
                (onPageChange)="onSubscriptionPageChange($event)"
              />
            </div>
          }

          <!-- Invoices Tab -->
          @if (activeTab === 'invoices') {
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex gap-2">
                  <select
                    [(ngModel)]="invoiceFilters.status"
                    class="px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
                  >
                    <option value="">{{ 'common.all' | translate }}</option>
                    <option value="paid">{{ 'platform.subscriptions.invoicePaid' | translate }}</option>
                    <option value="open">{{ 'platform.subscriptions.invoiceOpen' | translate }}</option>
                    <option value="uncollectible">{{ 'platform.subscriptions.invoiceUncollectible' | translate }}</option>
                  </select>
                </div>
              </div>
              <app-table
                [columns]="invoiceColumns"
                [data]="invoices"
                [pagination]="invoicePagination"
                [loading]="loading"
                [emptyMessage]="'platform.subscriptions.noInvoices' | translate"
                (onPageChange)="onInvoicePageChange($event)"
              />
            </div>
          }

          <!-- Analytics Tab -->
          @if (activeTab === 'analytics') {
            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
                  <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'platform.subscriptions.mrrGrowth' | translate }}</h3>
                  <app-chart [type]="'line'" [data]="mrrData" [options]="chartOptions" />
                </div>
                <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
                  <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'platform.subscriptions.churnRate' | translate }}</h3>
                  <app-chart [type]="'bar'" [data]="churnData" [options]="chartOptions" />
                </div>
                <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
                  <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'platform.subscriptions.revenueByPlan' | translate }}</h3>
                  <app-chart [type]="'pie'" [data]="revenueByPlanData" [options]="chartOptions" />
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SubscriptionsComponent implements OnInit {
  private subscriptionsService = inject(PlatformSubscriptionsService);
  private translationService = inject(TranslationService);

  loading = false;
  activeTab: 'plans' | 'subscriptions' | 'invoices' | 'analytics' = 'plans';

  plans: SubscriptionPlan[] = [];
  subscriptions: any[] = [];
  invoices: any[] = [];

  mrr = 32860;
  totalSubscriptions = 0;
  activeSubscriptions = 0;
  churnRate = 2.5;

  subscriptionFilters = { status: '' };
  invoiceFilters = { status: '' };

  subscriptionPagination = { page: 1, pageSize: 10, total: 0, totalPages: 0 };
  invoicePagination = { page: 1, pageSize: 10, total: 0, totalPages: 0 };

  subscriptionColumns: TableColumn[] = [
    { key: 'accountId', label: 'platform.subscriptions.account', sortable: true },
    { key: 'planId', label: 'platform.subscriptions.plan', sortable: true },
    { key: 'status', label: 'platform.subscriptions.status', sortable: true },
    { key: 'currentPeriodEnd', label: 'platform.subscriptions.nextBilling', sortable: true }
  ];

  invoiceColumns: TableColumn[] = [
    { key: 'invoiceNumber', label: 'platform.subscriptions.invoiceNumber', sortable: true },
    { key: 'accountId', label: 'platform.subscriptions.account', sortable: true },
    { key: 'amount', label: 'platform.subscriptions.amount', sortable: true },
    { key: 'status', label: 'platform.subscriptions.status', sortable: true },
    { key: 'dueDate', label: 'platform.subscriptions.dueDate', sortable: true }
  ];

  showCreatePlanModal = false;

  mrrData: any = {};
  churnData: any = {};
  revenueByPlanData: any = {};
  chartOptions: any = {};

  ngOnInit(): void {
    this.loadPlans();
    this.loadSubscriptions();
    this.loadInvoices();
    this.loadAnalytics();
  }

  loadPlans(): void {
    this.loading = true;
    this.subscriptionsService.getPlans().subscribe({
      next: (response) => {
        this.plans = response.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadSubscriptions(): void {
    this.loading = true;
    this.subscriptionsService.getSubscriptions({
      page: this.subscriptionPagination.page,
      pageSize: this.subscriptionPagination.pageSize,
      status: this.subscriptionFilters.status || undefined
    }).subscribe({
      next: (response) => {
        this.subscriptions = response.data.map((sub: Subscription) => ({
          ...sub,
          status: this.translationService.translate(this.getStatusBadge(sub.status)),
          currentPeriodEnd: new Date(sub.currentPeriodEnd).toLocaleDateString()
        }));
        this.subscriptionPagination = {
          page: response.page,
          pageSize: response.pageSize,
          total: response.total,
          totalPages: response.totalPages
        };
        this.totalSubscriptions = response.total;
        this.activeSubscriptions = response.data.filter((s: Subscription) => s.status === 'active').length;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadInvoices(): void {
    this.loading = true;
    this.subscriptionsService.getInvoices({
      page: this.invoicePagination.page,
      pageSize: this.invoicePagination.pageSize,
      status: this.invoiceFilters.status || undefined
    }).subscribe({
      next: (response) => {
        this.invoices = response.data.map((inv: Invoice) => ({
          ...inv,
          amount: this.formatCurrency(inv.amount),
          status: this.translationService.translate(this.getInvoiceStatusBadge(inv.status)),
          dueDate: new Date(inv.dueDate).toLocaleDateString()
        }));
        this.invoicePagination = {
          page: response.page,
          pageSize: response.pageSize,
          total: response.total,
          totalPages: response.totalPages
        };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadAnalytics(): void {
    // Mock analytics data
    this.mrrData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'MRR',
        data: [25000, 27000, 29000, 31000, 32000, 32860],
        borderColor: 'rgba(22, 101, 52, 1)',
        backgroundColor: 'rgba(22, 101, 52, 0.1)',
        fill: true
      }]
    };

    this.churnData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Churn Rate %',
        data: [3.2, 2.8, 2.5, 2.3, 2.4, 2.5],
        backgroundColor: 'rgba(245, 158, 11, 0.8)'
      }]
    };

    this.revenueByPlanData = {
      labels: ['Starter', 'Professional', 'Enterprise'],
      datasets: [{
        data: [7920, 14950, 9990],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(22, 101, 52, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ]
      }]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false
    };
  }

  onSubscriptionPageChange(page: number): void {
    this.subscriptionPagination.page = page;
    this.loadSubscriptions();
  }

  onInvoicePageChange(page: number): void {
    this.invoicePagination.page = page;
    this.loadInvoices();
  }

  assignPlan(plan: SubscriptionPlan): void {
    // TODO: Implement plan assignment
    console.log('Assign plan:', plan);
  }

  editPlan(plan: SubscriptionPlan): void {
    // TODO: Implement plan editing
    console.log('Edit plan:', plan);
  }

  getStatusBadge(status: string): string {
    const labels: { [key: string]: string } = {
      active: 'platform.subscriptions.statusActive',
      trial: 'platform.subscriptions.statusTrial',
      cancelled: 'platform.subscriptions.statusCancelled',
      expired: 'platform.subscriptions.statusCancelled',
      past_due: 'platform.subscriptions.statusCancelled'
    };
    return labels[status] || status;
  }

  getInvoiceStatusBadge(status: string): string {
    const labels: { [key: string]: string } = {
      paid: 'platform.subscriptions.invoicePaid',
      open: 'platform.subscriptions.invoiceOpen',
      uncollectible: 'platform.subscriptions.invoiceUncollectible',
      draft: 'platform.subscriptions.invoiceOpen',
      void: 'platform.subscriptions.invoiceOpen'
    };
    return labels[status] || status;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  }
}
