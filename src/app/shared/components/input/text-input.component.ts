import { Component, Input, Output, EventEmitter, forwardRef, ViewChild, ElementRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { IconComponent } from '../icon/icon.component';
import { BaseInputComponent } from './base-input.component';

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, IconComponent, BaseInputComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextInputComponent),
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
           [class.has-suffix]="suffixIcon || showPasswordToggle || clearable">
        @if (prefixIcon) {
          <div class="input-prefix-icon">
            <app-icon [name]="prefixIcon" [size]="iconSize" [color]="'currentColor'" />
          </div>
        }
        
        <input
          #input
          [id]="inputId"
          [attr.name]="name || null"
          [type]="inputType"
          [(ngModel)]="inputValue"
          (ngModelChange)="onInputChange($event)"
          (blur)="onBlur()"
          [placeholder]="placeholder | translate"
          [disabled]="disabled"
          [readonly]="readonly"
          [required]="required"
          [attr.min]="min ?? null"
          [attr.max]="max ?? null"
          [attr.step]="step ?? null"
          [attr.maxlength]="maxlength ?? null"
          [attr.minlength]="minlength ?? null"
          [attr.pattern]="pattern || null"
          [attr.autocomplete]="autocomplete || null"
          class="input-field"
          [class.has-error]="hasError || !!serverError"
          [class.has-prefix]="prefixIcon"
          [class.has-suffix]="suffixIcon || showPasswordToggle || clearable"
        />
        
        @if (type === 'password' && showPasswordToggle) {
          <button
            type="button"
            class="input-suffix-icon password-toggle"
            (click)="togglePasswordVisibility()"
            tabindex="-1"
          >
            <app-icon 
              [name]="showPassword ? 'eye-off' : 'eye'" 
              [size]="iconSize" 
              [color]="'currentColor'" 
            />
          </button>
        } @else if (suffixIcon) {
          <div class="input-suffix-icon">
            <app-icon [name]="suffixIcon" [size]="iconSize" [color]="'currentColor'" />
          </div>
        }
        
        @if (clearable && inputValue && !disabled && !readonly) {
          <button
            type="button"
            class="input-clear-button"
            (click)="clearValue()"
            tabindex="-1"
          >
            <app-icon name="x-circle" [size]="16" [color]="'currentColor'" />
          </button>
        }
      </div>
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

    .password-toggle {
      pointer-events: all;
      cursor: pointer;
      background: none;
      border: none;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }

    .password-toggle:hover {
      color: rgb(55, 65, 81);
    }

    .input-clear-button {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgb(156, 163, 175);
      transition: color 0.2s;
      z-index: 2;
    }

    .input-clear-button:hover {
      color: rgb(55, 65, 81);
    }

    .input-container.has-suffix .input-clear-button {
      right: 3rem;
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
  `]
})
export class TextInputComponent extends BaseInputComponent implements ControlValueAccessor, OnInit, OnChanges {
  @Input() type: 'text' | 'number' | 'email' | 'password' | 'tel' | 'date' | 'time' | 'datetime-local' = 'text';
  @Input() placeholder: string = '';
  @Input() name?: string;
  @Input() readonly: boolean = false;
  @Input() prefixIcon?: string;
  @Input() suffixIcon?: string;
  @Input() clearable: boolean = false;
  @Input() showPasswordToggle: boolean = true;
  @Input() min?: number | string;
  @Input() max?: number | string;
  @Input() step?: number | string;
  @Input() maxlength?: number;
  @Input() minlength?: number;
  @Input() pattern?: string;
  @Input() autocomplete?: string;
  @Input() iconSize: number = 20;

  @ViewChild('input') inputRef?: ElementRef<HTMLInputElement>;

  inputValue: string = '';
  showPassword: boolean = false;

  override ngOnInit(): void {
    super.ngOnInit();
  }

  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
    if (changes['serverError']) {
      this.hasError = !!this.serverError || this.hasError;
    }
  }

  get inputType(): string {
    if (this.type === 'password' && this.showPassword) {
      return 'text';
    }
    return this.type;
  }

  onInputChange(value: any): void {
    this.value = value;
    this.inputValue = value;
    this.onChangeCallback(value);
  }

  override onBlur(): void {
    super.onBlur();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  clearValue(): void {
    this.value = '';
    this.inputValue = '';
    this.onChange('');
  }

  // ControlValueAccessor implementation
  override writeValue(value: any): void {
    super.writeValue(value);
    this.inputValue = value ?? '';
  }
}

