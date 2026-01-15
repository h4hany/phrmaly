import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoicesService } from '../../../core/services/invoices.service';
import { PatientsService } from '../../../core/services/patients.service';
import { Invoice } from '../../../core/models/invoice.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { switchMap, of } from 'rxjs';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, ButtonComponent, AlertComponent, BadgeComponent, DatePipe, TranslatePipe],
  template: `
    <div class="space-y-[var(--spacing-gap)]">
      @if (errorMessage) {
        <app-alert type="error" [title]="errorMessage" />
      }

      @if (invoice) {
        <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-[var(--spacing-card)]">
          <!-- Header Actions -->
          <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold text-[var(--text-primary)]">{{ 'invoice.details' | translate }}</h1>
            <div class="flex gap-3">
              <app-button variant="outline" (onClick)="editInvoice()">
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

          <!-- Invoice Information -->
          <div class="mb-6 pb-6 border-b border-[var(--border-color)]">
            <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'invoice.invoiceInfo' | translate }}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'invoice.invoiceNumber' | translate }}</label>
                <p class="text-[var(--text-primary)] font-medium">{{ invoice.invoiceNumber }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'invoice.patient' | translate }}</label>
                <p class="text-[var(--text-primary)]">{{ invoice.patient?.fullName || 'N/A' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'invoice.paymentStatus' | translate }}</label>
                <app-badge [variant]="getPaymentStatusVariant(invoice.paymentStatus)">
                  {{ getPaymentStatusLabel(invoice.paymentStatus) | translate }}
                </app-badge>
              </div>
              @if (invoice.paymentMethod) {
                <div>
                  <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'invoice.paymentMethod' | translate }}</label>
                  <p class="text-[var(--text-primary)] capitalize">{{ invoice.paymentMethod }}</p>
                </div>
              }
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'invoice.createdAt' | translate }}</label>
                <p class="text-[var(--text-primary)]">{{ invoice.createdAt | date:'medium' }}</p>
              </div>
            </div>
          </div>

          <!-- Invoice Items -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'invoice.items' | translate }}</h2>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-[var(--border-color)]">
                <thead class="bg-[var(--page-bg)]">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-[var(--card-text)] uppercase tracking-wider">{{ 'invoice.itemName' | translate }}</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-[var(--card-text)] uppercase tracking-wider">{{ 'invoice.quantity' | translate }}</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-[var(--card-text)] uppercase tracking-wider">{{ 'invoice.unitPrice' | translate }}</th>
                    @if (hasItemsWithDiscount()) {
                      <th class="px-6 py-3 text-left text-xs font-medium text-[var(--card-text)] uppercase tracking-wider">{{ 'invoice.discount' | translate }}</th>
                    }
                    <th class="px-6 py-3 text-right text-xs font-medium text-[var(--card-text)] uppercase tracking-wider">{{ 'invoice.totalPrice' | translate }}</th>
                  </tr>
                </thead>
                <tbody class="bg-[var(--card-bg)] divide-y divide-[var(--border-color)]">
                  @for (item of invoice.items; track item.id) {
                    <tr class="hover:bg-[var(--page-bg)] transition-colors">
                      <td class="px-6 py-4 text-sm text-[var(--text-primary)]">{{ item.drugName }}</td>
                      <td class="px-6 py-4 text-sm text-[var(--text-primary)]">{{ item.quantity }}</td>
                      <td class="px-6 py-4 text-sm text-[var(--text-primary)]">{{ item.unitPrice }}</td>
                      @if (hasItemsWithDiscount()) {
                        <td class="px-6 py-4 text-sm text-[var(--text-primary)]">
                          {{ item.discount ? item.discount : '-' }}
                        </td>
                      }
                      <td class="px-6 py-4 text-sm text-[var(--text-primary)] text-right font-medium">{{ item.totalPrice }}</td>
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
                  <span>{{ 'invoice.subtotal' | translate }}:</span>
                  <span class="text-[var(--text-primary)] font-medium">{{ invoice.subtotal }}</span>
                </div>
                @if (invoice.discount > 0) {
                  <div class="flex justify-between text-sm text-[var(--card-text)]">
                    <span>{{ 'invoice.discount' | translate }}:</span>
                    <span class="text-[var(--text-primary)]">{{ invoice.discount }}</span>
                  </div>
                }
                @if (invoice.promoCode) {
                  <div class="flex justify-between text-sm text-[var(--card-text)]">
                    <span>{{ 'invoice.promoCode' | translate }}:</span>
                    <span class="text-[var(--text-primary)]">{{ invoice.promoCode }}</span>
                  </div>
                }
                <div class="flex justify-between text-lg font-bold text-[var(--text-primary)] pt-3 border-t border-[var(--border-color)]">
                  <span>{{ 'invoice.total' | translate }}:</span>
                  <span>{{ invoice.total }}</span>
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
export class InvoiceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private invoicesService = inject(InvoicesService);
  private patientsService = inject(PatientsService);

  invoice: Invoice | null = null;
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadInvoice(id);
    } else {
      this.errorMessage = 'Invoice ID is required';
      this.loading = false;
    }
  }

  loadInvoice(id: string): void {
    this.loading = true;
    this.errorMessage = '';
    this.invoicesService.getById(id).pipe(
      switchMap(invoice => {
        if (!invoice) {
          this.errorMessage = 'Invoice not found';
          this.loading = false;
          return of([]);
        }
        if (invoice.patientId) {
          return this.patientsService.getById(invoice.patientId).pipe(
            switchMap(patient => of([{ ...invoice, patient: patient || undefined } as Invoice]))
          );
        }
        return of([{ ...invoice } as Invoice]);
      })
    ).subscribe({
      next: (invoices) => {
        if (invoices && invoices.length > 0) {
          this.invoice = invoices[0];
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load invoice details';
        this.loading = false;
        console.error('Error loading invoice:', error);
      }
    });
  }

  editInvoice(): void {
    if (this.invoice) {
      this.router.navigate(['/invoices', this.invoice.id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/invoices']);
  }

  getPaymentStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'default' {
    if (status === 'paid') return 'success';
    if (status === 'partial') return 'warning';
    return 'default';
  }

  getPaymentStatusLabel(status: string): string {
    if (status === 'paid') return 'invoice.status.paid';
    if (status === 'partial') return 'invoice.status.partial';
    return 'invoice.status.pending';
  }

  hasItemsWithDiscount(): boolean {
    return this.invoice?.items.some(item => item.discount) ?? false;
  }
}
