/**
 * Support & Ticket Center Component
 * 
 * Classification: NEW PAGE
 * 
 * Business Purpose: Centralize all pharmacy support operations
 */

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatformTicketsService } from '../../../core/services/platform-tickets.service';
import { SupportTicket } from '../../../core/models/platform.model';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-support',
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
        <h1 class="text-2xl font-bold text-[var(--text-primary)]">{{ 'platform.support.title' | translate }}</h1>
        <p class="text-sm text-[var(--card-text)] mt-1">{{ 'platform.support.subtitle' | translate }}</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <app-stat-card
          [label]="'platform.support.openTickets'"
          [value]="openTickets"
          [icon]="'alert'"
        />
        <app-stat-card
          [label]="'platform.support.inProgress'"
          [value]="inProgressTickets"
          [icon]="'clock'"
        />
        <app-stat-card
          [label]="'platform.support.resolved'"
          [value]="resolvedTickets"
          [icon]="'check-circle'"
        />
        <app-stat-card
          [label]="'platform.support.avgResponseTime'"
          [value]="avgResponseTime + 'h'"
          [icon]="'chart'"
        />
      </div>

      <!-- Filters -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.support.status' | translate }}</label>
            <select
              [(ngModel)]="filters.status"
              class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
            >
              <option value="">{{ 'common.all' | translate }}</option>
              <option value="open">{{ 'platform.support.statusOpen' | translate }}</option>
              <option value="assigned">{{ 'platform.support.statusAssigned' | translate }}</option>
              <option value="in_progress">{{ 'platform.support.statusInProgress' | translate }}</option>
              <option value="resolved">{{ 'platform.support.statusResolved' | translate }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.support.priority' | translate }}</label>
            <select
              [(ngModel)]="filters.priority"
              class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
            >
              <option value="">{{ 'common.all' | translate }}</option>
              <option value="urgent">{{ 'platform.support.priorityUrgent' | translate }}</option>
              <option value="high">{{ 'platform.support.priorityHigh' | translate }}</option>
              <option value="medium">{{ 'platform.support.priorityMedium' | translate }}</option>
              <option value="low">{{ 'platform.support.priorityLow' | translate }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.support.category' | translate }}</label>
            <select
              [(ngModel)]="filters.category"
              class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
            >
              <option value="">{{ 'common.all' | translate }}</option>
              <option value="technical">{{ 'platform.support.categoryTechnical' | translate }}</option>
              <option value="billing">{{ 'platform.support.categoryBilling' | translate }}</option>
              <option value="feature_request">{{ 'platform.support.categoryFeatureRequest' | translate }}</option>
              <option value="bug">{{ 'platform.support.categoryBug' | translate }}</option>
            </select>
          </div>
          <div class="flex items-end">
            <app-button variant="primary" size="sm" (onClick)="applyFilters()">
              {{ 'common.search' | translate }}
            </app-button>
          </div>
        </div>
      </div>

      <!-- Tickets Table -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
        <app-table
          [columns]="columns"
          [data]="tickets"
          [pagination]="pagination"
          [loading]="loading"
          [emptyMessage]="'platform.support.noTickets' | translate"
          (onPageChange)="onPageChange($event)"
          (onRowClick)="viewTicket($event)"
        />
      </div>
    </div>

    <!-- Ticket Detail Modal -->
    @if (selectedTicket) {
      <app-modal
        #ticketModal
        [title]="selectedTicket.subject"
        [showFooter]="true"
        [confirmText]="'common.close' | translate"
        (confirmed)="selectedTicket = null"
      >
        <div class="space-y-6">
          <!-- Ticket Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.support.status' | translate }}</label>
              <app-badge [variant]="getStatusVariant(selectedTicket.status)">
                {{ getStatusLabel(selectedTicket.status) | translate }}
              </app-badge>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.support.priority' | translate }}</label>
              <app-badge [variant]="getPriorityVariant(selectedTicket.priority)">
                {{ getPriorityLabel(selectedTicket.priority) | translate }}
              </app-badge>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.support.category' | translate }}</label>
              <p class="text-[var(--text-primary)]">{{ getCategoryLabel(selectedTicket.category) | translate }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.support.createdAt' | translate }}</label>
              <p class="text-[var(--text-primary)]">{{ selectedTicket.createdAt | date:'short' }}</p>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.support.description' | translate }}</label>
            <p class="text-[var(--text-primary)] whitespace-pre-wrap">{{ selectedTicket.description }}</p>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            @if (selectedTicket.status === 'open') {
              <app-button variant="primary" size="sm" (onClick)="assignTicket()">
                {{ 'platform.support.assign' | translate }}
              </app-button>
            }
            @if (selectedTicket.status === 'assigned' || selectedTicket.status === 'in_progress') {
              <app-button variant="primary" size="sm" (onClick)="resolveTicket()">
                {{ 'platform.support.resolve' | translate }}
              </app-button>
            }
          </div>
        </div>
      </app-modal>
    }
  `,
  styles: []
})
export class SupportComponent implements OnInit {
  private ticketsService = inject(PlatformTicketsService);
  private translationService = inject(TranslationService);

  loading = false;
  tickets: any[] = [];
  selectedTicket: SupportTicket | null = null;

  filters = {
    status: '',
    priority: '',
    category: ''
  };

  openTickets = 0;
  inProgressTickets = 0;
  resolvedTickets = 0;
  avgResponseTime = 2.5;

  pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  };

  columns: TableColumn[] = [
    { key: 'subject', label: 'platform.support.subject', sortable: true },
    { key: 'accountId', label: 'platform.support.account', sortable: true },
    { key: 'priority', label: 'platform.support.priority', sortable: true },
    { key: 'status', label: 'platform.support.status', sortable: true },
    { key: 'createdAt', label: 'platform.support.createdAt', sortable: true }
  ];

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading = true;
    this.ticketsService.getAll({
      page: this.pagination.page,
      pageSize: this.pagination.pageSize,
      status: this.filters.status || undefined,
      priority: this.filters.priority || undefined,
      category: this.filters.category || undefined
    }).subscribe({
      next: (response) => {
        this.tickets = response.data.map((ticket: SupportTicket) => ({
          ...ticket,
          priority: this.translationService.translate(this.getPriorityLabel(ticket.priority)),
          status: this.translationService.translate(this.getStatusLabel(ticket.status)),
          createdAt: new Date(ticket.createdAt).toLocaleDateString()
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

  calculateStats(tickets: SupportTicket[]): void {
    this.openTickets = tickets.filter(t => t.status === 'open').length;
    this.inProgressTickets = tickets.filter(t => t.status === 'in_progress' || t.status === 'assigned').length;
    this.resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
  }

  applyFilters(): void {
    this.pagination.page = 1;
    this.loadTickets();
  }

  onPageChange(page: number): void {
    this.pagination.page = page;
    this.loadTickets();
  }

  viewTicket(ticket: any): void {
    this.ticketsService.getById(ticket.id).subscribe({
      next: (ticket) => {
        this.selectedTicket = ticket;
      }
    });
  }

  assignTicket(): void {
    if (!this.selectedTicket) return;
    this.ticketsService.assignTicket(this.selectedTicket.id, 'admin001').subscribe({
      next: (ticket) => {
        this.selectedTicket = ticket;
        this.loadTickets();
      }
    });
  }

  resolveTicket(): void {
    if (!this.selectedTicket) return;
    this.ticketsService.updateStatus(this.selectedTicket.id, 'resolved').subscribe({
      next: (ticket) => {
        this.selectedTicket = ticket;
        this.loadTickets();
      }
    });
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      open: 'platform.support.statusOpen',
      assigned: 'platform.support.statusAssigned',
      in_progress: 'platform.support.statusInProgress',
      resolved: 'platform.support.statusResolved',
      closed: 'platform.support.statusClosed'
    };
    return labels[status] || status;
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    const variants: { [key: string]: 'success' | 'warning' | 'danger' | 'info' | 'default' } = {
      open: 'danger',
      assigned: 'warning',
      in_progress: 'info',
      resolved: 'success',
      closed: 'default'
    };
    return variants[status] || 'default';
  }

  getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      urgent: 'platform.support.priorityUrgent',
      high: 'platform.support.priorityHigh',
      medium: 'platform.support.priorityMedium',
      low: 'platform.support.priorityLow'
    };
    return labels[priority] || priority;
  }

  getPriorityVariant(priority: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    const variants: { [key: string]: 'success' | 'warning' | 'danger' | 'info' | 'default' } = {
      urgent: 'danger',
      high: 'warning',
      medium: 'info',
      low: 'default'
    };
    return variants[priority] || 'default';
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      technical: 'platform.support.categoryTechnical',
      billing: 'platform.support.categoryBilling',
      feature_request: 'platform.support.categoryFeatureRequest',
      bug: 'platform.support.categoryBug',
      other: 'platform.support.categoryOther'
    };
    return labels[category] || category;
  }
}
