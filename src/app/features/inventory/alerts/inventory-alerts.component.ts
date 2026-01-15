import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { DrugsService } from '../../../core/services/drugs.service';
import { PharmacyDrug } from '../../../core/models/drug.model';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

interface DrugWithExpiry extends PharmacyDrug {
  daysToExpiry?: number;
  expiryDateDisplay?: string;
}

@Component({
  selector: 'app-inventory-alerts',
  standalone: true,
  imports: [CommonModule, BadgeComponent, DatePipe, TranslatePipe],
  template: `
    <div class="space-y-[var(--spacing-gap)]">
      <!-- Low Stock Section -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-[var(--spacing-card)]">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-semibold text-[var(--text-primary)]">{{ 'inventory.lowStock' | translate }}</h2>
            <p class="text-sm text-[var(--card-text)] mt-1">{{ 'inventory.belowMinimum' | translate }}</p>
          </div>
          <app-badge variant="warning">{{ lowStockDrugs.length }} {{ 'inventory.items' | translate }}</app-badge>
        </div>

        @if (lowStockDrugs.length > 0) {
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-[var(--border-color)]">
              <thead class="bg-[var(--page-bg)]">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-[var(--card-text)] uppercase tracking-wider">{{ 'drug.name' | translate }}</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-[var(--card-text)] uppercase tracking-wider">{{ 'drug.barcode' | translate }}</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-[var(--card-text)] uppercase tracking-wider">{{ 'inventory.currentStock' | translate }}</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-[var(--card-text)] uppercase tracking-wider">{{ 'inventory.minimumStock' | translate }}</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-[var(--card-text)] uppercase tracking-wider">{{ 'drug.price' | translate }}</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-[var(--card-text)] uppercase tracking-wider">{{ 'common.view' | translate }}</th>
                </tr>
              </thead>
              <tbody class="bg-[var(--card-bg)] divide-y divide-[var(--border-color)]">
                @for (drug of lowStockDrugs; track drug.id) {
                  <tr class="hover:bg-[var(--page-bg)] transition-colors">
                    <td class="px-6 py-4 text-sm text-[var(--text-primary)]">{{ drug.generalDrug?.name || 'N/A' }}</td>
                    <td class="px-6 py-4 text-sm text-[var(--text-primary)] font-mono">{{ drug.internalBarcode }}</td>
                    <td class="px-6 py-4 text-sm text-[var(--text-primary)]">
                      <span class="font-medium text-red-600">{{ drug.stockQuantity }}</span>
                    </td>
                    <td class="px-6 py-4 text-sm text-[var(--text-primary)]">{{ drug.minimumStock }}</td>
                    <td class="px-6 py-4 text-sm text-[var(--text-primary)]">{{ drug.price }}</td>
                    <td class="px-6 py-4 text-sm text-right">
                      <button
                        class="p-1 text-[var(--card-text)] hover:text-[var(--text-primary)]"
                        [title]="'common.view' | translate"
                        (click)="viewDrug(drug.id)"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="text-center py-8">
            <p class="text-[var(--card-text)]">{{ 'inventory.adequateStock' | translate }}</p>
          </div>
        }
      </div>

      <!-- Near Expiry Section -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-[var(--spacing-card)]">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-semibold text-[var(--text-primary)]">{{ 'inventory.nearExpiry' | translate }}</h2>
            <p class="text-sm text-[var(--card-text)] mt-1">{{ 'inventory.expiringWithin30Days' | translate }}</p>
          </div>
          <app-badge variant="danger">{{ nearExpiryDrugs.length }} {{ 'inventory.items' | translate }}</app-badge>
        </div>

        @if (nearExpiryDrugs.length > 0) {
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-[var(--border-color)]">
              <thead class="bg-[var(--page-bg)]">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-[var(--card-text)] uppercase tracking-wider">{{ 'drug.name' | translate }}</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-[var(--card-text)] uppercase tracking-wider">{{ 'drug.barcode' | translate }}</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-[var(--card-text)] uppercase tracking-wider">{{ 'drug.expiryDate' | translate }}</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-[var(--card-text)] uppercase tracking-wider">{{ 'inventory.daysToExpiry' | translate }}</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-[var(--card-text)] uppercase tracking-wider">{{ 'drug.stock' | translate }}</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-[var(--card-text)] uppercase tracking-wider">{{ 'common.view' | translate }}</th>
                </tr>
              </thead>
              <tbody class="bg-[var(--card-bg)] divide-y divide-[var(--border-color)]">
                @for (drug of nearExpiryDrugs; track drug.id) {
                  <tr class="hover:bg-[var(--page-bg)] transition-colors">
                    <td class="px-6 py-4 text-sm text-[var(--text-primary)]">{{ drug.generalDrug?.name || 'N/A' }}</td>
                    <td class="px-6 py-4 text-sm text-[var(--text-primary)] font-mono">{{ drug.internalBarcode }}</td>
                    <td class="px-6 py-4 text-sm text-[var(--text-primary)]">
                      {{ drug.expiryDate | date:'mediumDate' }}
                    </td>
                    <td class="px-6 py-4 text-sm">
                      @if (drug.daysToExpiry !== undefined) {
                        <span [class]="getDaysToExpiryClass(drug.daysToExpiry)">
                          {{ formatDaysToExpiry(drug.daysToExpiry) }}
                        </span>
                      }
                    </td>
                    <td class="px-6 py-4 text-sm text-[var(--text-primary)]">{{ drug.stockQuantity }}</td>
                    <td class="px-6 py-4 text-sm text-right">
                      <button
                        class="p-1 text-[var(--card-text)] hover:text-[var(--text-primary)]"
                        [title]="'common.view' | translate"
                        (click)="viewDrug(drug.id)"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="text-center py-8">
            <p class="text-[var(--card-text)]">{{ 'inventory.noExpiring' | translate }}</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class InventoryAlertsComponent implements OnInit {
  private drugsService = inject(DrugsService);
  private router = inject(Router);
  private translationService = inject(TranslationService);

  lowStockDrugs: DrugWithExpiry[] = [];
  nearExpiryDrugs: DrugWithExpiry[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    this.loading = true;

    // Load low stock drugs
    this.drugsService.getLowStockDrugs().subscribe({
      next: (drugs) => {
        this.lowStockDrugs = drugs;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading low stock drugs:', error);
        this.loading = false;
      }
    });

    // Load near expiry drugs
    this.drugsService.getExpiringDrugs(30).subscribe({
      next: (drugs) => {
        this.nearExpiryDrugs = drugs.map(drug => ({
          ...drug,
          daysToExpiry: this.calculateDaysToExpiry(drug.expiryDate)
        })).sort((a, b) => (a.daysToExpiry || 999) - (b.daysToExpiry || 999));
      },
      error: (error) => {
        console.error('Error loading expiring drugs:', error);
      }
    });
  }

  calculateDaysToExpiry(expiryDate?: Date): number {
    if (!expiryDate) return 999;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  formatDaysToExpiry(days: number): string {
    if (days < 0) return this.translationService.translate('inventory.expired');
    if (days === 0) return this.translationService.translate('inventory.expiresToday');
    return `${days} ${this.translationService.translate('common.days')}`;
  }

  getDaysToExpiryClass(days: number): string {
    if (days < 0) return 'text-red-600 font-semibold';
    if (days <= 7) return 'text-red-600 font-medium';
    if (days <= 14) return 'text-orange-600 font-medium';
    return 'text-yellow-600';
  }

  viewDrug(id: string): void {
    this.router.navigate(['/drugs', id]);
  }
}
