/**
 * Occupations Master Data Component
 * 
 * Classification: PAGE MODIFICATION + SYSTEM EXTENSION
 * 
 * Business Purpose: Manage occupations master data
 */

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-occupations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableComponent,
    ButtonComponent,
    TranslatePipe,
    ModalComponent,
    StatCardComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-[var(--text-primary)]">{{ 'platform.occupations.title' | translate }}</h1>
          <p class="text-sm text-[var(--card-text)] mt-1">{{ 'platform.occupations.subtitle' | translate }}</p>
        </div>
        <app-button variant="primary" (onClick)="showCreateModal = true">
          <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ 'platform.occupations.addOccupation' | translate }}
        </app-button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <app-stat-card
          [label]="'platform.occupations.totalOccupations'"
          [value]="totalOccupations"
          [icon]="'briefcase'"
        />
        <app-stat-card
          [label]="'platform.occupations.activeOccupations'"
          [value]="activeOccupations"
          [icon]="'check-circle'"
        />
        <app-stat-card
          [label]="'platform.occupations.inactiveOccupations'"
          [value]="inactiveOccupations"
          [icon]="'x-circle'"
        />
      </div>

      <!-- Filters -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'common.search' | translate }}</label>
            <input
              type="text"
              [(ngModel)]="filters.search"
              [placeholder]="'platform.occupations.searchPlaceholder' | translate"
              class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.occupations.status' | translate }}</label>
            <select
              [(ngModel)]="filters.isActive"
              class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
            >
              <option [value]="undefined">{{ 'common.all' | translate }}</option>
              <option [value]="true">{{ 'platform.occupations.active' | translate }}</option>
              <option [value]="false">{{ 'platform.occupations.inactive' | translate }}</option>
            </select>
          </div>
          <div class="flex items-end">
            <app-button variant="primary" size="sm" (onClick)="applyFilters()">
              {{ 'common.search' | translate }}
            </app-button>
          </div>
        </div>
      </div>

      <!-- Occupations Table -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
        <app-table
          [columns]="columns"
          [data]="occupations"
          [pagination]="pagination"
          [loading]="loading"
          [emptyMessage]="'platform.occupations.noOccupations' | translate"
          (onPageChange)="onPageChange($event)"
          (onRowClick)="viewOccupation($event)"
        />
      </div>
    </div>

    <!-- Occupation Detail Modal -->
    @if (selectedOccupation) {
      <app-modal
        #occupationModal
        [title]="selectedOccupation.name"
        [showFooter]="true"
        [confirmText]="'common.close' | translate"
        (confirmed)="selectedOccupation = null"
      >
        <div class="space-y-6">
          <!-- Occupation Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.occupations.name' | translate }}</label>
              <p class="text-[var(--text-primary)]">{{ selectedOccupation.name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.occupations.status' | translate }}</label>
              <p class="text-[var(--text-primary)]">{{ selectedOccupation.isActive ? ('platform.occupations.active' | translate) : ('platform.occupations.inactive' | translate) }}</p>
            </div>
          </div>
        </div>
      </app-modal>
    }
  `,
  styles: []
})
export class OccupationsComponent implements OnInit {
  private translationService = inject(TranslationService);

  loading = false;
  occupations: any[] = [];
  selectedOccupation: any | null = null;

  filters = {
    search: '',
    isActive: undefined as boolean | undefined
  };

  totalOccupations = 0;
  activeOccupations = 0;
  inactiveOccupations = 0;

  pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  };

  columns: TableColumn[] = [
    { key: 'name', label: 'platform.occupations.name', sortable: true },
    { key: 'isActive', label: 'platform.occupations.status', sortable: true }
  ];

  showCreateModal = false;

  ngOnInit(): void {
    this.loadOccupations();
  }

  loadOccupations(): void {
    this.loading = true;
    // TODO: Implement API call
    setTimeout(() => {
      this.occupations = [];
      this.totalOccupations = 0;
      this.activeOccupations = 0;
      this.inactiveOccupations = 0;
      this.pagination.total = 0;
      this.pagination.totalPages = 0;
      this.loading = false;
    }, 500);
  }

  applyFilters(): void {
    this.pagination.page = 1;
    this.loadOccupations();
  }

  onPageChange(page: number): void {
    this.pagination.page = page;
    this.loadOccupations();
  }

  viewOccupation(occupation: any): void {
    this.selectedOccupation = occupation;
  }
}

