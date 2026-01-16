import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../badge/badge.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

@Component({
  selector: 'app-risk-badge',
  standalone: true,
  imports: [CommonModule, BadgeComponent, TranslatePipe],
  template: `
    <app-badge [variant]="badgeVariant" [class]="badgeClasses">
      <div class="flex items-center gap-1.5">
        @if (showIcon) {
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        }
        <span>{{ label | translate }}</span>
        @if (score !== undefined) {
          <span class="font-semibold">({{ score }})</span>
        }
      </div>
    </app-badge>
  `,
  styles: []
})
export class RiskBadgeComponent {
  @Input() level: RiskLevel = 'low';
  @Input() score?: number;
  @Input() showIcon = true;
  @Input() customLabel?: string;

  get label(): string {
    if (this.customLabel) return this.customLabel;
    const labels: { [key in RiskLevel]: string } = {
      low: 'risk.low',
      medium: 'risk.medium',
      high: 'risk.high',
      critical: 'risk.critical'
    };
    return labels[this.level];
  }

  get badgeVariant(): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    const variants: { [key in RiskLevel]: 'success' | 'warning' | 'danger' | 'info' | 'default' } = {
      low: 'success',
      medium: 'info',
      high: 'warning',
      critical: 'danger'
    };
    return variants[this.level];
  }

  get badgeClasses(): string {
    return '';
  }
}

