import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { BaseInputComponent } from '../input/base-input.component';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, TranslatePipe, BaseInputComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
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
        <label
          [for]="inputId"
          class="file-input-3"
          [class.disabled]="disabled"
          [class.drag-over]="isDragOver"
          [class.has-preview]="previewUrl"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
        >
          @if (previewUrl && isImageFile) {
            <img [src]="previewUrl" class="preview-image" [alt]="'fileInput.imagePreview' | translate" />
          } @else {
            <span class="file-icon">📁</span>
            <span class="file-text">{{ 'fileInput.clickOrDragFile' | translate }}</span>
          }
        </label>
        <input
          [id]="inputId"
          type="file"
          [accept]="accept"
          [disabled]="disabled"
          (change)="onFileChange($event)"
        />
        @if (selectedFile && !isImageFile) {
          <div class="file-name">{{ selectedFile.name }}</div>
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

      .file-input-3 {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        background: rgba(227, 244, 245, 0.05);
        border: 3px dashed var(--sidebar-bg);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        min-height: 150px;
        position: relative;
        overflow: hidden;
      }

      .file-input-3.has-preview {
        padding: 0;
      }

      .file-input-3.disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .file-input-3:hover:not(.disabled) {
        border-color: var(--sidebar-bg);
        background: rgba(217, 242, 117, 0.1);
      }

      .file-input-3.drag-over {
        border-color: var(--sidebar-bg);
        background: rgba(217, 242, 117, 0.15);
      }

      .file-icon {
        font-size: 3rem;
        margin-bottom: 10px;
      }

      .file-text {
        color: var(--sidebar-active-text);
        font-weight: 500;
      }

      .preview-image {
        width: 100%;
        height: 100%;
        min-height: 150px;
        object-fit: contain;
        display: block;
      }

      .file-name {
        margin-top: 10px;
        color: var(--sidebar-active-text);
        font-size: 0.9rem;
        text-align: center;
      }
    </style>
  `,
  styles: []
})
export class FileUploadComponent extends BaseInputComponent implements ControlValueAccessor {
  @Input() accept: string = '.pdf,.doc,.docx,.txt';

  selectedFile: File | null = null;
  isDragOver = false;
  previewUrl: string | null = null;
  isImageFile = false;

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.checkIfImage();
      this.onChange(this.selectedFile);
      this.fileSelected.emit(this.selectedFile);
    }
  }

  onDragOver(event: DragEvent): void {
    if (this.disabled) return;
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    if (this.disabled) return;
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
      this.checkIfImage();
      this.onChange(this.selectedFile);
      this.fileSelected.emit(this.selectedFile);
    }
  }

  checkIfImage(): void {
    if (!this.selectedFile) {
      this.isImageFile = false;
      this.previewUrl = null;
      return;
    }

    const fileType = this.selectedFile.type;
    this.isImageFile = fileType.startsWith('image/');

    if (this.isImageFile) {
      // Create preview for image
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.previewUrl = null;
    }
  }

  @Output() fileSelected = new EventEmitter<File>();

  // ControlValueAccessor implementation
  override writeValue(value: any): void {
    if (value === null || value === undefined) {
      this.selectedFile = null;
      this.previewUrl = null;
      this.isImageFile = false;
    } else if (value instanceof File) {
      this.selectedFile = value;
      this.checkIfImage();
    }
  }
}

