import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-wrapper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      @if (title) {
        <div>
          <h2 class="text-2xl font-bold text-gray-900">{{ title }}</h2>
          @if (subtitle) {
            <p class="mt-2 text-sm text-gray-600">{{ subtitle }}</p>
          }
        </div>
      }
      <div [class]="formClasses" [style]="formStyles">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: []
})
export class FormWrapperComponent {
  @Input() title?: string;
  @Input() subtitle?: string;

  get formClasses(): string {
    return 'p-6 space-y-6';
  }

  get formStyles(): string {
    return 'background-color: var(--card-bg); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);';
  }
}
