import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModernFormWrapperComponent } from '../../../shared/components/modern-form-wrapper/modern-form-wrapper.component';
import { FormSectionComponent } from '../../../shared/components/form-section/form-section.component';
import { TextInputComponent } from '../../../shared/components/input/text-input.component';
import { TextareaInputComponent } from '../../../shared/components/input/textarea-input.component';
import { RadioInputComponent } from '../../../shared/components/input/radio-input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { PlatformModulesService, PlatformModule } from '../../../core/services/platform-modules.service';

@Component({
  selector: 'app-modules',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModernFormWrapperComponent,
    FormSectionComponent,
    TextInputComponent,
    TextareaInputComponent,
    RadioInputComponent,
    ButtonComponent,
    ModalComponent,
    TranslatePipe
  ],
  template: `
    <app-modern-form-wrapper
      [title]="'modules.title'"
      [description]="'modules.description'"
      [errorMessage]="errorMessage"
    >
      <div class="p-8">
        <!-- Header with Create Button -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">{{ 'modules.listTitle' | translate }}</h2>
          <app-button variant="primary" (onClick)="openCreateModal()">
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ 'modules.createModule' | translate }}
          </app-button>
        </div>

        <!-- Modules Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (module of modules; track module.id) {
            <div class="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-gray-900">{{ module.name }}</h3>
                @if (module.isActive) {
                  <span class="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">{{ 'modules.active' | translate }}</span>
                } @else {
                  <span class="px-2 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">{{ 'modules.inactive' | translate }}</span>
                }
              </div>
              <p class="text-gray-600 mb-4">{{ module.description }}</p>
              <div class="space-y-3 mb-4">
                @if (getCapabilitiesArray(module.capabilities).length > 0) {
                  @for (capability of getCapabilitiesArray(module.capabilities); track capability) {
                    <div class="flex items-center gap-2 text-sm">
                      <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      <span class="text-gray-700">{{ capability.trim() }}</span>
                    </div>
                  }
                }
              </div>
              <div class="flex items-center justify-between pt-4 border-t border-gray-200">
                <div class="text-2xl font-bold text-gray-900">
                  {{ module.price }}<span class="text-sm font-normal text-gray-600">/{{ 'modules.perMonth' | translate }}</span>
                </div>
                <app-button 
                  variant="outline" 
                  size="sm"
                  (onClick)="openEditModal(module)"
                >
                  <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {{ 'common.edit' | translate }}
                </app-button>
              </div>
            </div>
          }
        </div>

        @if (modules.length === 0) {
          <div class="text-center py-12">
            <p class="text-gray-500">{{ 'modules.noModules' | translate }}</p>
          </div>
        }
      </div>
    </app-modern-form-wrapper>

    <!-- Create/Edit Module Modal -->
    <app-modal
      #createModuleModal
      [title]="(editingModule ? 'modules.editModule' : 'modules.createModule') | translate"
      [showFooter]="false"
      [size]="'large'"
    >
      <form [formGroup]="moduleForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <app-form-section [title]="'modules.basicInfo'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <app-text-input
              formControlName="name"
              [label]="'modules.name'"
              [required]="true"
              [placeholder]="'modules.namePlaceholder'"
            />

            <app-text-input
              formControlName="nameAr"
              [label]="'modules.nameAr'"
              [required]="true"
              [placeholder]="'modules.nameArPlaceholder'"
            />

            <app-text-input
              formControlName="code"
              [label]="'modules.code'"
              [required]="true"
              [placeholder]="'modules.codePlaceholder'"
            />

            <app-radio-input
              formControlName="isActive"
              [label]="'modules.status'"
              [required]="true"
              [radioOptions]="statusOptions"
            />
          </div>
        </app-form-section>

        <app-form-section [title]="'modules.description'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <app-textarea-input
              formControlName="description"
              [label]="'modules.description'"
              [required]="true"
              [placeholder]="'modules.descriptionPlaceholder'"
              [rows]="4"
            />

            <app-textarea-input
              formControlName="descriptionAr"
              [label]="'modules.descriptionAr'"
              [required]="true"
              [placeholder]="'modules.descriptionArPlaceholder'"
              [rows]="4"
            />
          </div>
        </app-form-section>

        <app-form-section [title]="'modules.capabilities'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <app-textarea-input
              formControlName="capabilities"
              [label]="'modules.capabilities'"
              [required]="true"
              [placeholder]="'modules.capabilitiesPlaceholder'"
              [rows]="4"
            />

            <app-textarea-input
              formControlName="capabilitiesAr"
              [label]="'modules.capabilitiesAr'"
              [required]="true"
              [placeholder]="'modules.capabilitiesArPlaceholder'"
              [rows]="4"
            />
          </div>
        </app-form-section>

        <app-form-section [title]="'modules.pricing'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <app-text-input
              formControlName="price"
              type="number"
              [label]="'modules.price'"
              [required]="true"
              [placeholder]="'modules.pricePlaceholder'"
              [min]="0"
              [step]="0.01"
            />
          </div>
        </app-form-section>

        <!-- Form Actions -->
        <div class="flex items-center justify-end gap-4 pt-8 border-t-2 border-gray-100">
          <app-button variant="outline" type="button" (onClick)="closeCreateModal()">
            {{ 'common.cancel' | translate }}
          </app-button>
          <app-button
            variant="primary"
            type="submit"
            [disabled]="moduleForm.invalid || loading"
            [loading]="loading"
          >
            {{ (editingModule ? 'modules.updateModule' : 'common.create') | translate }}
          </app-button>
        </div>
      </form>
    </app-modal>
  `,
  styles: []
})
export class ModulesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private modulesService = inject(PlatformModulesService);

  @ViewChild('createModuleModal') createModuleModal!: ModalComponent;

  modules: PlatformModule[] = [];
  loading = false;
  errorMessage = '';
  moduleForm!: FormGroup;
  editingModule: PlatformModule | null = null;

  statusOptions = [
    { value: true, label: 'modules.active' },
    { value: false, label: 'modules.inactive' }
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.loadModules();
  }

  initializeForm(): void {
    this.moduleForm = this.fb.group({
      name: ['', [Validators.required]],
      nameAr: ['', [Validators.required]],
      description: ['', [Validators.required]],
      descriptionAr: ['', [Validators.required]],
      code: ['', [Validators.required]],
      capabilities: ['', [Validators.required]],
      capabilitiesAr: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
      isActive: [true, [Validators.required]]
    });
  }

  loadModules(): void {
    this.loading = true;
    this.errorMessage = '';

    this.modulesService.getAll().subscribe({
      next: (response) => {
        this.modules = response.data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load modules';
        this.loading = false;
      }
    });
  }

  getCapabilitiesArray(capabilities: string): string[] {
    if (!capabilities) return [];
    return capabilities.split(',').filter(cap => cap.trim().length > 0);
  }

  openCreateModal(): void {
    this.editingModule = null;
    this.moduleForm.reset();
    this.moduleForm.patchValue({
      price: 0,
      isActive: true
    });
    this.createModuleModal.open();
  }

  openEditModal(module: PlatformModule): void {
    this.editingModule = module;
    this.moduleForm.patchValue({
      name: module.name,
      nameAr: module.nameAr,
      description: module.description,
      descriptionAr: module.descriptionAr,
      code: module.code,
      capabilities: module.capabilities,
      capabilitiesAr: module.capabilitiesAr,
      price: module.price,
      isActive: module.isActive
    });
    this.createModuleModal.open();
  }

  closeCreateModal(): void {
    this.createModuleModal.close();
    this.moduleForm.reset();
    this.editingModule = null;
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (this.moduleForm.invalid) {
      this.moduleForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formValue = this.moduleForm.value;
    const moduleDto = {
      name: formValue.name,
      nameAr: formValue.nameAr,
      description: formValue.description,
      descriptionAr: formValue.descriptionAr,
      code: formValue.code,
      capabilities: formValue.capabilities,
      capabilitiesAr: formValue.capabilitiesAr,
      price: parseFloat(formValue.price),
      isActive: formValue.isActive
    };

    if (this.editingModule) {
      // Update existing module
      this.modulesService.update(this.editingModule.id, moduleDto).subscribe({
        next: (updatedModule) => {
          const index = this.modules.findIndex(m => m.id === updatedModule.id);
          if (index !== -1) {
            this.modules[index] = updatedModule;
          }
          this.loading = false;
          this.closeCreateModal();
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to update module';
          this.loading = false;
        }
      });
    } else {
      // Create new module
      this.modulesService.create(moduleDto).subscribe({
        next: (newModule) => {
          this.modules.push(newModule);
          this.loading = false;
          this.closeCreateModal();
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to create module';
          this.loading = false;
        }
      });
    }
  }
}

