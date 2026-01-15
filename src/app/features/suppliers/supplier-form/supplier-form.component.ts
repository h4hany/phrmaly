import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SuppliersService } from '../../../core/services/suppliers.service';
import { FormWrapperComponent } from '../../../shared/components/form-wrapper/form-wrapper.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormWrapperComponent,
    ButtonComponent,
    AlertComponent
  ],
  template: `
    <app-form-wrapper [title]="isEdit ? 'Edit Supplier' : 'Add New Supplier'">
      @if (errorMessage) {
        <app-alert type="error" [title]="errorMessage" />
      }

      <form [formGroup]="supplierForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Name <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              formControlName="name"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
              [class.border-red-500]="supplierForm.get('name')?.invalid && supplierForm.get('name')?.touched"
            />
            @if (supplierForm.get('name')?.invalid && supplierForm.get('name')?.touched) {
              <p class="mt-1 text-sm text-red-600">Name is required</p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Type <span class="text-red-500">*</span>
            </label>
            <select
              formControlName="type"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
              [class.border-red-500]="supplierForm.get('type')?.invalid && supplierForm.get('type')?.touched"
            >
              <option value="">Select Type</option>
              <option value="manufacturer">Manufacturer</option>
              <option value="warehouse">Warehouse</option>
            </select>
            @if (supplierForm.get('type')?.invalid && supplierForm.get('type')?.touched) {
              <p class="mt-1 text-sm text-red-600">Type is required</p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              formControlName="phone"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              formControlName="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
              [class.border-red-500]="supplierForm.get('email')?.invalid && supplierForm.get('email')?.touched"
            />
            @if (supplierForm.get('email')?.invalid && supplierForm.get('email')?.touched) {
              <p class="mt-1 text-sm text-red-600">Please enter a valid email</p>
            }
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              formControlName="address"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
            />
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              formControlName="status"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              formControlName="notes"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
            ></textarea>
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






