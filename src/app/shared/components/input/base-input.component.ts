import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

/**
 * Base component that provides common functionality for all input components
 * Handles label, error messages, validation, and ControlValueAccessor implementation
 */
@Component({
  selector: 'app-base-input',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="input-wrapper" [class.has-error]="hasError" [class.disabled]="disabled">
      @if (label) {
        <label [for]="inputId" class="input-label">
          {{ label | translate }}
          @if (required) {
            <span class="required-indicator">*</span>
          }
        </label>
      }
      
      <ng-content></ng-content>
      
      @if (hint && !hasError) {
        <p class="input-hint">{{ hint | translate }}</p>
      }
      
      @if (hasError && errorMessage) {
        <p class="input-error">{{ errorMessage | translate }}</p>
      }
    </div>
  `,
  styles: [`
    .input-wrapper {
      width: 100%;
      margin-bottom: 1rem;
      position: relative;
    }

    .input-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: rgb(55, 65, 81);
      margin-bottom: 0.5rem;
    }

    .required-indicator {
      color: rgb(239, 68, 68);
      margin-left: 0.25rem;
    }

    .input-hint {
      margin-top: 0.5rem;
      font-size: 0.75rem;
      color: rgb(107, 114, 128);
    }

    .input-error {
      margin-top: 0.5rem;
      font-size: 0.75rem;
      color: rgb(239, 68, 68);
    }

    .input-wrapper.has-error .input-label {
      color: rgb(239, 68, 68);
    }

    .input-wrapper.disabled {
      opacity: 0.6;
      pointer-events: none;
    }
  `]
})
export class BaseInputComponent implements ControlValueAccessor, OnInit, OnChanges {
  @Input() label?: string;
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() hasError: boolean = false;
  @Input() errorMessage?: string;
  @Input() hint?: string;
  @Input() inputId: string = `input-${Math.random().toString(36).substring(2, 9)}`;

  // Server error message support
  @Input() serverError?: string | null;

  protected value: any = '';
  protected onChangeCallback: (value: any) => void = () => {};
  protected onTouchedCallback: () => void = () => {};

  ngOnInit(): void {
    // Combine server error with validation error
    if (this.serverError) {
      this.hasError = true;
      this.errorMessage = this.serverError;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Update error state when server error changes
    if (changes['serverError'] && this.serverError) {
      this.hasError = true;
      this.errorMessage = this.serverError;
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  protected onChange(value: any): void {
    this.value = value;
    this.onChangeCallback(value);
  }

  protected onBlur(): void {
    this.onTouchedCallback();
  }
}

