import { Component, Input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectOption } from '../../../core/models/common.model';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <button
        type="button"
        [class]="buttonClasses"
        (click)="isOpen.set(!isOpen())"
        (blur)="handleBlur()"
      >
        <span>{{ selectedLabel }}</span>
        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      @if (isOpen()) {
        <div class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-[var(--radius-md)] py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
          @for (option of options; track option.value) {
            <button
              type="button"
              [class]="getOptionClasses(option.value)"
              (click)="selectOption(option)"
            >
              {{ option.label }}
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: []
})
export class DropdownComponent {
  @Input() options: SelectOption[] = [];
  @Input() value: any = null;
  @Input() placeholder = 'Select...';
  @Input() disabled = false;
  
  selected = output<any>();

  isOpen = signal(false);

  get selectedLabel(): string {
    const option = this.options.find(opt => opt.value === this.value);
    return option?.label || this.placeholder;
  }

  get buttonClasses(): string {
    const base = 'w-full bg-white border border-gray-300 rounded-[var(--radius-md)] px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] flex items-center justify-between';
    return this.disabled ? `${base} opacity-50 cursor-not-allowed` : base;
  }

  selectOption(option: SelectOption): void {
    this.selected.emit(option.value);
    this.isOpen.set(false);
  }

  getOptionClasses(value: any): string {
    const base = 'block w-full text-left px-4 py-2 text-sm hover:bg-gray-100';
    return value === this.value 
      ? `${base} bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-medium`
      : `${base} text-gray-900`;
  }

  handleBlur(): void {
    setTimeout(() => this.isOpen.set(false), 200);
  }
}
