/**
 * Account Risk Center Component
 * 
 * Classification: NEW PAGE + SYSTEM EXTENSION
 * 
 * Business Purpose: Protect platform from abuse, fraud, or unpaid accounts
 */

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatformAccountsService } from '../../../core/services/platform-accounts.service';
import { PlatformAccount, AccountRisk } from '../../../core/models/platform.model';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-risk-center',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableComponent,
    ButtonComponent,
    TranslatePipe,
    ModalComponent,
    StatCardComponent,
    BadgeComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-[var(--text-primary)]">{{ 'platform.risk.title' | translate }}</h1>
        <p class="text-sm text-[var(--card-text)] mt-1">{{ 'platform.risk.subtitle' | translate }}</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <app-stat-card
          [label]="'platform.risk.totalAccounts'"
          [value]="totalAccounts"
          [icon]="'users'"
        />
        <app-stat-card
          [label]="'platform.risk.highRisk'"
          [value]="highRiskAccounts"
          [icon]="'alert'"
        />
        <app-stat-card
          [label]="'platform.risk.mediumRisk'"
          [value]="mediumRiskAccounts"
          [icon]="'clock'"
        />
        <app-stat-card
          [label]="'platform.risk.suspended'"
          [value]="suspendedAccounts"
          [icon]="'x-circle'"
        />
      </div>

      <!-- Filters -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.risk.riskLevel' | translate }}</label>
            <select
              [(ngModel)]="filters.riskLevel"
              class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
            >
              <option value="">{{ 'common.all' | translate }}</option>
              <option value="critical">{{ 'platform.risk.levelCritical' | translate }}</option>
              <option value="high">{{ 'platform.risk.levelHigh' | translate }}</option>
              <option value="medium">{{ 'platform.risk.levelMedium' | translate }}</option>
              <option value="low">{{ 'platform.risk.levelLow' | translate }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'common.search' | translate }}</label>
            <input
              type="text"
              [(ngModel)]="filters.search"
              [placeholder]="'platform.risk.searchPlaceholder' | translate"
              class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
            />
          </div>
          <div class="flex items-end">
            <app-button variant="primary" size="sm" (onClick)="applyFilters()">
              {{ 'common.search' | translate }}
            </app-button>
          </div>
        </div>
      </div>

      <!-- Risk Table -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
        <app-table
          [columns]="columns"
          [data]="riskAccounts"
          [pagination]="pagination"
          [loading]="loading"
          [emptyMessage]="'platform.risk.noAccounts' | translate"
          (onPageChange)="onPageChange($event)"
          (onRowClick)="viewAccount($event)"
        />
      </div>
    </div>

    <!-- Account Risk Detail Modal -->
    @if (selectedAccount) {
      <app-modal
        #riskModal
        [title]="selectedAccount.name + ' - Risk Assessment'"
        [showFooter]="true"
        [confirmText]="'common.close' | translate"
        (confirmed)="selectedAccount = null"
      >
        <div class="space-y-6">
          <!-- Risk Score -->
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-red-800">{{ 'platform.risk.riskScore' | translate }}</p>
                <p class="text-3xl font-bold text-red-900">{{ riskScore }}</p>
              </div>
              <app-badge [variant]="getRiskVariant(riskLevel)">
                {{ getRiskLabel(riskLevel) | translate }}
              </app-badge>
            </div>
          </div>

          <!-- Risk Factors -->
          <div>
            <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'platform.risk.riskFactors' | translate }}</h3>
            <div class="space-y-2">
              @for (factor of riskFactors; track factor.type) {
                <div class="flex items-center justify-between p-3 bg-[var(--page-bg)] rounded-lg">
                  <div>
                    <p class="font-medium text-[var(--text-primary)]">{{ getFactorLabel(factor.type) | translate }}</p>
                    <p class="text-sm text-[var(--card-text)]">{{ factor.description }}</p>
                  </div>
                  <app-badge [variant]="getSeverityVariant(factor.severity)">
                    {{ getSeverityLabel(factor.severity) | translate }}
                  </app-badge>
                </div>
              }
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <app-button variant="danger" size="sm" (onClick)="suspendAccount()">
              {{ 'platform.risk.suspend' | translate }}
            </app-button>
            <app-button variant="outline" size="sm" (onClick)="restrictAccount()">
              {{ 'platform.risk.restrict' | translate }}
            </app-button>
          </div>
        </div>
      </app-modal>
    }
  `,
  styles: []
})
export class RiskCenterComponent implements OnInit {
  private accountsService = inject(PlatformAccountsService);
  private translationService = inject(TranslationService);

  loading = false;
  riskAccounts: any[] = [];
  selectedAccount: PlatformAccount | null = null;

  filters = {
    riskLevel: '',
    search: ''
  };

  totalAccounts = 0;
  highRiskAccounts = 0;
  mediumRiskAccounts = 0;
  suspendedAccounts = 0;

  riskScore = 75;
  riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'high';
  riskFactors: any[] = [
    {
      type: 'payment_overdue',
      severity: 'high',
      description: 'Payment overdue by 30+ days'
    },
    {
      type: 'suspicious_activity',
      severity: 'medium',
      description: 'Unusual login patterns detected'
    }
  ];

  pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  };

  columns: TableColumn[] = [
    { key: 'name', label: 'platform.risk.account', sortable: true },
    { key: 'riskScore', label: 'platform.risk.riskScore', sortable: true },
    { key: 'riskLevel', label: 'platform.risk.riskLevel', sortable: true },
    { key: 'status', label: 'platform.risk.status', sortable: true },
    { key: 'lastAssessedAt', label: 'platform.risk.lastAssessed', sortable: true }
  ];

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading = true;
    this.accountsService.getAll({
      page: this.pagination.page,
      pageSize: this.pagination.pageSize,
      search: this.filters.search || undefined
    }).subscribe({
      next: (response) => {
        // Mock risk data
        this.riskAccounts = response.data.map((account: PlatformAccount) => {
          const riskScore = Math.floor(Math.random() * 100);
          const riskLevel = riskScore >= 80 ? 'critical' : riskScore >= 60 ? 'high' : riskScore >= 40 ? 'medium' : 'low';
          return {
            ...account,
            riskScore,
            riskLevel: this.translationService.translate(this.getRiskLabel(riskLevel)),
            status: account.status,
            lastAssessedAt: new Date().toLocaleDateString()
          };
        });
        this.pagination = {
          page: response.page,
          pageSize: response.pageSize,
          total: response.total,
          totalPages: response.totalPages
        };
        this.calculateStats();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.totalAccounts = this.riskAccounts.length;
    this.highRiskAccounts = this.riskAccounts.filter((a: any) => a.riskScore >= 60).length;
    this.mediumRiskAccounts = this.riskAccounts.filter((a: any) => a.riskScore >= 40 && a.riskScore < 60).length;
    this.suspendedAccounts = this.riskAccounts.filter((a: any) => a.status === 'suspended').length;
  }

  applyFilters(): void {
    this.pagination.page = 1;
    this.loadAccounts();
  }

  onPageChange(page: number): void {
    this.pagination.page = page;
    this.loadAccounts();
  }

  viewAccount(account: any): void {
    this.accountsService.getById(account.id).subscribe({
      next: (account) => {
        this.selectedAccount = account;
      }
    });
  }

  suspendAccount(): void {
    if (!this.selectedAccount) return;
    this.accountsService.suspend(this.selectedAccount.id).subscribe({
      next: () => {
        this.loadAccounts();
        this.selectedAccount = null;
      }
    });
  }

  restrictAccount(): void {
    // TODO: Implement restriction
    console.log('Restrict account:', this.selectedAccount);
  }

  getRiskLabel(level: string): string {
    const labels: { [key: string]: string } = {
      critical: 'platform.risk.levelCritical',
      high: 'platform.risk.levelHigh',
      medium: 'platform.risk.levelMedium',
      low: 'platform.risk.levelLow'
    };
    return labels[level] || level;
  }

  getRiskVariant(level: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    const variants: { [key: string]: 'success' | 'warning' | 'danger' | 'info' | 'default' } = {
      critical: 'danger',
      high: 'danger',
      medium: 'warning',
      low: 'success'
    };
    return variants[level] || 'default';
  }

  getFactorLabel(type: string): string {
    const labels: { [key: string]: string } = {
      payment_overdue: 'platform.risk.factorPaymentOverdue',
      suspicious_activity: 'platform.risk.factorSuspiciousActivity',
      compliance_violation: 'platform.risk.factorComplianceViolation',
      high_usage: 'platform.risk.factorHighUsage',
      low_engagement: 'platform.risk.factorLowEngagement'
    };
    return labels[type] || type;
  }

  getSeverityLabel(severity: string): string {
    const labels: { [key: string]: string } = {
      critical: 'platform.risk.severityCritical',
      high: 'platform.risk.severityHigh',
      medium: 'platform.risk.severityMedium',
      low: 'platform.risk.severityLow'
    };
    return labels[severity] || severity;
  }

  getSeverityVariant(severity: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    const variants: { [key: string]: 'success' | 'warning' | 'danger' | 'info' | 'default' } = {
      critical: 'danger',
      high: 'danger',
      medium: 'warning',
      low: 'info'
    };
    return variants[severity] || 'default';
  }
}
