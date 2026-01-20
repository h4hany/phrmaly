import { Component, Input, forwardRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { IconComponent } from '../icon/icon.component';
import { BaseInputComponent } from './base-input.component';

@Component({
  selector: 'app-textarea-input',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, IconComponent, BaseInputComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaInputComponent),
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
      <div class="input-container" [class.has-icon]="prefixIcon">
        @if (prefixIcon) {
          <div class="input-prefix-icon">
            <app-icon [name]="prefixIcon" [size]="iconSize" [color]="'currentColor'" />
          </div>
        }
        
        <textarea
          [id]="inputId"
          [attr.name]="name || null"
          [(ngModel)]="value"
          (ngModelChange)="onChange($event)"
          (blur)="onBlur()"
          [placeholder]="placeholder | translate"
          [disabled]="disabled"
          [readonly]="readonly"
          [rows]="rows"
          [attr.maxlength]="maxlength ?? null"
          [attr.minlength]="minlength ?? null"
          class="input-field textarea-field"
          [class.has-error]="hasError || !!serverError"
          [class.has-prefix]="prefixIcon"
        ></textarea>
      </div>
    </app-base-input>
  `,
  styles: [`
    .input-container {
      position: relative;
      display: flex;
      align-items: flex-start;
    }

    .input-container.has-icon .input-field {
      padding-left: 3.5rem;
    }

    .input-prefix-icon {
      position: absolute;
      left: 1rem;
      top: 1rem;
      color: rgb(156, 163, 175);
      pointer-events: none;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
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

    .textarea-field {
      resize: vertical;
      min-height: 6rem;
      border-radius: 0.75rem;
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
export class TextareaInputComponent extends BaseInputComponent implements ControlValueAccessor, OnInit, OnChanges {
  @Input() placeholder: string = '';
  @Input() name?: string;
  @Input() readonly: boolean = false;
  @Input() prefixIcon?: string;
  @Input() rows: number = 3;
  @Input() maxlength?: number;
  @Input() minlength?: number;
  @Input() iconSize: number = 20;

  override ngOnInit(): void {
    super.ngOnInit();
  }

  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
    if (changes['serverError']) {
      this.hasError = !!this.serverError || this.hasError;
    }
  }
}

