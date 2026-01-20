import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { Voucher } from '../../../core/models/voucher.model';

interface VoucherProductGroup {
  origin: 'local' | 'imported' | 'unknown';
  products: Array<{
    drugId: string;
    drugName: string;
    price: number;
    quantity: number;
    applyDiscount: boolean;
    discountPercentage: number;
  }>;
}

@Component({
  selector: 'app-voucher-step',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="p-8 space-y-8">
      <!-- Voucher Name -->
      <div class="rounded-xl p-6 border-2" style="background: rgba(0, 48, 50, 0.1); border-color: rgba(0, 48, 50, 0.3); color: rgb(55 65 81);">
        <label class="block text-sm font-semibold text-gray-700 mb-2">{{ 'invoice.voucher.voucherName' | translate }}</label>
        <div class="flex items-center">
          <div class="w-12 h-12 rounded-lg flex items-center justify-center mr-4" [style.background]="'rgba(0, 48, 50, 0.2)'">
            <svg class="w-6 h-6" [style.color]="'var(--sidebar-active-text)'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <input
            type="text"
            [value]="voucher.voucherName"
            readonly
            class="flex-1 px-4 py-3 border rounded-lg text-sm bg-white/50 font-mono text-gray-900 font-semibold"
            style="border-color: rgba(0, 48, 50, 0.4);"
          />
        </div>
      </div>

      <!-- Grouped Products by Origin -->
      <div class="space-y-6">
        @for (group of voucherProductGroups; track group.origin) {
          <div class="border-2 border-gray-200 rounded-xl overflow-hidden transition-all duration-300" onmouseenter="this.style.borderColor='rgba(0, 48, 50, 0.5)';" onmouseleave="this.style.borderColor='#e5e7eb';">
            <div class="px-6 py-4" [style.background]="'var(--sidebar-bg)'" [style.color]="'var(--sidebar-active-text)'">
              <h4 class="text-lg font-bold text-white flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {{ group.origin === 'local' ? ('drug.origin.local' | translate) : group.origin === 'imported' ? ('drug.origin.imported' | translate) : ('invoice.voucher.unknownOrigin' | translate) }}
              </h4>
            </div>
            <div class="p-6 space-y-4 bg-gradient-to-br from-gray-50 to-white">
              @for (product of group.products; track product.drugId) {
                <div class="grid grid-cols-1 md:grid-cols-5 gap-4 p-5 bg-white rounded-xl border-2 border-gray-100 hover:shadow-md transition-all duration-200" onmouseenter="this.style.borderColor='rgba(0, 48, 50, 0.5)';" onmouseleave="this.style.borderColor='#f3f4f6';">
                  <!-- Product Info with Checkbox -->
                  <div class="md:col-span-2">
                    <div class="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        [(ngModel)]="product.applyDiscount"
                        [ngModelOptions]="{standalone: true}"
                        (change)="onCalculateDiscount.emit()"
                        class="w-5 h-5 mt-1 border-gray-300 rounded cursor-pointer transition-all"
                        [style.accent-color]="'var(--sidebar-bg)'"
                      />
                      <div class="flex-1">
                        <span class="text-sm font-bold text-gray-900 block mb-1">{{ product.drugName }}</span>
                        <div class="text-xs text-gray-600 bg-gray-100 rounded-lg px-3 py-1.5 inline-block">
                          {{ 'invoice.quantity' | translate }}: <span class="font-semibold">{{ product.quantity }}</span> ×
                          <span class="font-semibold">{{ product.price | number:'1.2-2' }}</span> =
                          <span class="font-bold" [style.color]="'var(--sidebar-active-text)'">{{ (product.quantity * product.price) | number:'1.2-2' }} EGP</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Discount Percentage -->
                  <div class="md:col-span-2">
                    <label class="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                      {{ 'invoice.voucher.discountPercentage' | translate }}
                    </label>
                    <div class="relative">
                      <input
                        type="number"
                        [(ngModel)]="product.discountPercentage"
                        [ngModelOptions]="{standalone: true}"
                        [disabled]="!product.applyDiscount"
                        (input)="onCalculateDiscount.emit()"
                        min="0"
                        max="100"
                        step="0.01"
                        class="w-full px-4 py-3 pr-8 border-2 rounded-lg text-sm transition-all disabled:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-200 focus:outline-none"
                        [style.border-color]="product.applyDiscount ? 'rgba(0, 48, 50, 0.4)' : '#e5e7eb'"
                        [style.background-color]="product.applyDiscount ? 'rgba(0, 48, 50, 0.1)' : '#f9fafb'"
                        [style.color]="product.applyDiscount ? 'rgb(55 65 81)' : ''"
                        onfocus="if (!this.disabled) { this.style.borderColor='var(--sidebar-bg)'; this.style.boxShadow='0 0 0 4px rgba(0, 48, 50, 0.1)'; }"
                        onblur="if (!this.disabled) { this.style.borderColor='rgba(0, 48, 50, 0.4)'; this.style.boxShadow='none'; }"
                      />
                      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-600">%</span>
                    </div>
                  </div>

                  <!-- Discounted Price -->
                  <div class="flex items-center justify-end">
                    <div class="text-right">
                      <div class="text-xs font-semibold text-gray-600 mb-1">{{ 'invoice.totalPrice' | translate }}</div>
                      <div class="text-lg font-bold text-gray-900">{{ getDiscountedPrice(product) | number:'1.2-2' }}</div>
                      <div class="text-xs text-gray-500">EGP</div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Average Discount and Amount -->
      <div class="border-t-2 border-gray-200 pt-8">
        <!-- Info Note -->
        <div class="border-2 rounded-xl p-5 mb-6 flex items-start" style="background: rgba(0, 48, 50, 0.1); border-color: rgba(0, 48, 50, 0.3); color: rgb(55 65 81);">
          <svg class="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" [style.color]="'var(--sidebar-active-text)'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p class="text-sm font-semibold mb-1" [style.color]="'var(--sidebar-active-text)'">
              {{ 'invoice.voucher.note' | translate }}
            </p>
            <p class="text-sm" [style.color]="'var(--card-text)'">
              {{ 'invoice.voucher.averageDiscountNote' | translate }}
            </p>
          </div>
        </div>

        <!-- Summary Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div class="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border-2 border-gray-200">
            <label class="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">{{ 'invoice.subtotal' | translate }}</label>
            <div class="text-2xl font-bold text-gray-900">{{ subtotal | number:'1.2-2' }}</div>
            <div class="text-sm text-gray-600">EGP</div>
          </div>

          <div class="p-5 rounded-xl border-2" style="background: rgba(0, 48, 50, 0.1); border-color: rgba(0, 48, 50, 0.3); color: rgb(55 65 81);">
            <label class="block text-xs font-semibold mb-2 uppercase tracking-wide" [style.color]="'var(--sidebar-active-text)'">{{ 'invoice.voucher.averageDiscount' | translate }}</label>
            <div class="text-2xl font-bold" [style.color]="'var(--sidebar-active-text)'">{{ averageDiscountPercentage.toFixed(2) }}%</div>
            <div class="text-sm" [style.color]="'var(--sidebar-active-text)'">{{ 'invoice.voucher.averageDiscountLabel' | translate }}</div>
          </div>

          <div class="bg-gradient-to-br from-green-50 to-emerald-50/30 p-5 rounded-xl border-2 border-green-200">
            <label class="block text-xs font-semibold text-green-700 mb-2 uppercase tracking-wide">{{ 'invoice.voucher.discountAmount' | translate }}</label>
            <div class="text-2xl font-bold text-green-600">{{ voucherDiscountAmount | number:'1.2-2' }}</div>
            <div class="text-sm text-green-600">{{ 'invoice.voucher.egpSaved' | translate }}</div>
          </div>
        </div>

        <!-- Final Total -->
        <div class="rounded-xl p-6" [style.background]="'var(--sidebar-bg)'" [style.color]="'var(--sidebar-text)'">
          <div class="flex justify-between items-center">
            <div>
              <div class="text-sm font-semibold opacity-90 mb-1">{{ 'invoice.total' | translate }}</div>
              <div class="text-4xl font-bold">{{ (subtotal - voucherDiscountAmount) | number:'1.2-2' }} <span class="text-xl">EGP</span></div>
            </div>
            <svg class="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex items-center justify-end gap-4 pt-8 border-t-2 border-gray-100">
        <button
          type="button"
          (click)="onBack.emit()"
          class="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          {{ 'common.back' | translate }}
        </button>
        <button
          type="button"
          (click)="onCreateVoucherInvoice.emit()"
          [disabled]="loading"
          class="px-6 py-3 rounded-xl font-semibold hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none transition-all duration-200 flex items-center gap-2"
          [style.background]="'var(--primary-bg)'"
          [style.color]="'var(--primary-text)'"
        >
          @if (loading) {
            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          } @else {
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          }
          {{ 'invoice.wizard.createInvoice' | translate }}
        </button>
      </div>
    </div>
  `
})
export class VoucherStepComponent {
  @Input() voucher!: Voucher;
  @Input() voucherProductGroups: VoucherProductGroup[] = [];
  @Input() subtotal = 0;
  @Input() averageDiscountPercentage = 0;
  @Input() voucherDiscountAmount = 0;
  @Input() loading = false;
  @Input() getDiscountedPrice!: (product: VoucherProductGroup['products'][0]) => number;

  @Output() onCalculateDiscount = new EventEmitter<void>();
  @Output() onBack = new EventEmitter<void>();
  @Output() onCreateVoucherInvoice = new EventEmitter<void>();
}

