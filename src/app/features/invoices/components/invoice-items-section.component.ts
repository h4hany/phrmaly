import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule, DecimalPipe} from '@angular/common';
import {FormArray, FormsModule, ReactiveFormsModule} from '@angular/forms';

import {TranslatePipe} from '../../../core/pipes/translate.pipe';
import {BarcodeScannerDirective} from '../../../shared/directives/barcode-scanner.directive';
import {PharmacyDrug} from '../../../core/models/drug.model';

@Component({
  selector: 'app-invoice-items-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslatePipe, BarcodeScannerDirective, DecimalPipe],
  template: `
    <div class="glass-card rounded-2xl p-8 shadow-xl animate-slide-in">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center">
          <div
            class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mr-3">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-900">{{ 'invoice.items' | translate }}</h2>
        </div>

        <div class="flex gap-3">
          <!-- Barcode Scanner -->
          <div class="relative">
            <input
              type="text"
              [placeholder]="'placeholder.scanBarcode' | translate"
              [value]="barcodeInput"
              (input)="onBarcodeInputChange($event)"
              (keyup.enter)="onBarcodeEnter()"
              appBarcodeScanner
              (barcodeScanned)="onBarcodeScanned($event)"
              class="custom-input w-64 pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 transition-all"
            />
            <div class="absolute left-3 top-2.5 pointer-events-none">
              <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
              </svg>
            </div>
          </div>

          <!-- Add Drug Button -->
          <button
            type="button"
            (click)="onToggleDrugSelector()"
            class="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-indigo-700 transition shadow-md flex items-center"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            {{ 'form.invoice.addDrug' | translate }}
          </button>
        </div>
      </div>

      <!-- Drug Selector -->
      @if (showDrugSelector) {
        <div
          class="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 animate-slide-in">
          <div class="flex gap-3">
            <select
              [value]="selectedDrugId"
              (change)="onDrugSelect($event)"
              class="flex-1 px-4 py-2.5 border-2 border-purple-200 rounded-xl text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="">{{ 'form.selectDrug' | translate }}</option>
              @for (drug of pharmacyDrugs; track drug.id) {
                <option [value]="drug.id">
                  {{ (drug.generalDrug?.name || ('Drug ' + drug.id)) }}
                  - {{ drug.price | currency:'USD':'symbol':'1.2-2' }}
                </option>
              }
            </select>
            <button
              type="button"
              (click)="onAddDrug()"
              class="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition"
            >
              {{ 'common.add' | translate }}
            </button>
          </div>
        </div>
      }

      <!-- Drug Items List -->
      <div class="space-y-4">
        @for (item of itemsArray.controls; track $index; let i = $index) {
          <div
            class="drug-item bg-gradient-to-r from-white to-gray-50 rounded-xl p-5 border-2 border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div class="grid grid-cols-12 gap-4 items-center">
              <!-- Drug Info -->
              <div class="col-span-4">
                <div class="flex items-start">
                  <div
                    class="w-12 h-12 rounded-lg flex items-center justify-center mr-3 flex-shrink-0"
                    [class]="getDrugColorClass(i)"
                  >
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-gray-900 truncate">{{ getDrugName(item.get('drugId')?.value) }}</h3>
                    <p class="text-xs text-gray-500 mt-0.5">SKU: {{ item.get('drugId')?.value }}</p>
                    <span class="badge badge-success mt-2">{{ 'common.inStock' | translate }}</span>
                  </div>
                </div>
              </div>

              <!-- Quantity Controls -->
              <div class="col-span-2">
                <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'invoice.quantity' | translate }}</label>
                <div class="flex items-center space-x-2">
                  <button
                    type="button"
                    (click)="decrementQuantity(i)"
                    class="w-8 h-8 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 transition"
                  >
                    <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                    </svg>
                  </button>
                  <input
                    type="number"
                    [value]="item.get('quantity')?.value"
                    (change)="onQuantityInputChange($event, i)"
                    min="1"
                    class="w-16 text-center py-1.5 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-[var(--primary-color)]"
                  />
                  <button
                    type="button"
                    (click)="incrementQuantity(i)"
                    class="w-8 h-8 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 hover:border-gray-400 transition"
                  >
                    <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Unit Price -->
              <div class="col-span-2">
                <label
                  class="block text-xs font-medium text-gray-600 mb-1">{{ 'form.invoice.unitPrice' | translate }}</label>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500 mr-1">$</span>
                  <input
                    type="text"
                    [value]="item.get('unitPrice')?.value | number:'1.2-2'"
                    readonly
                    class="w-full py-1.5 px-2 bg-gray-50 border-2 border-gray-200 rounded-lg font-semibold text-gray-700"
                  />
                </div>
              </div>

              <!-- Total Price -->
              <div class="col-span-3">
                <label class="block text-xs font-medium text-gray-600 mb-1">{{ 'invoice.total' | translate }}</label>
                <div class="text-xl font-bold text-[var(--primary-color)]">
                  {{
                    ((item.get('quantity')?.value || 0) * (item.get('unitPrice')?.value || 0))
                      | currency:'USD':'symbol':'1.2-2'
                  }}
                </div>
              </div>

              <!-- Delete Button -->
              <div class="col-span-1 flex justify-end">
                <button
                  type="button"
                  (click)="onRemoveItem(i)"
                  class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        }

        @if (itemsArray.length === 0) {
          <div class="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
            </svg>
            <p class="text-gray-500 font-medium">{{ 'invoice.noItems' | translate }}</p>
            <p class="text-gray-400 text-sm mt-1">{{ 'invoice.scanOrAddDrug' | translate }}</p>
          </div>
        }
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div
          class="stat-card bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-transparent to-white opacity-10"></div>
          <div class="relative flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm font-medium mb-1">{{ 'invoice.subtotal' | translate }}</p>
              <p class="text-3xl font-bold">{{subtotal | number:'1.2-2'}}</p>
            </div>
            <div class="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div
          class="stat-card bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-transparent to-white opacity-10"></div>
          <div class="relative flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm font-medium mb-1">{{ 'invoice.discount' | translate }}</p>
              <p class="text-3xl font-bold">$0.00</p>
            </div>
            <div class="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
              </svg>
            </div>
          </div>
        </div>

        <div
          class="stat-card bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-transparent to-white opacity-10"></div>
          <div class="relative flex items-center justify-between">
            <div>
              <p class="text-purple-100 text-sm font-medium mb-1">{{ 'invoice.total' | translate }}</p>
              <p class="text-3xl font-bold">{{total | number:'1.2-2'}}</p>
            </div>
            <div class="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .glass-card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .drug-item {
      transition: all 0.3s ease;
      animation: slide-in 0.3s ease;
    }

    @keyframes slide-in {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-slide-in {
      animation: slide-in 0.3s ease;
    }

    .drug-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    .custom-input:focus {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(168, 85, 247, 0.15);
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .badge-success {
      background-color: #d1fae5;
      color: #065f46;
    }
  `]
})
export class InvoiceItemsSectionComponent {
  @Input() itemsArray!: FormArray;
  @Input() pharmacyDrugs: PharmacyDrug[] = [];
  @Input() barcodeInput: string = '';
  @Input() showDrugSelector: boolean = false;
  @Input() selectedDrugId: string = '';
  @Input() subtotal: number = 0;
  @Input() total: number = 0;

