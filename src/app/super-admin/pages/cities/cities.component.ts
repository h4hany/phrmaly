/**
 * Cities Master Data Component
 * 
 * Classification: PAGE MODIFICATION + SYSTEM EXTENSION
 * 
 * Business Purpose: Manage cities master data
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
  selector: 'app-cities',
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
          <h1 class="text-2xl font-bold text-[var(--text-primary)]">{{ 'platform.cities.title' | translate }}</h1>
          <p class="text-sm text-[var(--card-text)] mt-1">{{ 'platform.cities.subtitle' | translate }}</p>
        </div>
        <app-button variant="primary" (onClick)="showCreateModal = true">
          <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ 'platform.cities.addCity' | translate }}
        </app-button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <app-stat-card
          [label]="'platform.cities.totalCities'"
          [value]="totalCities"
          [icon]="'building'"
        />
        <app-stat-card
          [label]="'platform.cities.activeCities'"
          [value]="activeCities"
          [icon]="'check-circle'"
        />
        <app-stat-card
          [label]="'platform.cities.inactiveCities'"
          [value]="inactiveCities"
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
              [placeholder]="'platform.cities.searchPlaceholder' | translate"
              class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.cities.status' | translate }}</label>
            <select
              [(ngModel)]="filters.isActive"
              class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
            >
              <option [value]="undefined">{{ 'common.all' | translate }}</option>
              <option [value]="true">{{ 'platform.cities.active' | translate }}</option>
              <option [value]="false">{{ 'platform.cities.inactive' | translate }}</option>
            </select>
          </div>
          <div class="flex items-end">
            <app-button variant="primary" size="sm" (onClick)="applyFilters()">
              {{ 'common.search' | translate }}
            </app-button>
          </div>
        </div>
      </div>

      <!-- Cities Table -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
        <app-table
          [columns]="columns"
          [data]="cities"
          [pagination]="pagination"
          [loading]="loading"
          [emptyMessage]="'platform.cities.noCities' | translate"
          (onPageChange)="onPageChange($event)"
          (onRowClick)="viewCity($event)"
        />
      </div>
    </div>

    <!-- City Detail Modal -->
    @if (selectedCity) {
      <app-modal
        #cityModal
        [title]="selectedCity.name"
        [showFooter]="true"
        [confirmText]="'common.close' | translate"
        (confirmed)="selectedCity = null"
      >
        <div class="space-y-6">
          <!-- City Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.cities.name' | translate }}</label>
              <p class="text-[var(--text-primary)]">{{ selectedCity.name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.cities.country' | translate }}</label>
              <p class="text-[var(--text-primary)]">{{ selectedCity.country || '-' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.cities.status' | translate }}</label>
              <p class="text-[var(--text-primary)]">{{ selectedCity.isActive ? ('platform.cities.active' | translate) : ('platform.cities.inactive' | translate) }}</p>
            </div>
          </div>
        </div>
      </app-modal>
    }
  `,
  styles: []
})
export class CitiesComponent implements OnInit {
  private translationService = inject(TranslationService);

  loading = false;
  cities: any[] = [];
  selectedCity: any | null = null;

  filters = {
    search: '',
    isActive: undefined as boolean | undefined
  };

  totalCities = 0;
  activeCities = 0;
  inactiveCities = 0;

  pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  };

  columns: TableColumn[] = [
    { key: 'name', label: 'platform.cities.name', sortable: true },
    { key: 'country', label: 'platform.cities.country', sortable: true },
    { key: 'isActive', label: 'platform.cities.status', sortable: true }
  ];

  showCreateModal = false;

  ngOnInit(): void {
    this.loadCities();
  }

  loadCities(): void {
    this.loading = true;
    // TODO: Implement API call
    setTimeout(() => {
      this.cities = [];
      this.totalCities = 0;
      this.activeCities = 0;
      this.inactiveCities = 0;
      this.pagination.total = 0;
      this.pagination.totalPages = 0;
      this.loading = false;
    }, 500);
  }

  applyFilters(): void {
    this.pagination.page = 1;
    this.loadCities();
  }

  onPageChange(page: number): void {
    this.pagination.page = page;
    this.loadCities();
  }

  viewCity(city: any): void {
    this.selectedCity = city;
  }
}

