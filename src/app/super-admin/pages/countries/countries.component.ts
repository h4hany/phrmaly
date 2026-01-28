/**
 * Countries Master Data Component
 * 
 * Classification: PAGE MODIFICATION + SYSTEM EXTENSION
 * 
 * Business Purpose: Manage countries master data
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
import { PlatformCountriesService, Country } from '../../../core/services/platform-countries.service';

@Component({
  selector: 'app-countries',
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
          <h1 class="text-2xl font-bold text-[var(--text-primary)]">{{ 'platform.countries.title' | translate }}</h1>
          <p class="text-sm text-[var(--card-text)] mt-1">{{ 'platform.countries.subtitle' | translate }}</p>
        </div>
        <app-button variant="primary" (onClick)="showCreateModal = true">
          <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ 'platform.countries.addCountry' | translate }}
        </app-button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <app-stat-card
          [label]="'platform.countries.totalCountries'"
          [value]="totalCountries"
          [icon]="'globe'"
        />
        <app-stat-card
          [label]="'platform.countries.activeCountries'"
          [value]="activeCountries"
          [icon]="'check-circle'"
        />
        <app-stat-card
          [label]="'platform.countries.inactiveCountries'"
          [value]="inactiveCountries"
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
              [placeholder]="'platform.countries.searchPlaceholder' | translate"
              class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.countries.status' | translate }}</label>
            <select
              [(ngModel)]="filters.isActive"
              class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
            >
              <option [value]="undefined">{{ 'common.all' | translate }}</option>
              <option [value]="true">{{ 'platform.countries.active' | translate }}</option>
              <option [value]="false">{{ 'platform.countries.inactive' | translate }}</option>
            </select>
          </div>
          <div class="flex items-end">
            <app-button variant="primary" size="sm" (onClick)="applyFilters()">
              {{ 'common.search' | translate }}
            </app-button>
          </div>
        </div>
      </div>

      <!-- Countries Table -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
        <app-table
          [columns]="columns"
          [data]="countries"
          [pagination]="pagination"
          [loading]="loading"
          [emptyMessage]="'platform.countries.noCountries' | translate"
          (onPageChange)="onPageChange($event)"
          (onRowClick)="viewCountry($event)"
        />
      </div>
    </div>

    <!-- Country Detail Modal -->
    @if (selectedCountry) {
      <app-modal
        #countryModal
        [title]="selectedCountry.name"
        [showFooter]="true"
        [confirmText]="'common.close' | translate"
        (confirmed)="selectedCountry = null"
      >
        <div class="space-y-6">
          <!-- Country Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.countries.name' | translate }}</label>
              <p class="text-[var(--text-primary)]">{{ selectedCountry.name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.countries.code' | translate }}</label>
              <p class="text-[var(--text-primary)]">{{ selectedCountry.code || '-' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.countries.status' | translate }}</label>
              <p class="text-[var(--text-primary)]">{{ selectedCountry.isActive ? ('platform.countries.active' | translate) : ('platform.countries.inactive' | translate) }}</p>
            </div>
          </div>
        </div>
      </app-modal>
    }
  `,
  styles: []
})
export class CountriesComponent implements OnInit {
  private translationService = inject(TranslationService);
  private countriesService = inject(PlatformCountriesService);

  loading = false;
  countries: Country[] = [];
  selectedCountry: Country | null = null;

  filters = {
    search: '',
    isActive: undefined as boolean | undefined
  };

  totalCountries = 0;
  activeCountries = 0;
  inactiveCountries = 0;

  pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  };

  columns: TableColumn[] = [
    { key: 'name', label: 'platform.countries.name', sortable: true },
    { key: 'code', label: 'platform.countries.code', sortable: true },
    { key: 'isActive', label: 'platform.countries.status', sortable: true }
  ];

  showCreateModal = false;

  ngOnInit(): void {
    this.loadCountries();
  }

  loadCountries(): void {
    this.loading = true;
    
    const params = {
      page: this.pagination.page,
      pageSize: this.pagination.pageSize,
      ...(this.filters.search && { searchTerm: this.filters.search }),
      ...(this.filters.isActive !== undefined && { isActive: this.filters.isActive })
    };

    this.countriesService.getAll(params).subscribe({
      next: (response) => {
        this.countries = response.data;
        this.pagination.total = response.total;
        this.pagination.totalPages = response.totalPages;
        this.pagination.page = response.page;
        this.pagination.pageSize = response.pageSize;
        
        // Calculate stats
        this.totalCountries = response.total;
        this.activeCountries = this.countries.filter(c => c.isActive).length;
        this.inactiveCountries = this.countries.filter(c => !c.isActive).length;
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load countries:', error);
        this.countries = [];
        this.totalCountries = 0;
        this.activeCountries = 0;
        this.inactiveCountries = 0;
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.pagination.page = 1;
    this.loadCountries();
  }

  onPageChange(page: number): void {
    this.pagination.page = page;
    this.loadCountries();
  }

  viewCountry(country: any): void {
    this.selectedCountry = country;
  }
}

