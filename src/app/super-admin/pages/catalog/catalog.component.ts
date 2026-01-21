/**
 * Global Drug Index (Catalog) Component
 * 
 * Classification: PAGE MODIFICATION + SYSTEM EXTENSION
 * 
 * Business Purpose: Maintain a single source of truth for all drugs used by all pharmacies
 */

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatformCatalogService } from '../../../core/services/platform-catalog.service';
import { GlobalDrug } from '../../../core/models/platform.model';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-catalog',
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
          <h1 class="text-2xl font-bold text-[var(--text-primary)]">{{ 'platform.catalog.title' | translate }}</h1>
          <p class="text-sm text-[var(--card-text)] mt-1">{{ 'platform.catalog.subtitle' | translate }}</p>
        </div>
        <app-button variant="primary" (onClick)="showCreateModal = true">
          <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ 'platform.catalog.addDrug' | translate }}
        </app-button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <app-stat-card
          [label]="'platform.catalog.totalDrugs'"
          [value]="totalDrugs"
          [icon]="'pill-bottle'"
        />
        <app-stat-card
          [label]="'platform.catalog.activeDrugs'"
          [value]="activeDrugs"
          [icon]="'check-circle'"
        />
        <app-stat-card
          [label]="'platform.catalog.inactiveDrugs'"
          [value]="inactiveDrugs"
          [icon]="'x-circle'"
        />
        <app-stat-card
          [label]="'platform.catalog.avgPharmaciesPerDrug'"
          [value]="avgPharmaciesPerDrug"
          [icon]="'users'"
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
              [placeholder]="'platform.catalog.searchPlaceholder' | translate"
              class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.catalog.status' | translate }}</label>
            <select
              [(ngModel)]="filters.isActive"
              class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
            >
              <option [value]="undefined">{{ 'common.all' | translate }}</option>
              <option [value]="true">{{ 'platform.catalog.active' | translate }}</option>
              <option [value]="false">{{ 'platform.catalog.inactive' | translate }}</option>
            </select>
          </div>
          <div class="flex items-end">
            <app-button variant="primary" size="sm" (onClick)="applyFilters()">
              {{ 'common.search' | translate }}
            </app-button>
          </div>
        </div>
      </div>

      <!-- Drugs Table -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
        <app-table
          [columns]="columns"
          [data]="drugs"
          [pagination]="pagination"
          [loading]="loading"
          [emptyMessage]="'platform.catalog.noDrugs' | translate"
          (onPageChange)="onPageChange($event)"
          (onRowClick)="viewDrug($event)"
        />
      </div>
    </div>

    <!-- Drug Detail Modal -->
    @if (selectedDrug) {
      <app-modal
        #drugModal
        [title]="selectedDrug.name"
        [showFooter]="true"
        [confirmText]="'common.close' | translate"
        (confirmed)="selectedDrug = null"
      >
        <div class="space-y-6">
          <!-- Drug Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.catalog.genericName' | translate }}</label>
              <p class="text-[var(--text-primary)]">{{ selectedDrug.genericName }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.catalog.barcode' | translate }}</label>
              <p class="text-[var(--text-primary)]">{{ selectedDrug.barcode || '-' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.catalog.atcCode' | translate }}</label>
              <p class="text-[var(--text-primary)]">{{ selectedDrug.atcCode || '-' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.catalog.therapeuticClass' | translate }}</label>
              <p class="text-[var(--text-primary)]">{{ selectedDrug.therapeuticClass || '-' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.catalog.manufacturer' | translate }}</label>
              <p class="text-[var(--text-primary)]">{{ selectedDrug.manufacturer || '-' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.catalog.affectedPharmacies' | translate }}</label>
              <p class="text-[var(--text-primary)]">{{ selectedDrug.affectedPharmacies || 0 }}</p>
            </div>
          </div>

          <!-- Impact Warning -->
          @if (selectedDrug.affectedPharmacies && selectedDrug.affectedPharmacies > 0) {
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p class="text-sm text-yellow-800">
                {{ 'platform.catalog.impactWarning' | translate }}: {{ selectedDrug.affectedPharmacies }} {{ 'platform.catalog.pharmacies' | translate }}
              </p>
            </div>
          }
        </div>
      </app-modal>
    }
  `,
  styles: []
})
export class CatalogComponent implements OnInit {
  private catalogService = inject(PlatformCatalogService);
  private translationService = inject(TranslationService);

  loading = false;
  drugs: any[] = [];
  selectedDrug: GlobalDrug | null = null;

  filters = {
    search: '',
    isActive: undefined as boolean | undefined
  };

  totalDrugs = 0;
  activeDrugs = 0;
  inactiveDrugs = 0;
  avgPharmaciesPerDrug = 0;

  pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  };

  columns: TableColumn[] = [
    { key: 'name', label: 'platform.catalog.name', sortable: true },
    { key: 'genericName', label: 'platform.catalog.genericName', sortable: true },
    { key: 'barcode', label: 'platform.catalog.barcode', sortable: true },
    { key: 'therapeuticClass', label: 'platform.catalog.therapeuticClass', sortable: true },
    { key: 'affectedPharmacies', label: 'platform.catalog.affectedPharmacies', sortable: true },
    { key: 'isActive', label: 'platform.catalog.status', sortable: true }
  ];

  showCreateModal = false;

  ngOnInit(): void {
    this.loadDrugs();
  }

  loadDrugs(): void {
    this.loading = true;
    this.catalogService.getAll({
      page: this.pagination.page,
      pageSize: this.pagination.pageSize,
      search: this.filters.search || undefined,
      isActive: this.filters.isActive
    }).subscribe({
      next: (response) => {
        this.drugs = response.data.map((drug: GlobalDrug) => ({
          ...drug,
          isActive: drug.isActive ? this.translationService.translate('platform.catalog.active') : this.translationService.translate('platform.catalog.inactive'),
          affectedPharmacies: drug.affectedPharmacies || 0
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

  calculateStats(drugs: GlobalDrug[]): void {
    this.totalDrugs = drugs.length;
    this.activeDrugs = drugs.filter(d => d.isActive).length;
    this.inactiveDrugs = drugs.filter(d => !d.isActive).length;
    const totalPharmacies = drugs.reduce((sum, d) => sum + (d.affectedPharmacies || 0), 0);
    this.avgPharmaciesPerDrug = this.totalDrugs > 0 ? Math.round(totalPharmacies / this.totalDrugs) : 0;
  }

  applyFilters(): void {
    this.pagination.page = 1;
    this.loadDrugs();
  }

  onPageChange(page: number): void {
    this.pagination.page = page;
    this.loadDrugs();
  }

  viewDrug(drug: any): void {
    this.catalogService.getById(drug.id).subscribe({
      next: (drug) => {
        this.selectedDrug = drug;
      }
    });
  }
}