  @Output() barcodeInputChange = new EventEmitter<string>();
  @Output() barcodeEnter = new EventEmitter<void>();
  @Output() barcodeScanned = new EventEmitter<string>();
  @Output() toggleDrugSelector = new EventEmitter<void>();
  @Output() drugSelect = new EventEmitter<string>();
  @Output() addDrug = new EventEmitter<void>();
  @Output() removeItem = new EventEmitter<number>();
  @Output() quantityChange = new EventEmitter<{ index: number, quantity: number }>();

  private drugColors = [
    'bg-gradient-to-br from-blue-400 to-blue-600',
    'bg-gradient-to-br from-green-400 to-green-600',
    'bg-gradient-to-br from-purple-400 to-purple-600',
    'bg-gradient-to-br from-pink-400 to-pink-600',
    'bg-gradient-to-br from-yellow-400 to-yellow-600',
    'bg-gradient-to-br from-red-400 to-red-600',
  ];

  getDrugColorClass(index: number): string {
    return this.drugColors[index % this.drugColors.length];
  }

  getDrugName(drugId: string): string {
    const drug = this.pharmacyDrugs.find(d => d.id === drugId);
    return drug?.generalDrug?.name || 'Unknown Drug';
  }

  onBarcodeInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.barcodeInputChange.emit(input.value);
  }

  onBarcodeEnter(): void {
    this.barcodeEnter.emit();
  }

  onBarcodeScanned(barcode: string): void {
    this.barcodeScanned.emit(barcode);
  }

  onToggleDrugSelector(): void {
    this.toggleDrugSelector.emit();
  }

  onDrugSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.drugSelect.emit(select.value);
  }

  onAddDrug(): void {
    this.addDrug.emit();
  }

  onRemoveItem(index: number): void {
    this.removeItem.emit(index);
  }

  incrementQuantity(index: number): void {
    const currentQuantity = this.itemsArray.at(index).get('quantity')?.value || 1;
    this.quantityChange.emit({index, quantity: currentQuantity + 1});
  }

  decrementQuantity(index: number): void {
    const currentQuantity = this.itemsArray.at(index).get('quantity')?.value || 1;
    if (currentQuantity > 1) {
      this.quantityChange.emit({index, quantity: currentQuantity - 1});
    }
  }

  onQuantityInputChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const quantity = Math.max(1, parseInt(input.value) || 1);
    this.quantityChange.emit({index, quantity});
  }
}
