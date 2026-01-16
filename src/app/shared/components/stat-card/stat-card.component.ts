import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div [class]="cardClasses" [style]="cardStyles">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <p class="text-sm font-medium mb-1" [style]="labelStyles">{{ label | translate }}</p>
          <div class="flex items-baseline gap-2">
            <p class="text-3xl font-bold mb-2" [style]="valueStyles">{{ value }}</p>
            @if (unit) {
              <span class="text-sm text-[var(--card-text)]">{{ unit }}</span>
            }
          </div>
          @if (trend) {
            <p class="text-sm" [style]="trendStyles">
              {{ trend }}
            </p>
          }
        </div>
        @if (icon) {
          <div [class]="iconContainerClasses">
            <span [innerHTML]="icon"></span>
          </div>
        }
      </div>
      @if (subtitle) {
        <div class="mt-4 pt-4 border-t" style="border-color: #e5e7eb;">
          <p class="text-sm" [style]="labelStyles">{{ subtitle | translate }}</p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() unit = '';
  @Input() subtitle = '';
  @Input() trend = '';
  @Input() trendUp = true;
  @Input() trendPositive = true;
  @Input() icon = '';
  @Input() highlighted = false;

  get cardClasses(): string {
    return 'p-6';
  }

  get cardStyles(): string {
    const base = 'background-color: var(--card-bg); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);';
    return base;
  }

  get labelStyles(): string {
    return 'color: var(--card-text);';
  }

  get valueStyles(): string {
    return 'color: #1f2937;'; // Strong color for numbers
  }

  get trendStyles(): string {
    const isPositive = this.trendPositive !== undefined ? this.trendPositive : this.trendUp;
    return isPositive ? 'color: #10b981;' : 'color: #ef4444;';
  }

  get iconContainerClasses(): string {
    const base = 'p-3 rounded-lg';
    return base;
  }
}
