import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PurchasesService } from '../../../core/services/purchases.service';
import { SuppliersService } from '../../../core/services/suppliers.service';
import { PurchaseInvoice } from '../../../core/models/purchase.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { switchMap, of } from 'rxjs';

@Component({
  selector: 'app-purchase-detail',
  standalone: true,
  imports: [CommonModule, ButtonComponent, AlertComponent, BadgeComponent, DatePipe, TranslatePipe],
  template: `
    <div class="space-y-[var(--spacing-gap)]">
      @if (errorMessage) {
        <app-alert type="error" [title]="errorMessage" />
      }

      @if (purchase) {
        <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-[var(--spacing-card)]">
          <!-- Header Actions -->
          <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold text-[var(--text-primary)]">{{ 'purchase.details' | translate }}</h1>
            <div class="flex gap-3">
              <app-button variant="outline" (onClick)="editPurchase()">
                <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {{ 'common.edit' | translate }}
              </app-button>
              <app-button variant="outline" (onClick)="goBack()">
                <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {{ 'common.back' | translate }}
              </app-button>
            </div>
          </div>

          <!-- Purchase Information -->
          <div class="mb-6 pb-6 border-b border-[var(--border-color)]">
            <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'purchase.purchaseInfo' | translate }}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'purchase.invoiceNumber' | translate }}</label>
                <p class="text-[var(--text-primary)] font-medium">{{ purchase.invoiceNumber }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'purchase.supplier' | translate }}</label>
                <p class="text-[var(--text-primary)]">{{ purchase.supplier?.name || 'Supplier ' + purchase.supplierId }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'purchase.purchaseDate' | translate }}</label>
                <p class="text-[var(--text-primary)]">{{ purchase.purchaseDate | date:'mediumDate' }}</p>
              </div>
              @if (purchase.dueDate) {
                <div>
                  <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'purchase.dueDate' | translate }}</label>
                  <p class="text-[var(--text-primary)]">{{ purchase.dueDate | date:'mediumDate' }}</p>
                </div>
              }
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'purchase.paymentStatus' | translate }}</label>
                <app-badge [variant]="getPaymentStatusVariant(purchase.paymentStatus)">
                  {{ getPaymentStatusLabel(purchase.paymentStatus) | translate }}
                </app-badge>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'invoice.createdAt' | translate }}</label>
                <p class="text-[var(--text-primary)]">{{ purchase.createdAt | date:'medium' }}</p>
              </div>
            </div>
          </div>

          <!-- Purchase Items -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'purchase.items' | translate }}</h2>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-[var(--border-color)]">
                <thead class="bg-[var(--page-bg)]">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-[var(--card-text)] uppercase tracking-wider">{{ 'purchase.drugName' | translate }}</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-[var(--card-text)] uppercase tracking-wider">{{ 'purchase.quantity' | translate }}</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-[var(--card-text)] uppercase tracking-wider">{{ 'purchase.unitCost' | translate }}</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-[var(--card-text)] uppercase tracking-wider">{{ 'purchase.totalCost' | translate }}</th>
                  </tr>
                </thead>
                <tbody class="bg-[var(--card-bg)] divide-y divide-[var(--border-color)]">
                  @for (item of purchase.items; track item.id) {
                    <tr class="hover:bg-[var(--page-bg)] transition-colors">
                      <td class="px-6 py-4 text-sm text-[var(--text-primary)]">{{ item.drugName }}</td>
                      <td class="px-6 py-4 text-sm text-[var(--text-primary)]">{{ item.quantity }}</td>
                      <td class="px-6 py-4 text-sm text-[var(--text-primary)]">{{ item.unitCost }}</td>
                      <td class="px-6 py-4 text-sm text-[var(--text-primary)] text-right font-medium">{{ item.totalCost }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Totals -->
          <div class="pt-6 border-t border-[var(--border-color)]">
            <div class="flex justify-end">
              <div class="w-full max-w-md space-y-3">
                <div class="flex justify-between text-sm text-[var(--card-text)]">
                  <span>{{ 'purchase.totalAmount' | translate }}:</span>
                  <span class="text-[var(--text-primary)] font-medium">{{ purchase.totalAmount }}</span>
                </div>
                <div class="flex justify-between text-sm text-[var(--card-text)]">
                  <span>{{ 'purchase.paidAmount' | translate }}:</span>
                  <span class="text-[var(--text-primary)]">{{ purchase.paidAmount }}</span>
                </div>
                <div class="flex justify-between text-lg font-bold text-[var(--text-primary)] pt-3 border-t border-[var(--border-color)]">
                  <span>{{ 'purchase.remainingAmount' | translate }}:</span>
                  <span>{{ purchase.remainingAmount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      } @else if (loading) {
        <div class="text-center py-12">
          <p class="text-[var(--card-text)]">{{ 'common.loading' | translate }}</p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class PurchaseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private purchasesService = inject(PurchasesService);
  private suppliersService = inject(SuppliersService);

  purchase: PurchaseInvoice | null = null;
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPurchase(id);
    } else {
      this.errorMessage = 'Purchase ID is required';
      this.loading = false;
    }
  }

  loadPurchase(id: string): void {
    this.loading = true;
    this.errorMessage = '';
    this.purchasesService.getById(id).pipe(
      switchMap(purchase => {
        if (!purchase) {
          return of(null);
        }
        // Load supplier information
        if (purchase.supplierId) {
          return this.suppliersService.getById(purchase.supplierId).pipe(
            switchMap(supplier => {
              return of({ ...purchase, supplier: supplier || undefined });
            })
          );
        }
        return of(purchase);
      })
    ).subscribe({
      next: (purchase) => {
        this.purchase = purchase;
        this.loading = false;
        if (!purchase) {
          this.errorMessage = 'Purchase not found';
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load purchase details';
        this.loading = false;
        console.error('Error loading purchase:', error);
      }
    });
  }

  editPurchase(): void {
    if (this.purchase) {
      this.router.navigate(['/purchases', this.purchase.id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/purchases']);
  }

  getPaymentStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'default' {
    if (status === 'paid') return 'success';
    if (status === 'partial') return 'warning';
    return 'default';
  }

  getPaymentStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'purchase.pending',
      'partial': 'purchase.partial',
      'paid': 'purchase.paid'
    };
    return labels[status] || status;
  }
}





