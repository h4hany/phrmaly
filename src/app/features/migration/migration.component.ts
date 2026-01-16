import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WizardStepperComponent, WizardStep } from '../../shared/components/wizard-stepper/wizard-stepper.component';
import { TableComponent, TableColumn } from '../../shared/components/table/table.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { MigrationEngineService, MigrationJob, ColumnMapping } from '../../core/engines/migration-engine.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
  selector: 'app-migration',
  standalone: true,
  imports: [CommonModule, WizardStepperComponent, TableComponent, ButtonComponent, BadgeComponent, TranslatePipe],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold">{{ 'migration.title' | translate }}</h2>
        <button (click)="router.navigate(['/dashboard'])" class="text-sm text-gray-600 hover:text-gray-900">
          ← {{ 'common.back' | translate }}
        </button>
      </div>

      <app-wizard-stepper
        [steps]="steps"
        [currentStep]="currentStep"
        (stepChange)="currentStep = $event"
      ></app-wizard-stepper>

      <div class="p-6 rounded-lg" style="background-color: var(--card-bg);">
        @if (currentStep === 0) {
          <!-- Step 1: Upload -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold mb-4">{{ 'migration.upload' | translate }}</h3>
            <div class="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                #fileInput
                (change)="handleFileSelect($event)"
                accept=".csv,.xlsx,.xls"
                class="hidden"
              />
              <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p class="text-gray-600 mb-2">{{ 'migration.selectFile' | translate }}</p>
              <p class="text-sm text-gray-500 mb-4">{{ 'migration.supportedFormats' | translate }}</p>
              <app-button (onClick)="fileInput.click()">{{ 'migration.browse' | translate }}</app-button>
              @if (selectedFile) {
                <div class="mt-4 p-3 bg-green-50 rounded-lg">
                  <p class="text-sm text-green-800">{{ 'migration.fileSelected' | translate }}: {{ selectedFile.name }}</p>
                </div>
              }
            </div>
          </div>
        } @else if (currentStep === 1) {
          <!-- Step 2: Map Columns -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold mb-4">{{ 'migration.map' | translate }}</h3>
            <app-table
              [columns]="mappingColumns"
              [data]="columnMappings"
              [emptyMessage]="'migration.noMappings'"
            ></app-table>
          </div>
        } @else if (currentStep === 2) {
          <!-- Step 3: Preview -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold mb-4">{{ 'migration.preview' | translate }}</h3>
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div class="p-4 bg-green-50 rounded-lg">
                <div class="text-sm text-gray-600">{{ 'migration.validRows' | translate }}</div>
                <div class="text-2xl font-bold text-green-600">{{ previewData.valid }}</div>
              </div>
              <div class="p-4 bg-red-50 rounded-lg">
                <div class="text-sm text-gray-600">{{ 'migration.invalidRows' | translate }}</div>
                <div class="text-2xl font-bold text-red-600">{{ previewData.invalid }}</div>
              </div>
            </div>
            <app-table
              [columns]="previewColumns"
              [data]="previewData.preview"
              [emptyMessage]="'migration.noPreview'"
            ></app-table>
          </div>
        } @else if (currentStep === 3) {
          <!-- Step 4: Import Log -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold mb-4">{{ 'migration.importLog' | translate }}</h3>
            @if (importJob) {
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ 'migration.status' | translate }}</span>
                  <app-badge [variant]="getStatusVariant(importJob.status)">
                    {{ importJob.status }}
                  </app-badge>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ 'migration.processed' | translate }}</span>
                  <span class="font-medium">{{ importJob.processedRows }} / {{ importJob.totalRows }}</span>
                </div>
                @if (importJob.errors.length > 0) {
                  <div class="mt-4">
                    <h4 class="font-semibold mb-2">{{ 'migration.errors' | translate }}</h4>
                    <div class="space-y-1">
                      @for (error of importJob.errors; track $index) {
                        <p class="text-sm text-red-600">{{ error }}</p>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }

        <div class="flex justify-between mt-6 pt-6 border-t">
          <app-button
            variant="outline"
            [disabled]="currentStep === 0"
            (onClick)="currentStep = currentStep - 1"
          >
            {{ 'common.previous' | translate }}
          </app-button>
          @if (currentStep < steps.length - 1) {
            <app-button
              variant="primary"
              [disabled]="!canProceed()"
              (onClick)="nextStep()"
            >
              {{ 'common.next' | translate }}
            </app-button>
          } @else {
            <app-button
              variant="primary"
              [disabled]="!canSubmit()"
              (onClick)="executeImport()"
            >
              {{ 'migration.import' | translate }}
            </app-button>
          }
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class MigrationComponent implements OnInit {
  private migrationEngine = inject(MigrationEngineService);
  router = inject(Router);

  currentStep = 0;
  selectedFile: File | null = null;
  importJob: MigrationJob | null = null;
  columnMappings: ColumnMapping[] = [];
  previewData = { valid: 0, invalid: 0, preview: [] as any[] };

  steps: WizardStep[] = [
    { id: 'upload', label: 'migration.upload', description: 'migration.uploadDesc' },
    { id: 'map', label: 'migration.map', description: 'migration.mapDesc' },
    { id: 'preview', label: 'migration.preview', description: 'migration.previewDesc' },
    { id: 'import', label: 'migration.import', description: 'migration.importDesc' }
  ];

  mappingColumns: TableColumn[] = [
    { key: 'sourceColumn', label: 'migration.sourceColumn' },
    { key: 'targetField', label: 'migration.targetField' },
    { key: 'required', label: 'migration.required' }
  ];

  previewColumns: TableColumn[] = [
    { key: 'row', label: 'migration.row' },
    { key: 'data', label: 'migration.data' },
    { key: 'status', label: 'migration.status' }
  ];

  ngOnInit(): void {
    // Initialize with sample mappings
    this.columnMappings = [
      { sourceColumn: 'Name', targetField: 'name', required: true },
      { sourceColumn: 'Email', targetField: 'email', required: false },
      { sourceColumn: 'Phone', targetField: 'phone', required: true }
    ];
  }

  handleFileSelect(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedFile = target.files[0];
      this.migrationEngine.uploadFile(this.selectedFile).subscribe({
        next: (job) => {
          this.importJob = job;
        }
      });
    }
  }

  canProceed(): boolean {
    if (this.currentStep === 0) return !!this.selectedFile;
    if (this.currentStep === 1) return this.columnMappings.length > 0;
    if (this.currentStep === 2) return true;
    return false;
  }

  canSubmit(): boolean {
    return this.previewData.valid > 0;
  }

  nextStep(): void {
    if (this.currentStep === 1) {
      // Map columns
      this.migrationEngine.mapColumns(this.importJob?.id || '', this.columnMappings).subscribe({
        next: (job) => {
          this.importJob = job;
          this.currentStep++;
        }
      });
    } else if (this.currentStep === 2) {
      // Preview
      this.migrationEngine.previewImport(this.importJob?.id || '').subscribe({
        next: (preview) => {
          this.previewData = preview;
          this.currentStep++;
        }
      });
    } else {
      this.currentStep++;
    }
  }

  executeImport(): void {
    if (this.importJob) {
      this.migrationEngine.executeImport(this.importJob.id).subscribe({
        next: (job) => {
          this.importJob = job;
        }
      });
    }
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    const variants: { [key: string]: 'success' | 'warning' | 'danger' | 'info' | 'default' } = {
      completed: 'success',
      importing: 'info',
      failed: 'danger',
      uploading: 'info',
      mapping: 'info',
      preview: 'info'
    };
    return variants[status] || 'default';
  }
}
