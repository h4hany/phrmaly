import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

export interface WizardStep {
  number: number;
  title: string;
  subtitle: string;
  completed: boolean;
}

@Component({
  selector: 'app-wizard',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="wizard-container">
      <!-- Header -->
      <div class="mb-8 animate-fade-in">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ getCurrentStepTitle() | translate }}
        </h1>
        <p class="text-gray-600">
          {{ getCurrentStepDescription() | translate }}
        </p>
      </div>

      @if (errorMessage) {
        <div class="mb-6 animate-slide-down">
          <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {{ errorMessage | translate }}
          </div>
        </div>
      }

      <!-- Enhanced Wizard Steps Indicator -->
      <div class="mb-12 animate-fade-in-up" style="animation-delay: 0.1s">
        <div class="relative">
          <!-- Progress Bar Background -->
          <div class="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full"></div>
          <!-- Active Progress Bar -->
          <div
            class="absolute top-5 h-1 rounded-full transition-all duration-700 ease-out"
            [style.width]="getProgressWidth()"
            [style.background]="'var(--sidebar-bg)'"
            [style.left]="isRTL() ? 'auto' : '0'"
            [style.right]="isRTL() ? '0' : 'auto'"
          ></div>

          <div class="relative flex justify-between" [class.flex-row-reverse]="isRTL()">
            @for (step of getStepsForDisplay(); track step.number) {
              <div 
                class="flex flex-col items-center group"
                [class.cursor-pointer]="canNavigateToStep(step.number)"
                (click)="canNavigateToStep(step.number) && goToStep(step.number)"
              >
                <div
                  class="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border-2"
                  [class.bg-white]="currentStep < step.number"
                  [class.border-gray-300]="currentStep < step.number"
                  [class.scale-110]="currentStep === step.number"
                  [style.background]="currentStep >= step.number ? 'var(--sidebar-bg)' : 'white'"
                  [style.border-color]="currentStep >= step.number ? 'var(--sidebar-bg)' : '#d1d5db'"
                >
                  @if (currentStep > step.number || step.completed) {
                    <!-- Completed step - show checkmark -->
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  } @else if (currentStep === step.number) {
                    <!-- Current step - show checkmark icon, not number -->
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  } @else {
                    <!-- Unselected step (currentStep < step.number) - show number -->
                    <span class="text-lg font-bold text-gray-500">
                      {{ step.number }}
                    </span>
                  }
                </div>
                <div class="mt-3 text-center">
                  <p 
                    class="text-sm font-semibold transition-colors" 
                    [class.text-gray-900]="currentStep > step.number || step.completed" 
                    [class.text-gray-500]="currentStep < step.number && !step.completed" 
                    [style.color]="currentStep === step.number ? 'var(--sidebar-active-text)' : ''"
                  >
                    {{ step.title | translate }}
                  </p>
                  <p class="text-xs text-gray-500 mt-1 max-w-[120px]">{{ step.subtitle | translate }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Main Content Card -->
      <div class="rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up" style="animation-delay: 0.2s; background: var(--card-bg);">
        <ng-content></ng-content>
      </div>
    </div>

    <style>
      @keyframes fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes fade-in-up {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes slide-down {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .animate-fade-in {
        animation: fade-in 0.5s ease-out;
      }

      .animate-fade-in-up {
        animation: fade-in-up 0.6s ease-out;
      }

      .animate-slide-down {
        animation: slide-down 0.3s ease-out;
      }
    </style>
  `,
  styles: [`
    .wizard-container {
      min-height: 100vh;
      background: var(--page-bg);
    }
  `]
})
export class WizardComponent {
  private translationService = inject(TranslationService);

  @Input() steps: WizardStep[] = [];
  @Input() currentStep: number = 1;
  @Input() errorMessage: string = '';
  @Input() allowStepNavigation: boolean = true;

  @Output() stepChange = new EventEmitter<number>();

  isRTL = computed(() => this.translationService.getCurrentLanguage() === 'ar');

  getStepsForDisplay(): WizardStep[] {
    return this.isRTL() ? [...this.steps].reverse() : this.steps;
  }

  getCurrentStepTitle(): string {
    const step = this.steps.find(s => s.number === this.currentStep);
    return step?.title || '';
  }

  getCurrentStepDescription(): string {
    const step = this.steps.find(s => s.number === this.currentStep);
    return step?.subtitle || '';
  }

  getProgressWidth(): string {
    if (this.steps.length === 0) return '0%';
    const progress = ((this.currentStep - 1) / (this.steps.length - 1)) * 100;
    return `${progress}%`;
  }

  getProgressPosition(): string {
    if (this.isRTL()) {
      // In RTL, progress starts from right
      const progress = ((this.currentStep - 1) / (this.steps.length - 1)) * 100;
      return `${100 - progress}%`;
    }
    return '0';
  }

  canNavigateToStep(stepNumber: number): boolean {
    if (!this.allowStepNavigation) return false;
    const step = this.steps.find(s => s.number === stepNumber);
    return stepNumber < this.currentStep || (step?.completed === true);
  }

  goToStep(stepNumber: number): void {
    if (this.canNavigateToStep(stepNumber)) {
      this.stepChange.emit(stepNumber);
    }
  }
}

