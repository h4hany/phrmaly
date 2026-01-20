import { Component, EventEmitter, Input, Output, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { Voucher } from '../../../core/models/voucher.model';
import { VoucherCardComponent } from './voucher-card.component';

@Component({
  selector: 'app-share-voucher-step',
  standalone: true,
  imports: [CommonModule, TranslatePipe, VoucherCardComponent],
  template: `
    <div class="p-8 space-y-8">
      <!-- Patient Info Card -->
      <div class="rounded-xl p-6 border-2" style="background: rgba(0, 48, 50, 0.1); border-color: rgba(0, 48, 50, 0.3); color: rgb(55 65 81);">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 rounded-full flex items-center justify-center mr-3" [style.background]="'rgba(0, 48, 50, 0.2)'">
            <svg class="w-6 h-6" [style.color]="'var(--sidebar-active-text)'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900">{{ 'invoice.voucher.patientInfo' | translate }}</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-white rounded-lg p-4">
            <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">{{ 'patient.fullName' | translate }}</label>
            <div class="text-lg font-bold text-gray-900">{{ voucher.patient.fullName }}</div>
          </div>
          <div class="bg-white rounded-lg p-4">
            <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">{{ 'patient.phone' | translate }}</label>
            <div class="text-lg font-bold text-gray-900">{{ voucher.patient.phone }}</div>
          </div>
        </div>
      </div>

      <!-- Voucher Card Display -->
      <div class="flex justify-center">
        <app-voucher-card
          #voucherCard
          [voucher]="voucher"
          [averageDiscountPercentage]="averageDiscountPercentage"
          (onCardReady)="onCardReady.emit($event)"
          (onCardCopied)="onCardCopied.emit($event)"
        ></app-voucher-card>
      </div>

      <!-- Instructions -->
      <div class="text-center space-y-4">
        <div class="bg-gradient-to-br from-green-50 to-emerald-50/30 rounded-xl p-6 border-2 border-green-200">
          <div class="flex items-start justify-center">
            <svg class="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm text-green-900 text-left">
              {{ 'invoice.voucher.qrCodeDescription' | translate }}
            </p>
          </div>
        </div>

        <button
          type="button"
          (click)="onSendVoucher.emit()"
          [disabled]="sendingVoucher"
          class="px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none transition-all duration-200 flex items-center gap-3 mx-auto"
          [style.background]="'var(--primary-bg)'"
          [style.color]="'var(--primary-text)'"
        >
          @if (sendingVoucher) {
            <svg class="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ 'invoice.voucher.sending' | translate }}
          } @else {
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
            {{ 'invoice.voucher.sendToPatient' | translate }}
          }
        </button>
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
          (click)="onClose.emit()"
          class="px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-800 hover:shadow-lg transition-all duration-200"
        >
          {{ 'common.close' | translate }}
        </button>
      </div>
    </div>
  `
})
export class ShareVoucherStepComponent implements AfterViewInit {
  @ViewChild('voucherCard') voucherCard!: VoucherCardComponent;
  @Input() voucher!: Voucher;
  @Input() averageDiscountPercentage = 0;
  @Input() sendingVoucher = false;

  @Output() onSendVoucher = new EventEmitter<void>();
  @Output() onBack = new EventEmitter<void>();
  @Output() onClose = new EventEmitter<void>();
  @Output() onCardReady = new EventEmitter<ElementRef<HTMLDivElement>>();
  @Output() onCardCopied = new EventEmitter<Blob>();
  
  ngAfterViewInit(): void {
    // Card ready event is handled by the component itself
  }
}

