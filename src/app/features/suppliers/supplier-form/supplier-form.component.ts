import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SuppliersService } from '../../../core/services/suppliers.service';
import { FormWrapperComponent } from '../../../shared/components/form-wrapper/form-wrapper.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { TextInputComponent } from '../../../shared/components/input/text-input.component';
import { TextareaInputComponent } from '../../../shared/components/input/textarea-input.component';
import { AutocompleteInputComponent, AutocompleteOption } from '../../../shared/components/input/autocomplete-input.component';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormWrapperComponent,
    ButtonComponent,
    AlertComponent,
    TextInputComponent,
    TextareaInputComponent,
    AutocompleteInputComponent
  ],
  template: `
    <app-form-wrapper [title]="isEdit ? 'Edit Supplier' : 'Add New Supplier'">
      @if (errorMessage) {
        <app-alert type="error" [title]="errorMessage" />
      }

      <form [formGroup]="supplierForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <app-text-input
              type="text"
              formControlName="name"
              label="Name"
              [required]="true"
              [hasError]="!!(supplierForm.get('name')?.invalid && supplierForm.get('name')?.touched)"
              [errorMessage]="(supplierForm.get('name')?.invalid && supplierForm.get('name')?.touched) ? 'Name is required' : undefined"
              prefixIcon="tag"
            ></app-text-input>
          </div>

          <div>
            <app-autocomplete-input
              formControlName="type"
              label="Type"
              [required]="true"
              [options]="typeOptions"
              placeholder="Select Type"
              prefixIcon="factory"
              [hasError]="!!(supplierForm.get('type')?.invalid && supplierForm.get('type')?.touched)"
              [errorMessage]="(supplierForm.get('type')?.invalid && supplierForm.get('type')?.touched) ? 'Type is required' : undefined"
            ></app-autocomplete-input>
          </div>

          <div>
            <app-text-input
              type="tel"
              formControlName="phone"
              label="Phone"
              prefixIcon="phone"
            ></app-text-input>
          </div>

          <div>
            <app-text-input
              type="email"
              formControlName="email"
              label="Email"
              [hasError]="!!(supplierForm.get('email')?.invalid && supplierForm.get('email')?.touched)"
              [errorMessage]="(supplierForm.get('email')?.invalid && supplierForm.get('email')?.touched) ? 'Please enter a valid email' : undefined"
              prefixIcon="mail"
            ></app-text-input>
          </div>

          <div class="md:col-span-2">
            <app-text-input
              type="text"
              formControlName="address"
              label="Address"
              prefixIcon="map-pin"
            ></app-text-input>
          </div>

          <div class="md:col-span-2">
            <app-autocomplete-input
              formControlName="status"
              label="Status"
              [options]="statusOptions"
              placeholder="Select status"
              prefixIcon="check-circle"
            ></app-autocomplete-input>
          </div>

          <div class="md:col-span-2">
            <app-textarea-input
              formControlName="notes"
              label="Notes"
              [rows]="3"
              prefixIcon="document-text"
            ></app-textarea-input>
          </div>
        </div>

        <div class="flex items-center justify-end gap-4 pt-6 border-t">
          <app-button type="button" variant="outline" (onClick)="onCancel()">
            Cancel
          </app-button>
          <app-button
            type="submit"
            variant="primary"
            [loading]="loading"
            [disabled]="supplierForm.invalid"
          >
            {{ isEdit ? 'Update' : 'Create' }} Supplier
          </app-button>
        </div>
      </form>
    </app-form-wrapper>
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
    { value: 'manufacturer', label: 'Manufacturer' },
    { value: 'warehouse', label: 'Warehouse' }
  ];
  statusOptions: AutocompleteOption[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
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
        this.errorMessage = 'Failed to load supplier data';
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
          this.errorMessage = error.message || 'An error occurred while saving the supplier';
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









