import { Component, Input, forwardRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { BaseInputComponent } from './base-input.component';

@Component({
  selector: 'app-radio-input',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, BaseInputComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioInputComponent),
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
      <div class="radio-group">
        @for (option of radioOptions; track option.value) {
          <div class="radio-item">
            <input
              type="radio"
              [id]="inputId + '-' + option.value"
              [name]="name || inputId"
              [value]="option.value"
              [checked]="value === option.value"
              (change)="onRadioChange(option.value)"
              (blur)="onBlur()"
              [disabled]="disabled"
              [required]="required"
              class="radio-input"
            />
            <label [for]="inputId + '-' + option.value" class="radio-label">
              {{ option.label | translate }}
            </label>
          </div>
        }
      </div>
    </app-base-input>
  `,
  styles: [`
    .radio-group {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .radio-item {
      display: flex;
      align-items: center;
      gap: 0.625rem;
    }

    .radio-label {
      font-size: 0.875rem;
      color: rgb(55, 65, 81);
      cursor: pointer;
      user-select: none;
    }

    .radio-input {
      width: 24px;
      height: 24px;
      border: none;
      border-radius: 50%;
      appearance: none;
      cursor: pointer;
      position: relative;
      transition: all 0.3s ease;
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin: 0;
      padding: 0;
    }

    .radio-input:checked {
      background: var(--primary-bg, #D9F275);
      box-shadow: 0 4px 15px rgba(217, 242, 117, 0.5);
      transform: scale(1.1);
    }

    .radio-input:checked::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(45deg);
      width: 6px;
      height: 12px;
      border: solid var(--primary-text, #003032);
      border-width: 0 3px 3px 0;
    }

    .radio-input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .radio-input:hover:not(:disabled) {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    }

    .radio-input:checked:hover:not(:disabled) {
      box-shadow: 0 4px 18px rgba(217, 242, 117, 0.6);
    }
  `]
})
export class RadioInputComponent extends BaseInputComponent implements ControlValueAccessor, OnInit, OnChanges {
  @Input() name?: string;
  @Input() radioOptions: Array<{ value: any; label: string }> = [];

  override ngOnInit(): void {
    super.ngOnInit();
  }

  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
    if (changes['serverError']) {
      this.hasError = !!this.serverError || this.hasError;
    }
  }

  onRadioChange(value: any): void {
    this.value = value;
    this.onChangeCallback(value);
    this.onTouchedCallback();
  }
}

