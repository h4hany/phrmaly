import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { BaseInputComponent } from '../input/base-input.component';

@Component({
  selector: 'app-image-file-input',
  standalone: true,
  imports: [CommonModule, TranslatePipe, BaseInputComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageFileInputComponent),
      multi: true
    }
  ],
  template: `
    <app-base-input
      [label]="label"
      [required]="required"
      [disabled]="disabled"
      [hasError]="hasError"
      [errorMessage]="errorMessage"
      [hint]="hint"
      [inputId]="inputId"
    >
      <div class="file-input-wrapper">
        <div
          class="preview-container"
          [class.has-image]="previewUrl"
        >
          @if (!previewUrl) {
            <span class="preview-placeholder">{{ 'fileInput.noImageSelected' | translate }}</span>
          }
          @if (previewUrl) {
            <img
              [src]="previewUrl"
              class="preview-image show"
              [alt]="'fileInput.imagePreview' | translate"
            />
          }
        </div>
        <label
          [for]="inputId"
          class="upload-btn"
          [class.disabled]="disabled"
        >
          {{ 'fileInput.selectImage' | translate }}
        </label>
        <input
          [id]="inputId"
          type="file"
          [accept]="accept"
          [disabled]="disabled"
          (change)="onFileChange($event)"
        />
        @if (selectedFile) {
          <div class="file-info">{{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})</div>
        }
      </div>
    </app-base-input>

    <style>

      .file-input-wrapper {
        width: 100%;
      }

      input[type="file"] {
        display: none;
      }

      .preview-container {
        margin-top: 15px;
        border-radius: 8px;
        overflow: hidden;
        background: rgba(227, 244, 245, 0.05);
        min-height: 150px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px dashed transparent;
        transition: all 0.3s ease;
        margin-bottom: 15px;
      }

      .preview-container.has-image {
        border-color: var(--sidebar-bg);
        background: rgba(217, 242, 117, 0.05);
      }

      .preview-image {
        max-width: 100%;
        max-height: 200px;
        object-fit: contain;
        display: none;
        border-radius: 8px;
      }

      .preview-image.show {
        display: block;
      }

      .preview-placeholder {
        color: var(--sidebar-bg);
        opacity: 0.5;
        font-size: 0.9rem;
      }

      .upload-btn {
        background: transparent;
        border: 2px solid var(--sidebar-bg);
        color: var(--sidebar-bg);
        padding: 15px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        text-align: center;
        transition: all 0.3s ease;
        display: block;
        width: 100%;
      }

      .upload-btn.disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .upload-btn:hover:not(.disabled) {
        background: var(--sidebar-active-bg);
        color: var(--sidebar-active-text);
      }

      .file-info {
        margin-top: 10px;
        color: var(--sidebar-bg);
        font-size: 0.85rem;
        text-align: center;
      }
    </style>
  `,
  styles: []
})
export class ImageFileInputComponent extends BaseInputComponent implements ControlValueAccessor {
  @Input() accept: string = 'image/*';

  selectedFile: File | null = null;
  previewUrl: string | null = null;

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.onChange(this.selectedFile);
      this.fileSelected.emit(this.selectedFile);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  @Output() fileSelected = new EventEmitter<File>();

  // ControlValueAccessor implementation
  override writeValue(value: any): void {
    if (value === null || value === undefined) {
      this.selectedFile = null;
      this.previewUrl = null;
    } else if (value instanceof File) {
      this.selectedFile = value;
      // Create preview for File
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
}

