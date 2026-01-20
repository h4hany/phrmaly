import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

export interface WizardStep {
  id: string;
  label: string;
  description?: string;
  completed?: boolean;
  disabled?: boolean;
}

@Component({
  selector: 'app-wizard-stepper',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="w-full" [style]="containerStyles">
      <div class="flex items-center justify-between">
        @for (step of steps; track step.id; let i = $index) {
          <div class="flex items-center flex-1">
            <!-- Step Circle -->
            <button
              type="button"
              [disabled]="step.disabled || i > currentStep"
              (click)="!step.disabled && i <= currentStep && onStepClick(i)"
              [class]="getStepClasses(step, i)"
              [style]="getStepStyles(step, i)"
            >
              @if (step.completed && i < currentStep) {
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              } @else {
                <span class="text-sm font-semibold">{{ i + 1 }}</span>
              }
            </button>
            
            <!-- Step Label -->
            <div class="ml-3 flex-1">
              <div class="text-sm font-medium" [style]="getLabelStyles(step, i)">
                {{ step.label | translate }}
              </div>
              @if (step.description) {
                <div class="text-xs mt-0.5" [style]="getDescriptionStyles(step, i)">
                  {{ step.description | translate }}
                </div>
              }
            </div>
            
            <!-- Connector Line -->
            @if (i < steps.length - 1) {
              <div 
                class="flex-1 h-0.5 mx-4"
                [style]="getConnectorStyles(step, i)"
              ></div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class WizardStepperComponent {
  @Input() steps: WizardStep[] = [];
  @Input() currentStep = 0;
  @Output() stepChange = new EventEmitter<number>();

  get containerStyles(): string {
    return 'padding: 1.5rem; background-color: var(--card-bg); border-radius: var(--radius-lg);';
  }

  getStepClasses(step: WizardStep, index: number): string {
    const base = 'w-10 h-10 rounded-full flex items-center justify-center transition-all';
    if (step.disabled || index > this.currentStep) {
      return `${base} cursor-not-allowed opacity-50`;
    }
    if (index === this.currentStep) {
      return `${base} cursor-pointer ring-2 ring-offset-2`;
    }
    return `${base} cursor-pointer`;
  }

  getStepStyles(step: WizardStep, index: number): string {
    if (step.disabled || index > this.currentStep) {
      return 'background-color: #e5e7eb; color: #9ca3af;';
    }
    if (step.completed && index < this.currentStep) {
      return 'background-color: #10b981; color: white;';
    }
    if (index === this.currentStep) {
      return 'background-color: var(--primary-bg); color: var(--primary-text); ring-color: var(--primary-bg);';
    }
    return 'background-color: #e5e7eb; color: #6b7280;';
  }

  getLabelStyles(step: WizardStep, index: number): string {
    if (step.disabled || index > this.currentStep) {
      return 'color: #9ca3af;';
    }
    if (index === this.currentStep) {
      return 'color: var(--primary-text);';
    }
    return 'color: var(--card-text);';
  }

  getDescriptionStyles(step: WizardStep, index: number): string {
    if (step.disabled || index > this.currentStep) {
      return 'color: #9ca3af; opacity: 0.7;';
    }
    return 'color: var(--card-text); opacity: 0.7;';
  }

  getConnectorStyles(step: WizardStep, index: number): string {
    if (step.completed && index < this.currentStep) {
      return 'background-color: #10b981;';
    }
    if (index < this.currentStep) {
      return 'background-color: #e5e7eb;';
    }
    return 'background-color: #e5e7eb;';
  }

  onStepClick(index: number): void {
    if (index !== this.currentStep && index <= this.currentStep) {
      this.stepChange.emit(index);
    }
  }
}



