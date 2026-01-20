import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DrugsService } from '../../../core/services/drugs.service';
import { PharmacyDrug } from '../../../core/models/drug.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { DateFormatPipe } from '../../../core/pipes/date-format.pipe';

@Component({
  selector: 'app-drug-detail',
  standalone: true,
  imports: [CommonModule, ButtonComponent, AlertComponent, BadgeComponent, TranslatePipe, DateFormatPipe],
  template: `
    <div class="space-y-[var(--spacing-gap)]">
      @if (errorMessage) {
        <app-alert type="error" [title]="errorMessage" />
      }

      @if (drug) {
        <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-[var(--spacing-card)]">
          <!-- Header Actions -->
          <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold text-[var(--text-primary)]">Product Details</h1>
            <div class="flex gap-3">
              <app-button variant="outline" (onClick)="editDrug()">
                <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </app-button>
              <app-button variant="outline" (onClick)="goBack()">
                <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </app-button>
            </div>
          </div>

          <!-- General Information -->
          <div class="mb-6 pb-6 border-b border-[var(--border-color)]">
            <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">General Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">Drug Name</label>
                <p class="text-[var(--text-primary)] font-medium">{{ drug.generalDrug?.name || 'N/A' }}</p>
              </div>
              @if (drug.generalDrug?.description) {
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-[var(--card-text)] mb-1">Description</label>
                  <p class="text-[var(--text-primary)]">{{ drug.generalDrug?.description }}</p>
                </div>
              }
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">Manufacturer</label>
                <p class="text-[var(--text-primary)]">{{ drug.generalDrug?.manufacturer || 'N/A' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">International Barcode</label>
                <p class="text-[var(--text-primary)] font-mono">{{ drug.generalDrug?.internationalBarcode || 'N/A' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">Internal Barcode (PLU)</label>
                <p class="text-[var(--text-primary)] font-mono">{{ drug.internalBarcode }}</p>
              </div>
            </div>
          </div>

          <!-- Stock Information -->
          <div class="mb-6 pb-6 border-b border-[var(--border-color)]">
            <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">Stock Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">Price</label>
                <p class="text-[var(--text-primary)] font-medium text-lg">{{ drug.price }}</p>
              </div>
              @if (drug.priceAfterDiscount !== drug.price) {
                <div>
                  <label class="block text-sm font-medium text-[var(--card-text)] mb-1">Price After Discount</label>
                  <p class="text-[var(--text-primary)] font-medium text-lg">{{ drug.priceAfterDiscount }}</p>
                </div>
              }
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">Stock Quantity</label>
                <p class="text-[var(--text-primary)] font-medium text-lg" [class.text-red-600]="drug.stockQuantity < drug.minimumStock">
                  {{ drug.stockQuantity }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">Minimum Stock</label>
                <p class="text-[var(--text-primary)]">{{ drug.minimumStock }}</p>
              </div>
              @if (drug.expiryDate) {
                <div>
                  <label class="block text-sm font-medium text-[var(--card-text)] mb-1">Expiry Date</label>
                  <p class="text-[var(--text-primary)]" [class.text-red-600]="isExpiringSoon(drug.expiryDate)">
                    {{ drug.expiryDate | dateFormat }}
                    @if (isExpiringSoon(drug.expiryDate)) {
                      <span class="ml-2 text-xs">(Expiring Soon)</span>
                    }
                  </p>
                </div>
              }
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">Status</label>
                <app-badge [variant]="getStatusVariant(drug.status)">
                  {{ drug.status | titlecase }}
                </app-badge>
              </div>
            </div>
          </div>

          <!-- Cost Layers -->
          @if (drug.costLayers && drug.costLayers.length > 0) {
            <div class="mb-6">
              <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">Cost Layers</h2>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-[var(--border-color)]">
                  <thead class="bg-[var(--page-bg)]">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-[var(--card-text)] uppercase">Quantity</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-[var(--card-text)] uppercase">Unit Cost</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-[var(--card-text)] uppercase">Purchase Date</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-[var(--card-text)] uppercase">Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody class="bg-[var(--card-bg)] divide-y divide-[var(--border-color)]">
                    @for (layer of drug.costLayers; track $index) {
                      <tr>
                        <td class="px-4 py-3 text-sm text-[var(--text-primary)]">{{ layer.quantity }}</td>
                        <td class="px-4 py-3 text-sm text-[var(--text-primary)]">{{ layer.unitCost }}</td>
                        <td class="px-4 py-3 text-sm text-[var(--text-primary)]">{{ layer.purchaseDate | dateFormat }}</td>
                        <td class="px-4 py-3 text-sm text-[var(--text-primary)]">{{ layer.expiryDate | dateFormat }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          <!-- Shelf Location -->
          <div class="mb-6 pb-6 border-b border-[var(--border-color)]">
            <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'drug.shelfLocation' | translate }}</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'drug.shelf' | translate }}</label>
                <p class="text-[var(--text-primary)] font-medium">{{ getShelfLocation().shelf }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'drug.row' | translate }}</label>
                <p class="text-[var(--text-primary)] font-medium">{{ getShelfLocation().row }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'drug.column' | translate }}</label>
                <p class="text-[var(--text-primary)] font-medium">{{ getShelfLocation().column }}</p>
              </div>
            </div>
            <div class="mt-4">
              <app-button variant="outline" size="sm" (onClick)="viewShelfMap()">
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                {{ 'drug.viewOnMap' | translate }}
              </app-button>
            </div>
          </div>

          <!-- Metadata -->
          <div class="pt-6 border-t border-[var(--border-color)]">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">Created At</label>
                <p class="text-[var(--text-primary)]">{{ drug.createdAt | dateFormat }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">Last Updated</label>
                <p class="text-[var(--text-primary)]">{{ drug.updatedAt | dateFormat }}</p>
              </div>
            </div>
          </div>
        </div>
      } @else if (loading) {
        <div class="text-center py-12">
          <p class="text-[var(--card-text)]">Loading product details...</p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class DrugDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private drugsService = inject(DrugsService);

  drug: PharmacyDrug | null = null;
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDrug(id);
    } else {
      this.errorMessage = 'Product ID is required';
      this.loading = false;
    }
  }

  loadDrug(id: string): void {
    this.loading = true;
    this.errorMessage = '';
    this.drugsService.getPharmacyDrugById(id).subscribe({
      next: (drug) => {
        this.drug = drug;
        this.loading = false;
        if (!drug) {
          this.errorMessage = 'Product not found';
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load product details';
        this.loading = false;
        console.error('Error loading drug:', error);
      }
    });
  }

  editDrug(): void {
    if (this.drug) {
      this.router.navigate(['/drugs', this.drug.id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/drugs']);
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'default' {
    if (status === 'active') return 'success';
    if (status === 'out_of_stock') return 'danger';
    return 'default';
  }

  isExpiringSoon(expiryDate: Date): boolean {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  }

  getShelfLocation(): { shelf: string; row: number; column: number } {
    // Mock shelf location - in real app, this would come from the drug data
    const shelves = ['A', 'B', 'C', 'D'];
    const shelfIndex = parseInt(this.drug?.id?.slice(-1) || '1', 10) % shelves.length;
    return {
      shelf: shelves[shelfIndex],
      row: Math.floor(Math.random() * 4) + 1,
      column: Math.floor(Math.random() * 8) + 1
    };
  }

  viewShelfMap(): void {
    this.router.navigate(['/inventory/map'], { queryParams: { drugId: this.drug?.id } });
  }
}
