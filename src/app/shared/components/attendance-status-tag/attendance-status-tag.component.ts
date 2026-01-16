import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../badge/badge.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'early_leave' | 'half_day' | 'on_leave';

@Component({
  selector: 'app-attendance-status-tag',
  standalone: true,
  imports: [CommonModule, BadgeComponent, TranslatePipe],
  template: `
    <app-badge [variant]="badgeVariant" [class]="badgeClass">
      <div class="flex items-center gap-1.5">
        @if (showIcon) {
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path [attr.d]="iconPath" fill-rule="evenodd" clip-rule="evenodd" />
          </svg>
        }
        <span>{{ label | translate }}</span>
        @if (minutes !== undefined) {
          <span class="text-xs opacity-75">({{ minutes }}m)</span>
        }
      </div>
    </app-badge>
  `,
  styles: []
})
export class AttendanceStatusTagComponent {
  @Input() status: AttendanceStatus = 'present';
  @Input() minutes?: number; // For late/early leave
  @Input() showIcon: boolean = true;

  get label(): string {
    const labels: { [key in AttendanceStatus]: string } = {
      present: 'hr.attendance.present',
      absent: 'hr.attendance.absent',
      late: 'hr.attendance.late',
      early_leave: 'hr.attendance.earlyLeave',
      half_day: 'hr.attendance.halfDay',
      on_leave: 'hr.attendance.onLeave'
    };
    return labels[this.status];
  }

  get badgeVariant(): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    const variants: { [key in AttendanceStatus]: 'success' | 'warning' | 'danger' | 'info' | 'default' } = {
      present: 'success',
      absent: 'danger',
      late: 'warning',
      early_leave: 'warning',
      half_day: 'info',
      on_leave: 'default'
    };
    return variants[this.status];
  }

  get badgeClass(): string {
    return '';
  }

  get iconPath(): string {
    const icons: { [key in AttendanceStatus]: string } = {
      present: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z',
      absent: 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z',
      late: 'M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z',
      early_leave: 'M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z',
      half_day: 'M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z',
      on_leave: 'M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'
    };
    return icons[this.status];
  }
}

