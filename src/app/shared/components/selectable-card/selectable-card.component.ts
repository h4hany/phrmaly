import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-selectable-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="selectable-card relative rounded-xl p-6 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
      [class.selected]="selected"
      [class.border-2]="true"
      [class.border-gray-200]="!selected"
      [style.border-color]="selected ? 'var(--primary-bg, #D9F275)' : '#e5e7eb'"
      [style.background-color]="selected ? 'rgba(217, 242, 117, 0.1)' : 'transparent'"
      [class.shadow-lg]="selected"
      (click)="onCardClick()"
    >
      <!-- Selection Overlay -->
      @if (selected) {
        <div class="selection-overlay absolute inset-0 rounded-xl pointer-events-none">
          <div class="absolute inset-0 rounded-xl bg-[var(--primary-bg,#D9F275)]/25 backdrop-blur-[2px] border-3" [style.border-color]="'var(--primary-bg, #D9F275)'"></div>
          
          <!-- Animated checkmark circle -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="checkmark-container">
              <div class="checkmark-circle">
                <svg class="checkmark-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                    d="M5 13l4 4L19 7"
                    class="checkmark-path"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Glow effects -->
          <div class="corner-glow corner-glow-1"></div>
          <div class="corner-glow corner-glow-2"></div>
          <div class="corner-glow corner-glow-3"></div>
          <div class="corner-glow corner-glow-4"></div>
        </div>
      }

      <!-- Card Content -->
      <div class="relative z-10">
        <ng-content></ng-content>
      </div>
    </div>

    <style>
      .selectable-card {
        user-select: none;
      }

      .selection-overlay {
        z-index: 15;
        opacity: 0;
        transform: scale(0.98);
        animation: fadeInScale 0.3s ease-out forwards;
      }

      @keyframes fadeInScale {
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      .selection-overlay > div:first-child {
        box-shadow:
          inset 0 0 80px rgba(217, 242, 117, 0.15),
          0 0 0 3px var(--primary-bg, #D9F275),
          0 8px 24px rgba(0, 0, 0, 0.2);
      }

      .corner-glow {
        position: absolute;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: radial-gradient(circle, var(--primary-bg, #D9F275) 0%, transparent 70%);
        opacity: 0;
        filter: blur(20px);
        animation: glowPulse 2s ease-in-out infinite;
      }

      .corner-glow-1 {
        top: -20px;
        right: -20px;
        animation-delay: 0s;
      }

      .corner-glow-2 {
        bottom: -20px;
        right: -20px;
        animation-delay: 0.5s;
      }

      .corner-glow-3 {
        top: -20px;
        left: -20px;
        animation-delay: 1s;
      }

      .corner-glow-4 {
        bottom: -20px;
        left: -20px;
        animation-delay: 1.5s;
      }

      @keyframes glowPulse {
        0%, 100% {
          opacity: 0.3;
          transform: scale(1);
        }
        50% {
          opacity: 0.6;
          transform: scale(1.2);
        }
      }

      .checkmark-container {
        position: relative;
        width: 80px;
        height: 80px;
        transform: scale(0);
        opacity: 0;
        animation: checkmarkBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.2s forwards;
      }

      @keyframes checkmarkBounce {
        0% {
          transform: scale(0) rotate(-45deg);
          opacity: 0;
        }
        70% {
          transform: scale(1.15) rotate(5deg);
          opacity: 1;
        }
        100% {
          transform: scale(1) rotate(0deg);
          opacity: 1;
        }
      }

      .checkmark-circle {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--primary-bg, #D9F275) 0%, #bef264 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow:
          0 0 0 3px white,
          0 0 0 6px var(--primary-bg, #D9F275),
          0 8px 20px rgba(0, 0, 0, 0.3);
        position: relative;
      }

      .checkmark-circle::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.5), transparent);
        opacity: 0.8;
      }

      .checkmark-circle::after {
        content: '';
        position: absolute;
        inset: -6px;
        border-radius: 50%;
        background: transparent;
        border: 2px solid var(--primary-bg, #D9F275);
        animation: ripple 1.5s ease-out infinite;
      }

      @keyframes ripple {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        100% {
          transform: scale(1.5);
          opacity: 0;
        }
      }

      .checkmark-icon {
        width: 40px;
        height: 40px;
        color: var(--primary-text, #003032);
        position: relative;
        z-index: 1;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
      }

      .checkmark-path {
        stroke-dasharray: 50;
        stroke-dashoffset: 50;
        animation: drawCheck 0.4s ease-out 0.5s forwards;
      }

      @keyframes drawCheck {
        to {
          stroke-dashoffset: 0;
        }
      }
    </style>
  `,
  styles: []
})
export class SelectableCardComponent {
  @Input() selected: boolean = false;

  @Output() cardClick = new EventEmitter<void>();

  onCardClick(): void {
    this.cardClick.emit();
  }
}

