/**
 * Account Management Component
 * 
 * Classification: NEW PAGE + SYSTEM EXTENSION
 * 
 * Business Purpose: Control which businesses exist on the platform and what they can access
 */

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlatformAccountsService } from '../../../core/services/platform-accounts.service';
import { PlatformAccount } from '../../../core/models/platform.model';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { AccountStatusBadgeComponent } from '../../../shared/components/account-status-badge/account-status-badge.component';
import { ModuleToggleMatrixComponent } from '../../../shared/components/module-toggle-matrix/module-toggle-matrix.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableComponent,
    ButtonComponent,
    TranslatePipe,
    AccountStatusBadgeComponent,
    ModuleToggleMatrixComponent,
    ModalComponent,
    StatCardComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-[var(--text-primary)]">{{ 'platform.accounts.title' | translate }}</h1>
        <app-button variant="primary" (onClick)="showCreateModal = true">
          <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ 'platform.accounts.create' | translate }}
        </app-button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <app-stat-card
          [label]="'platform.accounts.total'"
          [value]="totalAccounts"
          [icon]="'users'"
        />
        <app-stat-card
          [label]="'platform.accounts.active'"
          [value]="activeAccounts"
          [icon]="'check-circle'"
        />
        <app-stat-card
          [label]="'platform.accounts.trial'"
          [value]="trialAccounts"
          [icon]="'clock'"
        />
        <app-stat-card
          [label]="'platform.accounts.suspended'"
          [value]="suspendedAccounts"
          [icon]="'alert'"
        />
      </div>

      <!-- Filters -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.accounts.status' | translate }}</label>
            <select
              [(ngModel)]="filters.status"
              class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
            >
              <option value="">{{ 'common.all' | translate }}</option>
              <option value="active">{{ 'platform.account.statusActive' | translate }}</option>
              <option value="trial">{{ 'platform.account.statusTrial' | translate }}</option>
              <option value="suspended">{{ 'platform.account.statusSuspended' | translate }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'common.search' | translate }}</label>
            <input
              type="text"
              [(ngModel)]="filters.search"
              [placeholder]="'platform.accounts.searchPlaceholder' | translate"
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

      <!-- Accounts Table -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
        <app-table
          [columns]="columns"
          [data]="accounts"
          [pagination]="pagination"
          [loading]="loading"
          [emptyMessage]="'platform.accounts.noAccounts' | translate"
          (onPageChange)="onPageChange($event)"
          (onRowClick)="viewAccount($event)"
        />
      </div>
    </div>

    <!-- Account Detail Modal -->
    @if (selectedAccount) {
      <app-modal
        #accountModal
        [title]="selectedAccount.name"
        [showFooter]="true"
        [confirmText]="'common.close' | translate"
        (confirmed)="selectedAccount = null"
      >
        <div class="space-y-6">
          <!-- Account Info -->
          <div>
            <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'platform.accounts.overview' | translate }}</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.accounts.email' | translate }}</label>
                <p class="text-[var(--text-primary)]">{{ selectedAccount.email }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.accounts.status' | translate }}</label>
                <app-account-status-badge [status]="selectedAccount.status" />
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.accounts.pharmacies' | translate }}</label>
                <p class="text-[var(--text-primary)]">{{ selectedAccount.pharmaciesCreated }} / {{ selectedAccount.maxPharmacies === -1 ? '∞' : selectedAccount.maxPharmacies }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.accounts.staff' | translate }}</label>
                <p class="text-[var(--text-primary)]">{{ selectedAccount.staffCreated }} / {{ selectedAccount.maxStaff === -1 ? '∞' : selectedAccount.maxStaff }}</p>
              </div>
            </div>
          </div>

          <!-- Modules -->
          <app-module-toggle-matrix
            [enabledModules]="selectedAccount.enabledModules"
            (modulesChange)="updateModules($event)"
          />
        </div>
      </app-modal>
    }
  `,
  styles: []
})
export class AccountsComponent implements OnInit {
  private accountsService = inject(PlatformAccountsService);
  private router = inject(Router);

  loading = false;
  accounts: any[] = [];
  selectedAccount: PlatformAccount | null = null;

  filters = {
    status: '',
    search: ''
  };

  totalAccounts = 0;
  activeAccounts = 0;
  trialAccounts = 0;
  suspendedAccounts = 0;

  pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  };

  columns: TableColumn[] = [
    { key: 'name', label: 'platform.accounts.name', sortable: true },
    { key: 'email', label: 'platform.accounts.email', sortable: true },
    { key: 'status', label: 'platform.accounts.status', sortable: true },
    { key: 'pharmaciesCreated', label: 'platform.accounts.pharmacies', sortable: true },
    { key: 'lastLoginAt', label: 'platform.accounts.lastLogin', sortable: true }
  ];

  showCreateModal = false;

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading = true;
    this.accountsService.getAll({
      page: this.pagination.page,
      pageSize: this.pagination.pageSize,
      status: this.filters.status || undefined,
      search: this.filters.search || undefined
    }).subscribe({
      next: (response) => {
        this.accounts = response.data.map((account: any) => ({
          ...account,
          status: account.status,
          pharmaciesCreated: `${account.pharmaciesCreated} / ${account.maxPharmacies === -1 ? '∞' : account.maxPharmacies}`,
          lastLoginAt: account.lastLoginAt ? new Date(account.lastLoginAt).toLocaleDateString() : '-'
        }));
        this.pagination = {
          page: response.page,
          pageSize: response.pageSize,
          total: response.total,
          totalPages: response.totalPages
        };
        this.calculateStats(response.data);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  calculateStats(accounts: PlatformAccount[]): void {
    this.totalAccounts = accounts.length;
    this.activeAccounts = accounts.filter(a => a.status === 'active').length;
    this.trialAccounts = accounts.filter(a => a.status === 'trial').length;
    this.suspendedAccounts = accounts.filter(a => a.status === 'suspended').length;
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

  updateModules(modules: any[]): void {
    if (!this.selectedAccount) return;
    this.accountsService.updateModules(this.selectedAccount.id, modules).subscribe({
      next: (account) => {
        this.selectedAccount = account;
        this.loadAccounts();
      }
    });
  }
}

