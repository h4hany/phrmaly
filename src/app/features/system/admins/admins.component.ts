/**
 * Admin User Management Component
 * 
 * Classification: NEW PAGE
 * 
 * Business Purpose: Manage internal platform staff
 */

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatformAdminsService } from '../../../core/services/platform-admins.service';
import { AdminUser, PlatformRole } from '../../../core/models/platform.model';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-admins',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableComponent,
    ButtonComponent,
    TranslatePipe,
    ModalComponent,
    StatCardComponent,
    BadgeComponent,
    DatePipe
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-[var(--text-primary)]">{{ 'platform.admins.title' | translate }}</h1>
          <p class="text-sm text-[var(--card-text)] mt-1">{{ 'platform.admins.subtitle' | translate }}</p>
        </div>
        <app-button variant="primary" (onClick)="showCreateModal = true">
          <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ 'platform.admins.create' | translate }}
        </app-button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <app-stat-card
          [label]="'platform.admins.totalAdmins'"
          [value]="totalAdmins"
          [icon]="'users'"
        />
        <app-stat-card
          [label]="'platform.admins.activeAdmins'"
          [value]="activeAdmins"
          [icon]="'check-circle'"
        />
        <app-stat-card
          [label]="'platform.admins.supportAdmins'"
          [value]="supportAdmins"
          [icon]="'help-circle'"
        />
        <app-stat-card
          [label]="'platform.admins.salesAdmins'"
          [value]="salesAdmins"
          [icon]="'chart'"
        />
      </div>

      <!-- Filters -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.admins.role' | translate }}</label>
            <select
              [(ngModel)]="filters.role"
              class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
            >
              <option value="">{{ 'common.all' | translate }}</option>
              <option value="super_admin">{{ 'platform.admins.roleSuperAdmin' | translate }}</option>
              <option value="support_admin">{{ 'platform.admins.roleSupport' | translate }}</option>
              <option value="sales_admin">{{ 'platform.admins.roleSales' | translate }}</option>
              <option value="finance_admin">{{ 'platform.admins.roleFinance' | translate }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.admins.status' | translate }}</label>
            <select
              [(ngModel)]="filters.status"
              class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
            >
              <option value="">{{ 'common.all' | translate }}</option>
              <option value="active">{{ 'platform.admins.statusActive' | translate }}</option>
              <option value="inactive">{{ 'platform.admins.statusInactive' | translate }}</option>
              <option value="suspended">{{ 'platform.admins.statusSuspended' | translate }}</option>
            </select>
          </div>
          <div class="flex items-end">
            <app-button variant="primary" size="sm" (onClick)="applyFilters()">
              {{ 'common.search' | translate }}
            </app-button>
          </div>
        </div>
      </div>

      <!-- Admins Table -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
        <app-table
          [columns]="columns"
          [data]="admins"
          [pagination]="pagination"
          [loading]="loading"
          [emptyMessage]="'platform.admins.noAdmins' | translate"
          (onPageChange)="onPageChange($event)"
          (onRowClick)="viewAdmin($event)"
        />
      </div>
    </div>

    <!-- Admin Detail Modal -->
    @if (selectedAdmin) {
      <app-modal
        #adminModal
        [title]="selectedAdmin.fullName"
        [showFooter]="true"
        [confirmText]="'common.close' | translate"
        (confirmed)="selectedAdmin = null"
      >
        <div class="space-y-6">
          <!-- Admin Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.admins.email' | translate }}</label>
              <p class="text-[var(--text-primary)]">{{ selectedAdmin.email }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.admins.role' | translate }}</label>
              <app-badge [variant]="getRoleVariant(selectedAdmin.role)">
                {{ getRoleLabel(selectedAdmin.role) | translate }}
              </app-badge>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.admins.status' | translate }}</label>
              <app-badge [variant]="getStatusVariant(selectedAdmin.status)">
                {{ getStatusLabel(selectedAdmin.status) | translate }}
              </app-badge>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.admins.lastLogin' | translate }}</label>
              <p class="text-[var(--text-primary)]">{{ selectedAdmin.lastLoginAt ? (selectedAdmin.lastLoginAt | date:'short') : '-' }}</p>
            </div>
          </div>

          <!-- Permissions -->
          <div>
            <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'platform.admins.permissions' | translate }}</h3>
            <div class="space-y-2">
              @for (permission of selectedAdmin.permissions; track permission.resource) {
                <div class="p-3 bg-[var(--page-bg)] rounded-lg">
                  <p class="font-medium text-[var(--text-primary)]">{{ permission.resource }}</p>
                  <p class="text-sm text-[var(--card-text)]">{{ permission.actions.join(', ') }}</p>
                </div>
              }
            </div>
          </div>
        </div>
      </app-modal>
    }
  `,
  styles: []
})
export class AdminsComponent implements OnInit {
  private adminsService = inject(PlatformAdminsService);
  private translationService = inject(TranslationService);

  loading = false;
  admins: any[] = [];
  selectedAdmin: AdminUser | null = null;

  filters = {
    role: '',
    status: ''
  };

  totalAdmins = 0;
  activeAdmins = 0;
  supportAdmins = 0;
  salesAdmins = 0;

  pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  };

  columns: TableColumn[] = [
    { key: 'fullName', label: 'platform.admins.name', sortable: true },
    { key: 'email', label: 'platform.admins.email', sortable: true },
    { key: 'role', label: 'platform.admins.role', sortable: true },
    { key: 'status', label: 'platform.admins.status', sortable: true },
    { key: 'lastLoginAt', label: 'platform.admins.lastLogin', sortable: true }
  ];

  showCreateModal = false;

  ngOnInit(): void {
    this.loadAdmins();
  }

  loadAdmins(): void {
    this.loading = true;
    this.adminsService.getAll({
      page: this.pagination.page,
      pageSize: this.pagination.pageSize,
      role: this.filters.role || undefined,
      status: this.filters.status || undefined
    }).subscribe({
      next: (response) => {
        this.admins = response.data.map((admin: AdminUser) => ({
          ...admin,
          role: this.translationService.translate(this.getRoleLabel(admin.role)),
          status: this.translationService.translate(this.getStatusLabel(admin.status)),
          lastLoginAt: admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleDateString() : '-'
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

  calculateStats(admins: AdminUser[]): void {
    this.totalAdmins = admins.length;
    this.activeAdmins = admins.filter(a => a.status === 'active').length;
    this.supportAdmins = admins.filter(a => a.role === 'support_admin').length;
    this.salesAdmins = admins.filter(a => a.role === 'sales_admin').length;
  }

  applyFilters(): void {
    this.pagination.page = 1;
    this.loadAdmins();
  }

  onPageChange(page: number): void {
    this.pagination.page = page;
    this.loadAdmins();
  }

  viewAdmin(admin: any): void {
    this.adminsService.getById(admin.id).subscribe({
      next: (admin) => {
        this.selectedAdmin = admin;
      }
    });
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      super_admin: 'platform.admins.roleSuperAdmin',
      support_admin: 'platform.admins.roleSupport',
      sales_admin: 'platform.admins.roleSales',
      finance_admin: 'platform.admins.roleFinance'
    };
    return labels[role] || role;
  }

  getRoleVariant(role: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    const variants: { [key: string]: 'success' | 'warning' | 'danger' | 'info' | 'default' } = {
      super_admin: 'danger',
      support_admin: 'info',
      sales_admin: 'success',
      finance_admin: 'warning'
    };
    return variants[role] || 'default';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      active: 'platform.admins.statusActive',
      inactive: 'platform.admins.statusInactive',
      suspended: 'platform.admins.statusSuspended'
    };
    return labels[status] || status;
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    const variants: { [key: string]: 'success' | 'warning' | 'danger' | 'info' | 'default' } = {
      active: 'success',
      inactive: 'default',
      suspended: 'danger'
    };
    return variants[status] || 'default';
  }
}
