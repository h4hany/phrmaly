import { Component, Input, TemplateRef, ContentChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { AlertComponent } from '../alert/alert.component';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-modern-form-wrapper',
  standalone: true,
  imports: [CommonModule, TranslatePipe, AlertComponent],
  template: `
    <div class="min-h-screen" [style.background]="'var(--page-bg)'">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8 animate-fade-in">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            {{ title | translate }}
          </h1>
          @if (description) {
            <p class="text-gray-600">
              {{ description | translate }}
            </p>
          }
        </div>

        @if (errorMessage) {
          <div class="mb-6 animate-slide-down">
            <app-alert type="error" [title]="errorMessage" />
          </div>
        }

        <!-- Main Content Card -->
        <div class="rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up" style="animation-delay: 0.2s; background: var(--card-bg);">
          <ng-content></ng-content>
        </div>
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
  styles: []
})
export class ModernFormWrapperComponent {
  @Input() title!: string;
  @Input() description?: string;
  @Input() errorMessage?: string;
  
  constructor(public translationService: TranslationService) {}
  
  get isRTL(): boolean {
    return this.translationService.getCurrentLanguage() === 'ar';
  }
}

