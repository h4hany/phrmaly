import { Component, Input, Output, EventEmitter, forwardRef, signal, ElementRef, ViewChild, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { IconComponent } from '../icon/icon.component';
import { BaseInputComponent } from './base-input.component';

export interface AutocompleteOption {
  value: any;
  label: string;
  icon?: string;
  metadata?: any;
}

@Component({
  selector: 'app-autocomplete-input',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, IconComponent, BaseInputComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteInputComponent),
      multi: true
    }
  ],
  template: `
    <app-base-input
      [label]="label"
      [required]="required"
      [disabled]="disabled"
      [hasError]="hasError || !!serverError"
      [errorMessage]="serverError || errorMessage"
      [hint]="hint"
      [inputId]="inputId"
      [serverError]="serverError"
    >
      <div class="input-container" 
           [class.has-icon]="prefixIcon" 
           [class.has-suffix]="options.length > 0"
           [class.autocomplete-mode]="true"
           #container>
        @if (prefixIcon) {
          <div class="input-prefix-icon">
            <app-icon [name]="prefixIcon" [size]="iconSize" [color]="'currentColor'" />
          </div>
        } @else {
          <div class="input-prefix-icon">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        }
        
        <input
          #input
          [id]="inputId"
          [attr.name]="name || null"
          type="text"
          [(ngModel)]="inputValue"
          (ngModelChange)="onInputChange($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
          (input)="onAutocompleteInput($event)"
          [placeholder]="placeholder | translate"
          [disabled]="disabled"
          [readonly]="readonly"
          [required]="required"
          class="input-field"
          [class.has-error]="hasError || !!serverError"
          [class.has-prefix]="true"
          [class.has-suffix]="options.length > 0"
        />
        
        @if (options.length > 0) {
          <div class="input-suffix-icon autocomplete-arrow">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        }
      </div>

      <!-- Autocomplete Dropdown -->
      @if (isOpen() && (filteredOptions().length > 0 || showNoDataMessage || (allowAddNew && inputValue.trim()))) {
        <div class="autocomplete-dropdown">
          <div class="autocomplete-dropdown-content">
            @if (filteredOptions().length > 0) {
              @for (option of filteredOptions(); track getOptionValue(option)) {
                <button
                  type="button"
                  (click)="selectOption(option)"
                  class="autocomplete-option"
                  (mouseenter)="onOptionHover($event)"
                  (mouseleave)="onOptionLeave($event)"
                >
                  <div class="flex items-center">
                    @if (option.icon) {
                      <app-icon [name]="option.icon" size="16" class="mr-2 text-gray-400" />
                    } @else if (defaultIcon) {
                      <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                    <span>{{ getOptionLabel(option) | translate }}</span>
                  </div>
                </button>
              }
            } @else if (showNoDataMessage && !allowAddNew) {
              <div class="autocomplete-no-data">
                {{ noDataMessage | translate }}
              </div>
            }
            @if (allowAddNew && inputValue.trim() && filteredOptions().length === 0) {
              <button
                type="button"
                (click)="onAddNew.emit(inputValue)"
                class="autocomplete-add-new"
              >
                <div class="flex items-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  {{ addNewLabel | translate }}: {{ inputValue }}
                </div>
              </button>
            }
          </div>
        </div>
      }
    </app-base-input>
  `,
  styles: [`
    .input-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-container.has-icon .input-field {
      padding-left: 3.5rem;
    }

    .input-container.has-suffix .input-field {
      padding-right: 3rem;
    }

    .input-prefix-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: rgb(156, 163, 175);
      pointer-events: none;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .input-suffix-icon {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: rgb(156, 163, 175);
      pointer-events: none;
      z-index: 1;
    }

    .autocomplete-arrow {
      pointer-events: none;
    }

    .input-field {
      width: 100%;
      padding: 0.875rem 1rem;
      border: 2px solid rgb(229, 231, 235);
      border-radius: 0.75rem;
      font-size: 0.875rem;
      background-color: white;
      color: rgb(17, 24, 39);
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .input-field.has-prefix {
      padding-left: 3.5rem;
    }

    .input-field:focus {
      outline: none;
      border-color: var(--sidebar-bg, rgb(0, 48, 50));
      box-shadow: 0 0 0 4px rgba(0, 48, 50, 0.1);
    }

    .input-field:hover:not(:disabled):not(:read-only) {
      border-color: rgb(209, 213, 219);
    }

    .input-field.has-error {
      border-color: rgb(239, 68, 68);
    }

    .input-field.has-error:focus {
      border-color: rgb(239, 68, 68);
      box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
    }

    .input-field:disabled,
    .input-field[readonly] {
      background-color: rgb(249, 250, 251);
      color: rgb(156, 163, 175);
      cursor: not-allowed;
      border-color: rgb(229, 231, 235);
    }

    .autocomplete-dropdown {
      position: absolute;
      z-index: 20;
      margin-top: 0.5rem;
      width: 100%;
      background: white;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      max-height: 16rem;
      border-radius: 0.75rem;
      border: 1px solid rgb(243, 244, 246);
      overflow: hidden;
      animation: slide-down 0.2s ease-out;
    }

    @keyframes slide-down {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .autocomplete-dropdown-content {
      padding: 0.5rem 0;
      max-height: 16rem;
      overflow-y: auto;
    }

    .autocomplete-option {
      display: block;
      width: 100%;
      text-align: left;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      transition: all 0.2s;
      cursor: pointer;
      border-left: 4px solid transparent;
      color: rgb(55, 65, 81);
      background: transparent;
      border-top: none;
      border-right: none;
      border-bottom: none;
    }

    .autocomplete-option:hover {
      background-color: rgba(0, 48, 50, 0.1);
      border-left-color: var(--sidebar-bg);
    }

    .autocomplete-no-data {
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      color: rgb(107, 114, 128);
    }

    .autocomplete-add-new {
      display: block;
      width: 100%;
      text-align: left;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      font-weight: 600;
      transition: all 0.2s;
      cursor: pointer;
      color: rgb(22, 163, 74);
      background: transparent;
      border: none;
      border-left: 4px solid transparent;
    }

    .autocomplete-add-new:hover {
      background-color: rgb(240, 253, 244);
      border-left-color: rgb(22, 163, 74);
    }
  `]
})
export class AutocompleteInputComponent extends BaseInputComponent implements ControlValueAccessor, OnInit, OnChanges, OnDestroy {
  @Input() placeholder: string = '';
  @Input() name?: string;
  @Input() readonly: boolean = false;
  @Input() prefixIcon?: string;
  @Input() iconSize: number = 20;
  @Input() options: AutocompleteOption[] = [];
  @Input() defaultIcon: boolean = true;
  @Input() allowAddNew: boolean = false;
  @Input() showNoDataMessage: boolean = true;
  @Input() noDataMessage: string = 'common.noData';
  @Input() addNewLabel: string = 'common.addNew';
  @Input() filterFunction?: (option: AutocompleteOption, searchTerm: string) => boolean;
  @Input() displayFunction?: (option: AutocompleteOption) => string;

