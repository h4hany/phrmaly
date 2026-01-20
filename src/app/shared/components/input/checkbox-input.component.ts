import { Component, Input, forwardRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { BaseInputComponent } from './base-input.component';

@Component({
  selector: 'app-checkbox-input',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, BaseInputComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxInputComponent),
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
      <div class="checkbox-group">
        @for (option of checkboxOptions; track option.value) {
          <div class="checkbox-item">
            <input
              type="checkbox"
              [id]="inputId + '-' + option.value"
              [name]="name || inputId"
              [value]="option.value"
              [checked]="isCheckboxChecked(option.value)"
              (change)="onCheckboxChange($event, option.value)"
              (blur)="onBlur()"
              [disabled]="disabled"
              class="checkbox-input"
            />
            <label [for]="inputId + '-' + option.value" class="checkbox-label">
              {{ option.label | translate }}
            </label>
          </div>
        }
      </div>
    </app-base-input>
  `,
  styles: [`
    .checkbox-group {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 0.625rem;
    }

    .checkbox-label {
      font-size: 0.875rem;
      color: rgb(55, 65, 81);
      cursor: pointer;
      user-select: none;
    }

    .checkbox-input {
      width: 24px;
      height: 24px;
      border: none;
      border-radius: 0.5rem;
      appearance: none;
      cursor: pointer;
      position: relative;
      transition: all 0.3s ease;
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin: 0;
      padding: 0;
    }

    .checkbox-input:checked {
      background: var(--primary-bg, #D9F275);
      box-shadow: 0 4px 15px rgba(217, 242, 117, 0.5);
      transform: scale(1.1);
    }

    .checkbox-input:checked::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -60%) rotate(45deg);
      width: 6px;
      height: 12px;
      border: solid var(--primary-text, #003032);
      border-width: 0 3px 3px 0;
    }

    .checkbox-input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .checkbox-input:hover:not(:disabled) {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    }

    .checkbox-input:checked:hover:not(:disabled) {
      box-shadow: 0 4px 18px rgba(217, 242, 117, 0.6);
    }
  `]
})
export class CheckboxInputComponent extends BaseInputComponent implements ControlValueAccessor, OnInit, OnChanges {
  @Input() name?: string;
  @Input() checkboxOptions: Array<{ value: any; label: string; checked?: boolean }> = [];

  override ngOnInit(): void {
    super.ngOnInit();
    if (!Array.isArray(this.value)) {
      this.value = [];
    }
  }

  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
    if (changes['serverError']) {
      this.hasError = !!this.serverError || this.hasError;
    }
  }

  isCheckboxChecked(value: any): boolean {
    return Array.isArray(this.value) ? this.value.includes(value) : this.value === value;
  }

  onCheckboxChange(event: Event, value: any): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (!Array.isArray(this.value)) {
      this.value = [];
    }
    if (checked) {
      if (!this.value.includes(value)) {
        this.value = [...this.value, value];
      }
    } else {
      this.value = this.value.filter((v: any) => v !== value);
    }
    this.onChangeCallback(this.value);
    this.onTouchedCallback();
  }

  override writeValue(value: any): void {
    super.writeValue(value);
    this.value = Array.isArray(value) ? value : (value ? [value] : []);
  }
}

