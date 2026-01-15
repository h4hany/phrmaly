import { Component, Input, output, signal, effect, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface AutocompleteOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-autocomplete',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: AutocompleteComponent,
      multi: true
    }
  ],
  template: `
    <div class="relative" #container>
      <input
        type="text"
        #input
        [value]="displayValue()"
        (input)="onInput($event)"
        (focus)="onFocus()"
        (blur)="onBlur()"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [class]="inputClasses"
        [class.border-red-500]="hasError"
      />
      @if (isOpen() && filteredOptions().length > 0) {
        <div class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-[var(--radius-md)] py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
          @for (option of filteredOptions(); track option.value) {
            <button
              type="button"
              [class]="getOptionClasses(option.value)"
              (mousedown)="selectOption(option)"
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
export class AutocompleteComponent implements ControlValueAccessor {
  @Input() options: AutocompleteOption[] = [];
  @Input() placeholder = 'Type to search...';
  @Input() disabled = false;
  @Input() allowCustom = true; // Allow values not in the options list
  @Input() hasError = false;

  @ViewChild('input') inputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;

  value = signal<string>('');
  displayValue = signal<string>('');
  isOpen = signal(false);
  filteredOptions = signal<AutocompleteOption[]>([]);

  private onChange = (value: string) => {};
  private onTouched = () => {};

  constructor() {
    effect(() => {
      const currentValue = this.value();
      if (currentValue) {
        const option = this.options.find(opt => opt.value === currentValue);
        this.displayValue.set(option?.label || currentValue);
      } else {
        this.displayValue.set('');
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (this.containerRef && !this.containerRef.nativeElement.contains(event.target as Node)) {
      this.isOpen.set(false);
    }
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchValue = input.value;
    this.displayValue.set(searchValue);
    
    if (searchValue) {
      const filtered = this.options.filter(option =>
        option.label.toLowerCase().includes(searchValue.toLowerCase())
      );
      this.filteredOptions.set(filtered);
      this.isOpen.set(true);
    } else {
      this.filteredOptions.set(this.options);
      this.isOpen.set(true);
    }

    // Update value if custom values are allowed
    if (this.allowCustom) {
      this.value.set(searchValue);
      this.onChange(searchValue);
    }
  }

  onFocus(): void {
    if (!this.disabled) {
      this.filteredOptions.set(this.options);
      this.isOpen.set(true);
    }
  }

  onBlur(): void {
    // Delay to allow option click to register
    setTimeout(() => {
      this.isOpen.set(false);
      this.onTouched();
    }, 200);
  }

  selectOption(option: AutocompleteOption): void {
    this.value.set(option.value);
    this.displayValue.set(option.label);
    this.isOpen.set(false);
    this.onChange(option.value);
    this.onTouched();
  }

  get inputClasses(): string {
    const base = 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-[#166534] text-sm';
    return this.disabled ? `${base} opacity-50 cursor-not-allowed bg-gray-100` : base;
  }

  getOptionClasses(value: string): string {
    const base = 'block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer';
    return value === this.value() 
      ? `${base} bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-medium`
      : `${base} text-gray-900`;
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}

