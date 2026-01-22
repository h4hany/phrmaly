import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SuppliersService } from '../../../core/services/suppliers.service';
import { ModernFormWrapperComponent } from '../../../shared/components/modern-form-wrapper/modern-form-wrapper.component';
import { FormSectionComponent } from '../../../shared/components/form-section/form-section.component';
import { TextInputComponent } from '../../../shared/components/input/text-input.component';
import { TextareaInputComponent } from '../../../shared/components/input/textarea-input.component';
import { AutocompleteInputComponent, AutocompleteOption } from '../../../shared/components/input/autocomplete-input.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ModernFormWrapperComponent,
    FormSectionComponent,
    TextInputComponent,
    TextareaInputComponent,
    AutocompleteInputComponent,
    TranslatePipe
  ],
  template: `
    <app-modern-form-wrapper
      [title]="(isEdit ? 'form.editSupplier' : 'form.addSupplier')"
      [description]="(isEdit ? 'form.editSupplierDescription' : 'form.addSupplierDescription')"
      [errorMessage]="errorMessage"
    >
      <form [formGroup]="supplierForm" (ngSubmit)="onSubmit()" class="p-8">
        <!-- Basic Information Section -->
        <app-form-section [title]="'supplier.basicInfo'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <app-text-input
                type="text"
                formControlName="name"
                [label]="'form.supplier.name'"
                [required]="true"
                [hasError]="!!(supplierForm.get('name')?.invalid && supplierForm.get('name')?.touched)"
                [errorMessage]="(supplierForm.get('name')?.invalid && supplierForm.get('name')?.touched) ? 'validation.nameRequired' : undefined"
                prefixIcon="tag"
              ></app-text-input>
            </div>

            <div>
              <app-autocomplete-input
                formControlName="type"
                [label]="'form.supplier.type'"
                [required]="true"
                [options]="typeOptions"
                [placeholder]="'form.selectType'"
                prefixIcon="factory"
                [hasError]="!!(supplierForm.get('type')?.invalid && supplierForm.get('type')?.touched)"
                [errorMessage]="(supplierForm.get('type')?.invalid && supplierForm.get('type')?.touched) ? 'validation.typeRequired' : undefined"
              ></app-autocomplete-input>
            </div>

            <div>
              <app-text-input
                type="tel"
                formControlName="phone"
                [label]="'patient.phone'"
                prefixIcon="phone"
              ></app-text-input>
            </div>

            <div>
              <app-text-input
                type="email"
                formControlName="email"
                [label]="'patient.email'"
                [hasError]="!!(supplierForm.get('email')?.invalid && supplierForm.get('email')?.touched)"
                [errorMessage]="(supplierForm.get('email')?.invalid && supplierForm.get('email')?.touched) ? 'validation.emailInvalid' : undefined"
                prefixIcon="mail"
              ></app-text-input>
            </div>

            <div class="md:col-span-2">
              <app-text-input
                type="text"
                formControlName="address"
                [label]="'form.supplier.address'"
                prefixIcon="map-pin"
              ></app-text-input>
            </div>

            <div class="md:col-span-2">
              <app-autocomplete-input
                formControlName="status"
                [label]="'drug.status'"
                [options]="statusOptions"
                [placeholder]="'form.selectStatus'"
                prefixIcon="check-circle"
              ></app-autocomplete-input>
            </div>
          </div>
        </app-form-section>

        <!-- Notes Section -->
        <app-form-section [title]="'form.supplier.notes'">
          <div>
            <app-textarea-input
              formControlName="notes"
              [label]="'form.supplier.notes'"
              [rows]="3"
              prefixIcon="document-text"
            ></app-textarea-input>
          </div>
        </app-form-section>

        <!-- Form Actions -->
        <div class="flex items-center justify-end gap-4 pt-8 border-t-2 border-gray-100">
          <button
            type="button"
            (click)="onCancel()"
            class="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            {{ 'common.cancel' | translate }}
          </button>
          <button
            type="submit"
            [disabled]="supplierForm.invalid || loading"
            class="px-6 py-3 rounded-xl font-semibold hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none transition-all duration-200 flex items-center gap-2"
            [style.background]="'var(--primary-bg)'"
            [style.color]="'var(--primary-text)'"
          >
            @if (loading) {
              <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            } @else {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            }
            {{ (isEdit ? 'form.updateSupplier' : 'form.createSupplier') | translate }}
          </button>
        </div>
      </form>
    </app-modern-form-wrapper>
  `,
  styles: []
})
export class SupplierFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private suppliersService = inject(SuppliersService);

  supplierForm!: FormGroup;
  loading = false;
  errorMessage = '';
  isEdit = false;
  supplierId: string | null = null;
  typeOptions: AutocompleteOption[] = [
    { value: 'manufacturer', label: 'button.manufacturer' },
    { value: 'warehouse', label: 'button.warehouse' }
  ];
  statusOptions: AutocompleteOption[] = [
    { value: 'active', label: 'common.active' },
    { value: 'inactive', label: 'common.inactive' }
  ];

  ngOnInit(): void {
    this.supplierId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.supplierId;

    this.supplierForm = this.fb.group({
      name: ['', [Validators.required]],
      type: ['', [Validators.required]],
      phone: [''],
      email: ['', [Validators.email]],
      address: [''],
      status: ['active'],
      notes: ['']
    });

    if (this.isEdit && this.supplierId) {
      this.loadSupplier();
    }
  }

  private loadSupplier(): void {
    this.suppliersService.getById(this.supplierId!).subscribe({
      next: (supplier) => {
        if (supplier) {
          this.supplierForm.patchValue(supplier);
        }
      },
      error: () => {
        this.errorMessage = 'error.loadSupplier';
      }
    });
  }

  onSubmit(): void {
    if (this.supplierForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const operation = this.isEdit
        ? this.suppliersService.update(this.supplierId!, this.supplierForm.value)
        : this.suppliersService.create(this.supplierForm.value);

      operation.subscribe({
        next: () => {
          this.router.navigate(['/suppliers']);
        },
        error: (error) => {
          this.errorMessage = error.message || 'error.saveSupplier';
          this.loading = false;
        }
      });
    } else {
      Object.keys(this.supplierForm.controls).forEach(key => {
        this.supplierForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/suppliers']);
  }
}
