import { Component, Input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" (click)="closeOnBackdrop && close()">
        <div class="flex min-h-screen items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50 transition-opacity" (click)="closeOnBackdrop && close()"></div>
          <div 
            class="relative bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            (click)="$event.stopPropagation()"
          >
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <h3 class="text-xl font-semibold text-gray-900">{{ title }}</h3>
              <button
                type="button"
                class="text-gray-400 hover:text-gray-600 transition-colors"
                (click)="close()"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Body -->
            <div class="px-6 py-6">
              <ng-content></ng-content>
            </div>

            <!-- Footer -->
            @if (showFooter) {
              <div class="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-200">
                <app-button variant="outline" (onClick)="close()">Cancel</app-button>
                <app-button 
                  variant="primary" 
                  (onClick)="confirm()"
                  [loading]="confirmLoading"
                >
                  {{ confirmText }}
                </app-button>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: []
})
export class ModalComponent {
  @Input() title = '';
  @Input() showFooter = true;
  @Input() confirmText = 'Confirm';
  @Input() confirmLoading = false;
  @Input() closeOnBackdrop = true;

  isOpen = signal(false);
  opened = output<void>();
  closed = output<void>();
  confirmed = output<void>();

  open(): void {
    this.isOpen.set(true);
    this.opened.emit();
  }

  close(): void {
    this.isOpen.set(false);
    this.closed.emit();
  }

  confirm(): void {
    this.confirmed.emit();
  }
}
