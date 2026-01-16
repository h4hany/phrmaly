/**
 * Payroll & Commission Engine Component
 * 
 * Classification: NEW PAGE + SYSTEM EXTENSION
 * 
 * Business Purpose: Let pharmacy owners calculate true staff cost vs revenue generated
 */

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayrollService } from '../../../core/services/payroll.service';
import { PayrollRecord } from '../../../core/models/hr.model';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { PayrollSummaryPanelComponent } from '../../../shared/components/payroll-summary-panel/payroll-summary-panel.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { ChartComponent } from '../../../shared/components/chart/chart.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PharmacyStaffService } from '../../../core/services/pharmacy-staff.service';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableComponent,
    ButtonComponent,
    TranslatePipe,
    PayrollSummaryPanelComponent,
    StatCardComponent,
    ChartComponent,
    ModalComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-[var(--text-primary)]">{{ 'hr.payroll.title' | translate }}</h1>
        <app-button variant="primary" (onClick)="showGenerateModal = true">
          <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ 'hr.payroll.generate' | translate }}
        </app-button>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <app-stat-card
          [label]="'hr.payroll.totalPayroll'"
          [value]="totalPayroll"
          [unit]="'USD'"
          [icon]="'credit-card'"
        />
        <app-stat-card
          [label]="'hr.payroll.totalCommission'"
          [value]="totalCommission"
          [unit]="'USD'"
          [icon]="'chart'"
        />
        <app-stat-card
          [label]="'hr.payroll.pending'"
          [value]="pendingCount"
          [icon]="'clock'"
        />
        <app-stat-card
          [label]="'hr.payroll.paid'"
          [value]="paidCount"
          [icon]="'check-circle'"
        />
      </div>

      <!-- Filters -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'hr.payroll.staff' | translate }}</label>
            <select
              [(ngModel)]="filters.staffId"
              class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
            >
              <option value="">{{ 'common.all' | translate }}</option>
              @for (staff of staffList; track staff.id) {
                <option [value]="staff.id">{{ staff.fullName }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'hr.payroll.status' | translate }}</label>
            <select
              [(ngModel)]="filters.status"
              class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
            >
              <option value="">{{ 'common.all' | translate }}</option>
              <option value="draft">{{ 'hr.payroll.statusDraft' | translate }}</option>
              <option value="pending_approval">{{ 'hr.payroll.statusPending' | translate }}</option>
              <option value="approved">{{ 'hr.payroll.statusApproved' | translate }}</option>
              <option value="paid">{{ 'hr.payroll.statusPaid' | translate }}</option>
            </select>
          </div>
          <div class="flex items-end">
            <app-button variant="primary" size="sm" (onClick)="applyFilters()">
              {{ 'common.search' | translate }}
            </app-button>
          </div>
        </div>
      </div>

      <!-- Payroll Table -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
        <app-table
          [columns]="columns"
          [data]="payrollRecords"
          [pagination]="pagination"
          [loading]="loading"
          [emptyMessage]="'hr.payroll.noRecords' | translate"
          (onPageChange)="onPageChange($event)"
          (onRowClick)="viewPayroll($event)"
        />
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
          <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'hr.payroll.costVsRevenue' | translate }}</h3>
          <app-chart [type]="'line'" [data]="costVsRevenueData" [options]="chartOptions" />
        </div>
        <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
          <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'hr.payroll.distribution' | translate }}</h3>
          <app-chart [type]="'pie'" [data]="distributionData" [options]="chartOptions" />
        </div>
      </div>
    </div>

    <!-- Payroll Detail Modal -->
    @if (selectedPayroll) {
      <app-modal
        #payrollModal
        [title]="'hr.payroll.details' | translate"
        [showFooter]="true"
        [confirmText]="'common.close' | translate"
        (confirmed)="selectedPayroll = null"
      >
        <app-payroll-summary-panel [payroll]="selectedPayroll" />
      </app-modal>
    }
  `,
  styles: []
})
export class PayrollComponent implements OnInit {
  private payrollService = inject(PayrollService);
  private staffService = inject(PharmacyStaffService);

  loading = false;
  showGenerateModal = false;
  payrollRecords: any[] = [];
  staffList: any[] = [];
  selectedPayroll: PayrollRecord | null = null;

  filters = {
    staffId: '',
    status: ''
  };

  totalPayroll = 0;
  totalCommission = 0;
  pendingCount = 0;
  paidCount = 0;

  pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  };

  columns: TableColumn[] = [
    { key: 'period', label: 'hr.payroll.period', sortable: true },
    { key: 'staffName', label: 'hr.payroll.staff', sortable: true },
    { key: 'baseSalary', label: 'hr.payroll.baseSalary', sortable: true },
    { key: 'commission', label: 'hr.payroll.commission', sortable: true },
    { key: 'netPay', label: 'hr.payroll.netPay', sortable: true },
    { key: 'status', label: 'hr.payroll.status', sortable: true }
  ];

  costVsRevenueData: any = {};
  distributionData: any = {};
  chartOptions: any = {};

  ngOnInit(): void {
    this.loadStaff();
    this.loadPayroll();
  }

  loadStaff(): void {
    this.staffService.getAll({ page: 1, pageSize: 100 }).subscribe({
      next: (response) => {
        this.staffList = response.data;
      }
    });
  }

  loadPayroll(): void {
    this.loading = true;
    const params: any = {
      page: this.pagination.page,
      pageSize: this.pagination.pageSize
    };

    if (this.filters.staffId) {
      params.staffId = this.filters.staffId;
    }

    if (this.filters.status) {
      params.status = this.filters.status;
    }

    this.payrollService.getPayrollRecords(params).subscribe({
      next: (response) => {
        this.payrollRecords = response.data.map((record: any) => ({
          ...record,
          period: `${new Date(record.period.startDate).toLocaleDateString()} - ${new Date(record.period.endDate).toLocaleDateString()}`,
          baseSalary: this.formatCurrency(record.baseSalary),
          commission: this.formatCurrency(record.commission),
          netPay: this.formatCurrency(record.netPay),
          status: record.status
        }));
        this.pagination = {
          page: response.page,
          pageSize: response.pageSize,
          total: response.total,
          totalPages: response.totalPages
        };
        this.calculateStats(response.data);
        this.loading = false;
        this.loadCharts();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  calculateStats(records: PayrollRecord[]): void {
    this.totalPayroll = records.reduce((sum, r) => sum + r.netPay, 0);
    this.totalCommission = records.reduce((sum, r) => sum + r.commission, 0);
    this.pendingCount = records.filter(r => r.status === 'pending_approval' || r.status === 'draft').length;
    this.paidCount = records.filter(r => r.status === 'paid').length;
  }

  loadCharts(): void {
    // Mock chart data
    this.costVsRevenueData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Staff Cost',
          data: [15000, 16000, 15500, 17000, 16500, 18000],
          borderColor: 'rgba(239, 68, 68, 1)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)'
        },
        {
          label: 'Revenue',
          data: [50000, 55000, 52000, 60000, 58000, 65000],
          borderColor: 'rgba(16, 185, 129, 1)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)'
        }
      ]
    };

    this.distributionData = {
      labels: ['Base Salary', 'Commission', 'Bonuses'],
      datasets: [{
        data: [this.totalPayroll * 0.7, this.totalPayroll * 0.25, this.totalPayroll * 0.05],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ]
      }]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false
    };
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  applyFilters(): void {
    this.pagination.page = 1;
    this.loadPayroll();
  }

  onPageChange(page: number): void {
    this.pagination.page = page;
    this.loadPayroll();
  }

  viewPayroll(record: any): void {
    // Find the full record
    this.payrollService.getPayrollRecords({ page: 1, pageSize: 1000 }).subscribe({
      next: (response) => {
        this.selectedPayroll = response.data.find((r: PayrollRecord) => r.id === record.id) || null;
      }
    });
  }
}

