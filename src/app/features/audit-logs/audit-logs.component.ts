import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableComponent, TableColumn } from '../../shared/components/table/table.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

interface AuditLog {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  details?: string;
}

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent, ButtonComponent, TranslatePipe],
  template: `
    <div class="space-y-[var(--spacing-gap)]">
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-[var(--spacing-card)]">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold text-[var(--text-primary)]">{{ 'audit.title' | translate }}</h1>
        </div>

        <!-- Filters -->
        <div class="bg-[var(--page-bg)] rounded-[var(--radius-md)] p-4 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">
                {{ 'audit.entityType' | translate }}
              </label>
              <select
                [(ngModel)]="filters.entityType"
                class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              >
                <option value="">{{ 'common.all' | translate }}</option>
                <option value="Patient">Patient</option>
                <option value="Invoice">Invoice</option>
                <option value="Drug">Drug</option>
                <option value="Purchase">Purchase</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">
                {{ 'audit.user' | translate }}
              </label>
              <input
                type="text"
                [(ngModel)]="filters.user"
                [placeholder]="'common.search' | translate"
                class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">
                {{ 'audit.action' | translate }}
              </label>
              <select
                [(ngModel)]="filters.action"
                class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              >
                <option value="">{{ 'common.all' | translate }}</option>
                <option value="Created">Created</option>
                <option value="Updated">Updated</option>
                <option value="Deleted">Deleted</option>
                <option value="Viewed">Viewed</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">
                {{ 'audit.dateRange' | translate }}
              </label>
              <div class="flex gap-2">
                <input
                  type="date"
                  [(ngModel)]="filters.fromDate"
                  class="flex-1 px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                />
                <input
                  type="date"
                  [(ngModel)]="filters.toDate"
                  class="flex-1 px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                />
              </div>
            </div>
          </div>
          <div class="flex gap-3 mt-4">
            <app-button variant="primary" size="sm" (onClick)="applyFilters()">
              {{ 'audit.applyFilters' | translate }}
            </app-button>
            <app-button variant="outline" size="sm" (onClick)="clearFilters()">
              {{ 'audit.clearFilters' | translate }}
            </app-button>
          </div>
        </div>

        <!-- Table -->
        <app-table
          [columns]="columns"
          [data]="filteredLogs"
          [pagination]="pagination"
          [loading]="loading"
          [emptyMessage]="'audit.noLogs' | translate"
          (onPageChange)="onPageChange($event)"
        />
      </div>
    </div>
  `,
  styles: []
})
export class AuditLogsComponent implements OnInit {
  loading = false;
  filters = {
    entityType: '',
    user: '',
    action: '',
    fromDate: '',
    toDate: ''
  };

  // Mock data
  allLogs: AuditLog[] = [
    {
      id: '1',
      timestamp: new Date('2024-11-27T10:30:00'),
      user: 'John Doe',
      action: 'Updated',
      entity: 'Patient',
      entityId: 'PAT001',
      details: 'Updated phone number'
    },
    {
      id: '2',
      timestamp: new Date('2024-11-27T09:15:00'),
      user: 'Jane Smith',
      action: 'Created',
      entity: 'Invoice',
      entityId: 'INV001',
      details: 'Created new invoice'
    },
    {
      id: '3',
      timestamp: new Date('2024-11-26T14:20:00'),
      user: 'John Doe',
      action: 'Deleted',
      entity: 'Drug',
      entityId: 'DRG001',
      details: 'Deleted drug'
    },
    {
      id: '4',
      timestamp: new Date('2024-11-26T11:45:00'),
      user: 'Jane Smith',
      action: 'Viewed',
      entity: 'Patient',
      entityId: 'PAT002',
      details: 'Viewed patient profile'
    },
    {
      id: '5',
      timestamp: new Date('2024-11-25T16:30:00'),
      user: 'John Doe',
      action: 'Created',
      entity: 'Purchase',
      entityId: 'PUR001',
      details: 'Created purchase invoice'
    }
  ];

  filteredLogs: AuditLog[] = [];
  pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  };

  columns: TableColumn[] = [
    { key: 'timestamp', label: 'patient.audit.timestamp', sortable: true },
    { key: 'user', label: 'patient.audit.user', sortable: true },
    { key: 'action', label: 'patient.audit.action', sortable: true },
    { key: 'entity', label: 'patient.audit.entity', sortable: true },
    { key: 'entityId', label: 'patient.audit.entityId', sortable: false }
  ];

  ngOnInit(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.loading = true;
    
    let filtered = [...this.allLogs];

    if (this.filters.entityType) {
      filtered = filtered.filter(log => log.entity === this.filters.entityType);
    }

    if (this.filters.user) {
      filtered = filtered.filter(log => 
        log.user.toLowerCase().includes(this.filters.user.toLowerCase())
      );
    }

    if (this.filters.action) {
      filtered = filtered.filter(log => log.action === this.filters.action);
    }

    if (this.filters.fromDate) {
      const fromDate = new Date(this.filters.fromDate);
      filtered = filtered.filter(log => log.timestamp >= fromDate);
    }

    if (this.filters.toDate) {
      const toDate = new Date(this.filters.toDate);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => log.timestamp <= toDate);
    }

    // Apply pagination
    const start = (this.pagination.page - 1) * this.pagination.pageSize;
    const end = start + this.pagination.pageSize;
    this.filteredLogs = filtered.slice(start, end);

    this.pagination.total = filtered.length;
    this.pagination.totalPages = Math.ceil(filtered.length / this.pagination.pageSize);

    this.loading = false;
  }

  clearFilters(): void {
    this.filters = {
      entityType: '',
      user: '',
      action: '',
      fromDate: '',
      toDate: ''
    };
    this.pagination.page = 1;
    this.applyFilters();
  }

  onPageChange(page: number): void {
    this.pagination.page = page;
    this.applyFilters();
  }
}

