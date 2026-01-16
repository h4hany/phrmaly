import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-staff-kpi-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe, IconComponent],
  template: `
    <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          @if (icon) {
            <app-icon [name]="icon" class="w-5 h-5 text-[var(--primary-color)]" />
          }
          <h3 class="text-sm font-medium text-[var(--card-text)]">{{ label | translate }}</h3>
        </div>
        @if (trend !== undefined) {
          <div class="flex items-center gap-1" [class]="trendClass">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              @if (trend > 0) {
                <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              } @else {
                <path fill-rule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              }
            </svg>
            <span class="text-xs font-medium">{{ trend > 0 ? '+' : '' }}{{ trend }}%</span>
          </div>
        }
      </div>
      <div class="flex items-baseline gap-2">
        <span class="text-3xl font-bold text-[var(--text-primary)]">{{ formattedValue }}</span>
        @if (unit) {
          <span class="text-sm text-[var(--card-text)]">{{ unit }}</span>
        }
      </div>
      @if (subtitle) {
        <p class="text-xs text-[var(--card-text)] mt-2">{{ subtitle | translate }}</p>
      }
    </div>
  `,
  styles: []
})
export class StaffKPICardComponent {
  @Input() label = '';
  @Input() value: string | number = 0;
  @Input() unit = '';
  @Input() subtitle = '';
  @Input() icon = '';
  @Input() trend?: number; // percentage change

  get formattedValue(): string {
    if (typeof this.value === 'number') {
      if (this.value >= 1000000) {
        return (this.value / 1000000).toFixed(1) + 'M';
      }
      if (this.value >= 1000) {
        return (this.value / 1000).toFixed(1) + 'K';
      }
      return this.value.toLocaleString();
    }
    return this.value;
  }

  get trendClass(): string {
    if (this.trend === undefined) return '';
    return this.trend >= 0 
      ? 'text-green-600' 
      : 'text-red-600';
  }
}

