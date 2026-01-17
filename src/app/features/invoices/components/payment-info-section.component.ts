import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslatePipe} from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-payment-info-section',
  standalone: true,
  imports: [CommonModule, TranslatePipe, TranslatePipe],
  template: `
    <div class="glass-card rounded-2xl p-8 shadow-xl animate-slide-in">
      <div class="flex items-center mb-6">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mr-3">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900">{{ 'form.invoice.paymentInfo' | translate }}</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Payment Status -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">{{ 'invoice.paymentStatus' | translate }}</label>
          <select
            [value]="paymentStatus"
            (change)="onPaymentStatusChange($event)"
            class="custom-select w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 transition-all"
          >
            <option value="pending">{{ 'invoice.status.pending' | translate }}</option>
            <option value="partial">{{ 'invoice.status.partial' | translate }}</option>
            <option value="paid">{{ 'invoice.status.paid' | translate }}</option>
          </select>
        </div>

        <!-- Payment Method -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">{{ 'invoice.paymentMethod' | translate }}</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              type="button"
              (click)="selectPaymentMethod('cash')"
              class="payment-method-btn"
              [class.active]="paymentMethod === 'cash'"
            >
              <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <span class="text-xs font-medium">{{ 'form.invoice.cash' | translate }}</span>
            </button>
            <button
              type="button"
              (click)="selectPaymentMethod('card')"
              class="payment-method-btn"
              [class.active]="paymentMethod === 'card'"
            >
              <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
              <span class="text-xs font-medium">{{ 'form.invoice.card' | translate }}</span>
            </button>
            <button
              type="button"
              (click)="selectPaymentMethod('bank_transfer')"
              class="payment-method-btn"
              [class.active]="paymentMethod === 'bank_transfer'"
            >
              <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
              </svg>
              <span class="text-xs font-medium">{{ 'form.invoice.bankTransfer' | translate }}</span>
            </button>
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

    .custom-select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      background-size: 1.25rem;
      padding-right: 2.5rem;
    }

    .custom-select:focus {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15);
    }

    .payment-method-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      background-color: white;
      color: #6b7280;
      border-radius: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .payment-method-btn:hover {
      background-color: #f9fafb;
      border-color: #d1d5db;
    }

    .payment-method-btn.active {
      border-color: var(--primary-color);
      background-color: rgba(99, 102, 241, 0.05);
      color: var(--primary-color);
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
  `]
})
export class PaymentInfoSectionComponent {
  @Input() paymentStatus: string = 'pending';
  @Input() paymentMethod: string = '';

  @Output() paymentStatusChange = new EventEmitter<string>();
  @Output() paymentMethodChange = new EventEmitter<string>();

  onPaymentStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.paymentStatusChange.emit(select.value);
  }

  selectPaymentMethod(method: string): void {
    this.paymentMethodChange.emit(method);
  }
}
