import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {TranslatePipe} from '../../../core/pipes/translate.pipe';
import {ButtonComponent} from '../../../shared/components/button/button.component';

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
  selector: 'app-voucher-section',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, ButtonComponent, TranslatePipe],
  template: `
    <div class="space-y-6">
      <!-- Voucher Name -->
      <div class="glass-card rounded-2xl p-6 shadow-xl">
        <label
          class="block text-sm font-semibold text-gray-700 mb-2">{{ 'invoice.voucher.voucherName' | translate }}</label>
        <input
          type="text"
          [value]="voucherName"
          readonly
          class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm bg-gray-50 font-mono"
        />
      </div>

      <!-- Grouped Products -->
      <div class="space-y-6">
        @for (group of voucherProductGroups; track group.origin) {
          <div
            class="product-group glass-card rounded-2xl p-6 shadow-xl transition-all"
            [class.local]="group.origin === 'local'"
            [class.imported]="group.origin === 'imported'"
          >
            <div class="flex items-center mb-4">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                [class.bg-green-100]="group.origin === 'local'"
                [class.bg-blue-100]="group.origin === 'imported'"
                [class.bg-gray-100]="group.origin === 'unknown'"
              >
                <svg
                  class="w-6 h-6"
                  [class.text-green-600]="group.origin === 'local'"
                  [class.text-blue-600]="group.origin === 'imported'"
                  [class.text-gray-600]="group.origin === 'unknown'"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                </svg>
              </div>
              <h4 class="text-lg font-semibold text-gray-900">
                {{ group.origin === 'local' ? ('drug.origin.local' | translate) : group.origin === 'imported' ? ('drug.origin.imported' | translate) : ('invoice.voucher.unknownOrigin' | translate) }}
              </h4>
            </div>

            <div class="space-y-3">
              @for (product of group.products; track product.drugId) {
                <div class="bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 border-2 border-gray-100">
                  <div class="grid grid-cols-12 gap-4 items-center">
                    <!-- Checkbox & Drug Name -->
                    <div class="col-span-5">
                      <div class="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          [(ngModel)]="product.applyDiscount"
                          (change)="onDiscountChange()"
                          class="w-4 h-4 text-[var(--primary-color)] focus:ring-[var(--primary-color)] border-gray-300 rounded transition"
                        />
                        <div>
                          <span class="text-sm font-semibold text-gray-900">{{ product.drugName }}</span>
                          <div class="text-xs text-gray-500 mt-1">
                            {{ 'invoice.quantity' | translate }}: {{ product.quantity }} ×
                            {{ product.price | number:'1.2-2' }} =
                            {{ (product.quantity * product.price) | number:'1.2-2' }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Discount Percentage -->
                    <div class="col-span-4">
                      <label
                        class="block text-xs font-medium text-gray-600 mb-1">{{ 'invoice.voucher.discountPercentage' | translate }}</label>
                      <div class="flex items-center gap-2">
                        <input
                          type="range"
                          [(ngModel)]="product.discountPercentage"
                          [disabled]="!product.applyDiscount"
                          (input)="onDiscountChange()"
                          min="0"
                          max="100"
                          step="1"
                          class="flex-1 discount-slider"
                          [class.disabled]="!product.applyDiscount"
                        />
                        <input
                          type="number"
                          [(ngModel)]="product.discountPercentage"
                          [disabled]="!product.applyDiscount"
                          (input)="onDiscountChange()"
                          min="0"
                          max="100"
                          step="0.01"
                          class="w-16 px-2 py-1.5 border-2 border-gray-200 rounded-lg text-sm text-center font-semibold focus:outline-none focus:border-[var(--primary-color)] disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        <span class="text-sm font-medium text-gray-600">%</span>
                      </div>
                    </div>

                    <!-- Final Price -->
                    <div class="col-span-3">
                      <label
                        class="block text-xs font-medium text-gray-600 mb-1">{{ 'invoice.totalPrice' | translate }}</label>
                      <div class="text-lg font-bold text-[var(--primary-color)]">
                        {{ (product.quantity * product.price) | number:'1.2-2' }}
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- Summary -->
      <div class="glass-card rounded-2xl p-6 shadow-xl">
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                 viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-sm text-blue-800">
              <strong>{{ 'invoice.voucher.note' | translate }}
                :</strong> {{ 'invoice.voucher.averageDiscountNote' | translate }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-2">{{ 'invoice.subtotal' | translate }}</label>
            <div class="text-2xl font-bold text-gray-900">{{ subtotal | number:'1.2-2' }}</div>
          </div>
          <div>
            <label
              class="block text-sm font-medium text-gray-600 mb-2">{{ 'invoice.voucher.averageDiscount' | translate }}</label>
            <div class="text-2xl font-bold text-orange-600">{{ averageDiscountPercentage.toFixed(2) }}%</div>
          </div>
          <div>
            <label
              class="block text-sm font-medium text-gray-600 mb-2">{{ 'invoice.voucher.discountAmount' | translate }}</label>
            <div class="text-2xl font-bold text-green-600">{{ voucherDiscountAmount | number:'1.2-2' }}</div>
          </div>
        </div>

        <div class="mt-6 pt-6 border-t-2 border-gray-200">
          <div class="flex justify-between items-center">
            <span class="text-xl font-semibold text-gray-900">{{ 'invoice.total' | translate }}</span>
            <span
              class="text-3xl font-bold text-[var(--primary-color)]">{{ (subtotal - voucherDiscountAmount) | number:'1.2-2' }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-4">
        <app-button type="button" variant="outline" (onClick)="onBack()">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          {{ 'common.back' | translate }}
        </app-button>
        <app-button
          type="button"
          variant="primary"
          (onClick)="onCreate()"
          [loading]="loading"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          {{ 'invoice.wizard.createInvoice' | translate }}
        </app-button>
      </div>
    </div>
  `,
  styles: [`
    .glass-card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .product-group {
      border-left: 4px solid transparent;
      transition: all 0.3s ease;
    }

    .product-group.local {
      border-left-color: #10b981;
    }

    .product-group.imported {
      border-left-color: #3b82f6;
    }

    .product-group:hover {
      background-color: rgba(249, 250, 251, 0.9);
    }

    .discount-slider {
      appearance: none;
      width: 100%;
      height: 6px;
      border-radius: 5px;
      background: #e5e7eb;
      outline: none;
      transition: all 0.2s ease;
    }

    .discount-slider::-webkit-slider-thumb {
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--primary-color);
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      transition: all 0.2s ease;
    }

    .discount-slider::-webkit-slider-thumb:hover {
      transform: scale(1.1);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
    }

    .discount-slider::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--primary-color);
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      border: none;
    }

    .discount-slider.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .discount-slider.disabled::-webkit-slider-thumb {
      cursor: not-allowed;
      background: #9ca3af;
    }

    .discount-slider.disabled::-moz-range-thumb {
      cursor: not-allowed;
      background: #9ca3af;
    }
  `]
})
export class VoucherSectionComponent {
  @Input() voucherName: string = '';
  @Input() voucherProductGroups: VoucherProductGroup[] = [];
  @Input() subtotal: number = 0;
  @Input() averageDiscountPercentage: number = 0;
  @Input() voucherDiscountAmount: number = 0;
  @Input() loading: boolean = false;

  @Output() discountChange = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();
  @Output() create = new EventEmitter<void>();

  onDiscountChange(): void {
    this.discountChange.emit();
  }

  onBack(): void {
    this.back.emit();
  }

  onCreate(): void {
    this.create.emit();
  }
}