  @Output() optionSelected = new EventEmitter<AutocompleteOption>();
  @Output() inputChanged = new EventEmitter<string>();
  @Output() onAddNew = new EventEmitter<string>();

  @ViewChild('input') inputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('container') containerRef?: ElementRef<HTMLDivElement>;

  inputValue: string = '';
  
  // Autocomplete state
  isOpen = signal(false);
  isFocused = signal(false);
  filteredOptions = signal<AutocompleteOption[]>([]);
  selectedOption: AutocompleteOption | null = null;

  override ngOnInit(): void {
    super.ngOnInit();
    if (this.options.length > 0) {
      this.filteredOptions.set([...this.options]);
    }
    document.addEventListener('click', this.handleClickOutside);
  }

  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
    if (changes['serverError']) {
      this.hasError = !!this.serverError || this.hasError;
    }
    if (changes['options']) {
      this.filteredOptions.set([...this.options]);
    }
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.handleClickOutside);
  }

  private handleClickOutside = (event: MouseEvent) => {
    if (this.containerRef && !this.containerRef.nativeElement.contains(event.target as Node)) {
      this.isOpen.set(false);
      this.isFocused.set(false);
    }
  };

  onInputChange(value: any): void {
    this.inputValue = value;
    this.inputChanged.emit(value);
    this.filterOptions(value);
    this.isOpen.set(true);
    this.onChangeCallback(this.selectedOption?.value || null);
  }

  onAutocompleteInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.inputValue = value;
    this.inputChanged.emit(value);
    this.filterOptions(value);
    this.isOpen.set(true);
    this.onChangeCallback(this.selectedOption?.value || null);
  }

  onFocus(): void {
    this.isFocused.set(true);
    this.isOpen.set(true);
    this.filterOptions(this.inputValue);
  }

  override onBlur(): void {
    super.onBlur();
    this.isFocused.set(false);
    setTimeout(() => {
      if (!this.isFocused()) {
        this.isOpen.set(false);
      }
    }, 200);
  }

  filterOptions(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredOptions.set([...this.options]);
      return;
    }

    const term = searchTerm.toLowerCase();
    if (this.filterFunction) {
      this.filteredOptions.set(this.options.filter(opt => this.filterFunction!(opt, term)));
    } else {
      this.filteredOptions.set(
        this.options.filter(opt =>
          this.getOptionLabel(opt).toLowerCase().includes(term)
        )
      );
    }
  }

  selectOption(option: AutocompleteOption): void {
    this.selectedOption = option;
    this.inputValue = this.getOptionLabel(option);
    this.value = option.value;
    this.isOpen.set(false);
    this.isFocused.set(false);
    this.onChangeCallback(option.value);
    this.onTouchedCallback();
    this.optionSelected.emit(option);
  }

  getOptionLabel(option: AutocompleteOption): string {
    if (this.displayFunction) {
      return this.displayFunction(option);
    }
    return option.label;
  }

  getOptionValue(option: AutocompleteOption): any {
    return option.value;
  }

  onOptionHover(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    target.style.backgroundColor = 'rgba(0, 48, 50, 0.1)';
    target.style.borderLeftColor = 'var(--sidebar-bg)';
  }

  onOptionLeave(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    target.style.backgroundColor = '';
    target.style.borderLeftColor = 'transparent';
  }

  override writeValue(value: any): void {
    super.writeValue(value);
    if (value) {
      const option = this.options.find(opt => opt.value === value);
      if (option) {
        this.selectedOption = option;
        this.inputValue = this.getOptionLabel(option);
        this.value = value;
      } else {
        this.selectedOption = null;
        this.inputValue = '';
        this.value = '';
      }
    } else {
      this.selectedOption = null;
      this.inputValue = '';
      this.value = '';
    }
  }
}

