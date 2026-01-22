import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-form-section',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="mb-10">
      <div class="flex items-center mb-6" >
        <div
          class="w-1 h-8 rounded-full"
          [class.mr-3]="!isRTL"
          [class.ml-3]="isRTL"
          [style.background]="'var(--sidebar-bg)'"
        ></div>
        <h3 class="text-xl font-bold text-gray-900">{{ title | translate }}</h3>
      </div>
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class FormSectionComponent {
  @Input() title!: string;

  constructor(public translationService: TranslationService) {}

  get isRTL(): boolean {
    return this.translationService.getCurrentLanguage() === 'ar';
  }
}

