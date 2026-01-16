/**
 * Training & Certification Component (Staff Academy)
 * 
 * Classification: NEW PAGE
 * 
 * Business Purpose: Reduce mistakes and increase staff loyalty
 */

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrainingService } from '../../../core/services/training.service';
import { TrainingModule, Certification } from '../../../core/models/hr.model';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { TabsComponent, TabComponent } from '../../../shared/components/tabs/tabs.component';
import { PharmacyStaffService } from '../../../core/services/pharmacy-staff.service';

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableComponent,
    ButtonComponent,
    TranslatePipe,
    BadgeComponent,
    TabsComponent,
    TabComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-[var(--text-primary)]">{{ 'hr.training.title' | translate }}</h1>
        <app-button variant="primary">
          <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ 'hr.training.createModule' | translate }}
        </app-button>
      </div>

      <app-tabs>
        <!-- Training Modules -->
        <app-tab [title]="'hr.training.modules' | translate" [active]="true">
          <div class="space-y-6 p-6">
            <!-- Filters -->
            <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'hr.training.category' | translate }}</label>
                  <select
                    [(ngModel)]="filters.category"
                    class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
                  >
                    <option value="">{{ 'common.all' | translate }}</option>
                    <option value="safety">{{ 'hr.training.categorySafety' | translate }}</option>
                    <option value="compliance">{{ 'hr.training.categoryCompliance' | translate }}</option>
                    <option value="sales">{{ 'hr.training.categorySales' | translate }}</option>
                    <option value="inventory">{{ 'hr.training.categoryInventory' | translate }}</option>
                    <option value="customer_service">{{ 'hr.training.categoryCustomerService' | translate }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'hr.training.required' | translate }}</label>
                  <select
                    [(ngModel)]="filters.isRequired"
                    class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
                  >
                    <option value="">{{ 'common.all' | translate }}</option>
                    <option [value]="true">{{ 'common.yes' | translate }}</option>
                    <option [value]="false">{{ 'common.no' | translate }}</option>
                  </select>
                </div>
                <div class="flex items-end">
                  <app-button variant="primary" size="sm" (onClick)="applyFilters()">
                    {{ 'common.search' | translate }}
                  </app-button>
                </div>
              </div>
            </div>

            <!-- Modules Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (module of modules; track module.id) {
                <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6 hover:shadow-md transition-shadow">
                  <div class="flex items-start justify-between mb-4">
                    <h3 class="text-lg font-semibold text-[var(--text-primary)]">{{ module.title }}</h3>
                    @if (module.isRequired) {
                      <app-badge variant="warning">{{ 'hr.training.required' | translate }}</app-badge>
                    }
                  </div>
                  <p class="text-sm text-[var(--card-text)] mb-4">{{ module.description }}</p>
                  <div class="flex items-center justify-between text-xs text-[var(--card-text)] mb-4">
                    <span>{{ 'hr.training.duration' | translate }}: {{ module.estimatedDuration }}m</span>
                    <app-badge [variant]="getDifficultyVariant(module.difficulty)">
                      {{ module.difficulty }}
                    </app-badge>
                  </div>
                  <app-button variant="outline" size="sm" class="w-full">
                    {{ 'hr.training.start' | translate }}
                  </app-button>
                </div>
              }
            </div>
          </div>
        </app-tab>

        <!-- Certifications -->
        <app-tab [title]="'hr.training.certifications' | translate" [active]="false">
          <div class="space-y-6 p-6">
            <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
              <app-table
                [columns]="certificationColumns"
                [data]="certifications"
                [pagination]="pagination"
                [loading]="loading"
                [emptyMessage]="'hr.training.noCertifications' | translate"
                (onPageChange)="onPageChange($event)"
              />
            </div>
          </div>
        </app-tab>
      </app-tabs>
    </div>
  `,
  styles: []
})
export class TrainingComponent implements OnInit {
  private trainingService = inject(TrainingService);
  private staffService = inject(PharmacyStaffService);

  loading = false;
  modules: TrainingModule[] = [];
  certifications: any[] = [];

  filters = {
    category: '',
    isRequired: ''
  };

  pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  };

  certificationColumns: TableColumn[] = [
    { key: 'staffName', label: 'hr.training.staff', sortable: true },
    { key: 'moduleTitle', label: 'hr.training.module', sortable: true },
    { key: 'status', label: 'hr.training.status', sortable: true },
    { key: 'score', label: 'hr.training.score', sortable: true },
    { key: 'completedAt', label: 'hr.training.completedAt', sortable: true }
  ];

  ngOnInit(): void {
    this.loadModules();
    this.loadCertifications();
  }

  loadModules(): void {
    this.loading = true;
    const params: any = {
      page: 1,
      pageSize: 100
    };

    if (this.filters.category) {
      params.category = this.filters.category;
    }

    if (this.filters.isRequired !== '') {
      params.isRequired = this.filters.isRequired === 'true';
    }

    this.trainingService.getModules(params).subscribe({
      next: (response) => {
        this.modules = response.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadCertifications(): void {
    this.trainingService.getCertifications({
      page: this.pagination.page,
      pageSize: this.pagination.pageSize
    }).subscribe({
      next: (response) => {
        this.certifications = response.data.map((cert: any) => ({
          ...cert,
          status: cert.status,
          score: cert.score ? `${cert.score}/${cert.maxScore}` : '-',
          completedAt: cert.completedAt ? new Date(cert.completedAt).toLocaleDateString() : '-'
        }));
        this.pagination = {
          page: response.page,
          pageSize: response.pageSize,
          total: response.total,
          totalPages: response.totalPages
        };
      }
    });
  }

  getDifficultyVariant(difficulty: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    const variants: { [key: string]: 'success' | 'warning' | 'danger' | 'info' | 'default' } = {
      beginner: 'success',
      intermediate: 'info',
      advanced: 'warning'
    };
    return variants[difficulty] || 'default';
  }

  applyFilters(): void {
    this.loadModules();
  }

  onPageChange(page: number): void {
    this.pagination.page = page;
    this.loadCertifications();
  }
}

