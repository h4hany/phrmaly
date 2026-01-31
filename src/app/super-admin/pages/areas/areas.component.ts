/**
 * Areas Master Data Component
 *
 * Classification: PAGE MODIFICATION + SYSTEM EXTENSION
 *
 * Business Purpose: Manage areas master data
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
import { PlatformAreasService, Area } from '../../../core/services/platform-areas.service';

@Component({
  selector: 'app-areas',
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
          <h1 class="text-2xl font-bold text-[var(--text-primary)]">{{ 'platform.areas.title' | translate }}</h1>
          <p class="text-sm text-[var(--card-text)] mt-1">{{ 'platform.areas.subtitle' | translate }}</p>
        </div>
        <app-button variant="primary" (onClick)="showCreateModal = true">
          <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ 'platform.areas.addArea' | translate }}
        </app-button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <app-stat-card
          [label]="'platform.areas.totalAreas'"
          [value]="totalAreas"
          [icon]="'map-pin'"
        />
        <app-stat-card
          [label]="'platform.areas.activeAreas'"
          [value]="activeAreas"
          [icon]="'check-circle'"
        />
        <app-stat-card
          [label]="'platform.areas.inactiveAreas'"
          [value]="inactiveAreas"
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
              [placeholder]="'platform.areas.searchPlaceholder' | translate"
              class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.areas.status' | translate }}</label>
            <select
              [(ngModel)]="filters.isActive"
              class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
            >
              <option [value]="undefined">{{ 'common.all' | translate }}</option>
              <option [value]="true">{{ 'platform.areas.active' | translate }}</option>
              <option [value]="false">{{ 'platform.areas.inactive' | translate }}</option>
            </select>
          </div>
          <div class="flex items-end">
            <app-button variant="primary" size="sm" (onClick)="applyFilters()">
              {{ 'common.search' | translate }}
            </app-button>
          </div>
        </div>
      </div>

      <!-- Areas Table -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
        <app-table
          [columns]="columns"
          [data]="areas"
          [pagination]="pagination"
          [loading]="loading"
          [emptyMessage]="'platform.areas.noAreas' | translate"
          (onPageChange)="onPageChange($event)"
          (onRowClick)="viewArea($event)"
        />
      </div>
    </div>

    <!-- Area Detail Modal -->
    @if (selectedArea) {
      <app-modal
        #areaModal
        [title]="selectedArea.name"
        [showFooter]="true"
        [confirmText]="'common.close' | translate"
        (confirmed)="selectedArea = null"
      >
        <div class="space-y-6">
          <!-- Area Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.areas.name' | translate }}</label>
              <p class="text-[var(--text-primary)]">{{ selectedArea.name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.areas.city' | translate }}</label>
              <p class="text-[var(--text-primary)]">{{ selectedArea.city?.name || '-' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.areas.country' | translate }}</label>
              <p class="text-[var(--text-primary)]">{{ selectedArea.country?.name || '-' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.areas.status' | translate }}</label>
              <p class="text-[var(--text-primary)]">{{ selectedArea.isActive ? ('platform.areas.active' | translate) : ('platform.areas.inactive' | translate) }}</p>
            </div>
          </div>
        </div>
      </app-modal>
    }
  `,
  styles: []
})
export class AreasComponent implements OnInit {
  private translationService = inject(TranslationService);
  private areasService = inject(PlatformAreasService);

  loading = false;
  areas: Area[] = [];
  selectedArea: Area | null = null;

  filters = {
    search: '',
    isActive: undefined as boolean | undefined
  };

  totalAreas = 0;
  activeAreas = 0;
  inactiveAreas = 0;

  pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  };

  columns: TableColumn[] = [
    { key: 'name', label: 'platform.areas.name', sortable: true },
    { key: 'cityName', label: 'platform.areas.city', sortable: true },
    { key: 'isActive', label: 'platform.areas.status', sortable: true }
  ];

  showCreateModal = false;

  ngOnInit(): void {
    this.loadAreas();
  }

  loadAreas(): void {
    this.loading = true;

    const params = {
      page: this.pagination.page,
      pageSize: this.pagination.pageSize,
      ...(this.filters.search && { searchTerm: this.filters.search }),
      ...(this.filters.isActive !== undefined && { isActive: this.filters.isActive })
    };

    this.areasService.getAll(params).subscribe({
      next: (response) => {
        // Map areas for table display
        this.areas = response.data.map(area => ({
          ...area,
          cityName: area.city?.name || area.cityName || '-'
        }));
        this.pagination.total = response.total;
        this.pagination.totalPages = response.totalPages;
        this.pagination.page = response.page;
        this.pagination.pageSize = response.pageSize;

        // Calculate stats
        this.totalAreas = response.total;
        this.activeAreas = response.data.filter(a => a.isActive).length;
        this.inactiveAreas = response.data.filter(a => !a.isActive).length;

        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load areas:', error);
        this.areas = [];
        this.totalAreas = 0;
        this.activeAreas = 0;
        this.inactiveAreas = 0;
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.pagination.page = 1;
    this.loadAreas();
  }

  onPageChange(page: number): void {
    this.pagination.page = page;
    this.loadAreas();
  }

  viewArea(area: any): void {
    this.selectedArea = area;
  }
}

