import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslatePipe} from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-wizard-steps',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="glass-card rounded-2xl p-6 shadow-xl">
      <div class="flex items-center justify-between relative">

        <!-- Step 1 -->
        <div class="flex flex-col items-center flex-1 relative z-10">
          <div
            class="step-indicator flex items-center justify-center w-14 h-14 rounded-full shadow-lg mb-3 transition-all duration-300"
            [class.bg-gradient-to-br]="currentStep >= 1"
            [class.from-[var(--primary-color)]]="currentStep >= 1"
            [class.to-[var(--primary-dark)]]="currentStep >= 1"
            [class.text-white]="currentStep >= 1"
            [class.bg-gray-200]="currentStep < 1"
            [class.text-gray-500]="currentStep < 1"
            [class.scale-110]="currentStep === 1"
          >
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <span
            class="text-sm font-semibold transition-colors"
            [class.text-[var(--primary-color)]]="currentStep >= 1"
            [class.text-gray-500]="currentStep < 1"
          >
            {{ 'invoice.wizard.step1' | translate }}
          </span>
          <span class="text-xs text-gray-500 mt-1">{{ 'invoice.wizard.step1Desc' | translate }}</span>
        </div>

        <!-- Connector 1 -->
        <div
          class="flex-1 h-1 mx-4 rounded-full transition-all duration-300"
          [class.bg-gradient-to-r]="currentStep >= 2"
          [class.from-[var(--primary-color)]]="currentStep >= 2"
          [class.to-[var(--primary-dark)]]="currentStep >= 2"
          [class.bg-gray-300]="currentStep < 2"
        ></div>

        <!-- Step 2 -->
        <div class="flex flex-col items-center flex-1 relative z-10">
          <div
            class="step-indicator flex items-center justify-center w-14 h-14 rounded-full shadow-md mb-3 transition-all duration-300"
            [class.bg-gradient-to-br]="currentStep >= 2"
            [class.from-[var(--primary-color)]="currentStep >= 2"
            [class.to-[var(--primary-dark)]]="currentStep >= 2"
            [class.text-white]="currentStep >= 2"
            [class.bg-gray-200]="currentStep < 2"
            [class.text-gray-500]="currentStep < 2"
            [class.scale-110]="currentStep === 2"
          >
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
            </svg>
          </div>
          <span
            class="text-sm font-medium transition-colors"
            [class.text-[var(--primary-color)]]="currentStep >= 2"
            [class.text-gray-500]="currentStep < 2"
          >
            {{ 'invoice.wizard.step2' | translate }}
          </span>
          <span class="text-xs text-gray-400 mt-1">{{ 'invoice.wizard.step2Desc' | translate }}</span>
        </div>

        <!-- Connector 2 -->
        <div
          class="flex-1 h-1 mx-4 rounded-full transition-all duration-300"
          [class.bg-gradient-to-r]="currentStep >= 3"
          [class.from-[var(--primary-color)]]="currentStep >= 3"
          [class.to-[var(--primary-dark)]]="currentStep >= 3"
          [class.bg-gray-300]="currentStep < 3"
        ></div>

        <!-- Step 3 -->
        <div class="flex flex-col items-center flex-1 relative z-10">
          <div
            class="step-indicator flex items-center justify-center w-14 h-14 rounded-full shadow-md mb-3 transition-all duration-300"
            [class.bg-gradient-to-br]="currentStep >= 3"
            [class.from-[var(--primary-color)]="currentStep >= 3"
            [class.to-[var(--primary-dark)]]="currentStep >= 3"
            [class.text-white]="currentStep >= 3"
            [class.bg-gray-200]="currentStep < 3"
            [class.text-gray-500]="currentStep < 3"
            [class.scale-110]="currentStep === 3"
          >
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
            </svg>
          </div>
          <span
            class="text-sm font-medium transition-colors"
            [class.text-[var(--primary-color)]]="currentStep >= 3"
            [class.text-gray-500]="currentStep < 3"
          >
            {{ 'invoice.wizard.step3' | translate }}
          </span>
          <span class="text-xs text-gray-400 mt-1">{{ 'invoice.wizard.step3Desc' | translate }}</span>
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

    .step-indicator {
      transition: all 0.3s ease;
    }
  `]
})
export class WizardStepsComponent {
  @Input() currentStep: number = 1;
}
