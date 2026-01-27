import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-performance-score-ring',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="relative inline-flex items-center justify-center">
      <svg class="transform -rotate-90" [attr.width]="size" [attr.height]="size">
        <!-- Background circle -->
        <circle
          [attr.cx]="center"
          [attr.cy]="center"
          [attr.r]="radius"
          fill="none"
          stroke="var(--border-color)"
          [attr.stroke-width]="strokeWidth"
        />
        <!-- Progress circle -->
        <circle
          [attr.cx]="center"
          [attr.cy]="center"
          [attr.r]="radius"
          fill="none"
          [attr.stroke]="scoreColor"
          [attr.stroke-width]="strokeWidth"
          [attr.stroke-dasharray]="circumference"
          [attr.stroke-dashoffset]="offset"
          stroke-linecap="round"
          class="transition-all duration-500"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-2xl font-bold" [style.color]="scoreColor">{{ score }}</span>
        @if (showLabel) {
          <span class="text-xs text-[var(--card-text)]">{{ label | translate }}</span>
        }
      </div>
    </div>
  `,
  styles: []
})
export class PerformanceScoreRingComponent {
  @Input() score: number = 0; // 0-100
  @Input() size: number = 120;
  @Input() strokeWidth: number = 8;
  @Input() showLabel: boolean = true;
  @Input() label: string = '';

  get center(): number {
    return this.size / 2;
  }

  get radius(): number {
    return (this.size - this.strokeWidth) / 2;
  }

  get circumference(): number {
    return 2 * Math.PI * this.radius;
  }

  get offset(): number {
    const progress = this.score / 100;
    return this.circumference * (1 - progress);
  }

  get scoreColor(): string {
    if (this.score >= 90) return '#10b981'; // green
    if (this.score >= 80) return '#3b82f6'; // blue
    if (this.score >= 70) return '#f59e0b'; // amber
    if (this.score >= 60) return '#f97316'; // orange
    return '#ef4444'; // red
  }
}





