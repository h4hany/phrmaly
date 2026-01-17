import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';

import {TranslatePipe} from '../../../core/pipes/translate.pipe';
import {Patient} from '../../../core/models/patient.model';
import {ButtonComponent} from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-qr-code-section',
  standalone: true,
  imports: [CommonModule, TranslatePipe, ButtonComponent, TranslatePipe],
  template: `
    <div class="space-y-6">
      <!-- Patient Info Card -->
      <div class="glass-card rounded-2xl p-6 shadow-xl">
        <div class="flex items-center mb-4">
          <div
            class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mr-3">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">{{ 'invoice.voucher.patientInfo' | translate }}</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-gray-50 rounded-xl p-4">
            <label class="block text-xs font-medium text-gray-500 mb-1">{{ 'patient.fullName' | translate }}</label>
            <div class="text-base font-semibold text-gray-900">{{ selectedPatient?.fullName || '-' }}</div>
          </div>
          <div class="bg-gray-50 rounded-xl p-4">
            <label class="block text-xs font-medium text-gray-500 mb-1">{{ 'patient.phone' | translate }}</label>
            <div class="text-base font-semibold text-gray-900">{{ selectedPatient?.phone || '-' }}</div>
          </div>
        </div>
      </div>

      <!-- QR Code Display -->
      <div class="qr-container glass-card rounded-2xl p-8 shadow-xl">
        <div class="flex flex-col items-center">
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-gray-900 text-center">{{ 'invoice.voucher.qrCode' | translate }}</h3>
            <p class="text-sm text-gray-500 text-center mt-1">{{ 'invoice.voucher.scanToRedeem' | translate }}</p>
          </div>

          <div class="bg-white p-6 rounded-2xl border-4 border-gray-100 shadow-inner">
            <ng-content></ng-content>
          </div>

          <div class="mt-6 text-center max-w-md">
            <p class="text-sm text-gray-600 mb-4">{{ 'invoice.voucher.qrCodeDescription' | translate }}</p>
            <app-button
              type="button"
              variant="primary"
              (onClick)="onSend()"
              [loading]="sendingVoucher"
              class="w-full"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
              {{ 'invoice.voucher.sendToPatient' | translate }}
            </app-button>
          </div>
        </div>
      </div>

      <!-- Voucher Details -->
      <div class="glass-card rounded-2xl p-6 shadow-xl">
        <h4 class="text-sm font-semibold text-gray-700 mb-3">{{ 'invoice.voucher.details' | translate }}</h4>
        <div class="space-y-2">
          <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <span class="text-sm text-gray-600">{{ 'invoice.voucher.code' | translate }}</span>
            <span
              class="text-sm font-semibold text-gray-900 font-mono bg-gray-100 px-3 py-1 rounded-lg">{{ voucherCode }}</span>
          </div>
          <div class="flex justify-between items-center py-2">
            <span class="text-sm text-gray-600">{{ 'invoice.voucher.status' | translate }}</span>
            <span
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {{ 'common.active' | translate }}
            </span>
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
        <app-button type="button" variant="outline" (onClick)="onClose()">
          {{ 'common.close' | translate }}
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

    .qr-container {
      animation: fadeIn 0.5s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `]
})
export class QrCodeSectionComponent {
  @Input() selectedPatient: Patient | null = null;
  @Input() voucherCode: string = '';
  @Input() sendingVoucher: boolean = false;

  @Output() send = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  onSend(): void {
    this.send.emit();
  }

  onBack(): void {
    this.back.emit();
  }

  onClose(): void {
    this.close.emit();
  }
}
