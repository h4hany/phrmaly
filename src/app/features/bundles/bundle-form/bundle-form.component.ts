import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BundlesService } from '../../../core/services/bundles.service';
import { DrugsService } from '../../../core/services/drugs.service';
import { FormWrapperComponent } from '../../../shared/components/form-wrapper/form-wrapper.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-bundle-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormWrapperComponent,
    ButtonComponent,
    AlertComponent
  ],
  template: `
    <app-form-wrapper [title]="isEdit ? 'Edit Bundle' : 'Add New Bundle'">
      @if (errorMessage) {
        <app-alert type="error" [title]="errorMessage" />
      }

      <form [formGroup]="bundleForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Name <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              formControlName="name"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              [class.border-red-500]="bundleForm.get('name')?.invalid && bundleForm.get('name')?.touched"
            />
            @if (bundleForm.get('name')?.invalid && bundleForm.get('name')?.touched) {
              <p class="mt-1 text-sm text-red-600">Name is required</p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Fixed Price <span class="text-red-500">*</span>
            </label>
            <input
              type="number"
              formControlName="fixedPrice"
              step="0.01"
              min="0"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            />
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              formControlName="status"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <!-- Items -->
        <div class="border-t pt-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Bundle Items</h3>
            <app-button type="button" variant="outline" size="sm" (onClick)="addItem()">
              <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Item
            </app-button>
          </div>

          <div formArrayName="items" class="space-y-4">
            @for (item of itemsArray.controls; track $index; let i = $index) {
              <div [formGroupName]="i" class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-[var(--radius-md)]">
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Drug</label>
                  <select
                    formControlName="drugId"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  >
                    <option value="">Select Drug</option>
                    @for (drug of pharmacyDrugs; track drug.id) {
                      <option [value]="drug.id">{{ drug.generalDrug?.name || 'Drug ' + drug.id }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <div class="flex gap-2">
                    <input
                      type="number"
                      formControlName="quantity"
                      min="1"
                      class="flex-1 px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    />
                    <button
                      type="button"
                      (click)="removeItem(i)"
                      class="p-2 text-red-600 hover:text-red-800"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex items-center justify-end gap-4 pt-6 border-t">
          <app-button type="button" variant="outline" (onClick)="onCancel()">
            Cancel
          </app-button>
          <app-button
            type="submit"
            variant="primary"
            [loading]="loading"
            [disabled]="bundleForm.invalid || itemsArray.length === 0"
          >
            {{ isEdit ? 'Update' : 'Create' }} Bundle
          </app-button>
        </div>
      </form>
    </app-form-wrapper>
  `,
  styles: []
})
export class BundleFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private bundlesService = inject(BundlesService);
  private drugsService = inject(DrugsService);

  bundleForm!: FormGroup;
  loading = false;
  errorMessage = '';
  isEdit = false;
  bundleId: string | null = null;
  pharmacyDrugs: any[] = [];

  get itemsArray(): FormArray {
    return this.bundleForm.get('items') as FormArray;
  }

  ngOnInit(): void {
    this.bundleId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.bundleId;

    this.bundleForm = this.fb.group({
      name: ['', [Validators.required]],
      fixedPrice: [0, [Validators.required, Validators.min(0)]],
      status: ['active'],
      items: this.fb.array([])
    });

    this.loadDrugs();

    if (this.isEdit && this.bundleId) {
      this.loadBundle();
    }
  }

  private loadDrugs(): void {
    this.drugsService.getPharmacyDrugs({ page: 1, pageSize: 100 }).subscribe({
      next: (response) => {
        this.pharmacyDrugs = response.data;
      }
    });
  }

  private loadBundle(): void {
    this.bundlesService.getById(this.bundleId!).subscribe({
      next: (bundle) => {
        if (bundle) {
          this.bundleForm.patchValue({
            name: bundle.name,
            fixedPrice: bundle.fixedPrice,
            status: bundle.status
          });

          bundle.items.forEach(item => {
            this.addItemWithData(item);
          });
        }
      },
      error: () => {
        this.errorMessage = 'Failed to load bundle data';
      }
    });
  }

  addItem(): void {
    const itemForm = this.fb.group({
      drugId: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
    this.itemsArray.push(itemForm);
  }

  addItemWithData(item: any): void {
    const itemForm = this.fb.group({
      drugId: [item.drugId, [Validators.required]],
      quantity: [item.quantity, [Validators.required, Validators.min(1)]]
    });
    this.itemsArray.push(itemForm);
  }

  removeItem(index: number): void {
    this.itemsArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.bundleForm.valid && this.itemsArray.length > 0) {
      this.loading = true;
      this.errorMessage = '';

      const formValue = this.bundleForm.value;
      const bundleData = {
        name: formValue.name,
        fixedPrice: formValue.fixedPrice,
        status: formValue.status,
        items: formValue.items,
        pharmacyId: 'ph1'
      };

      const operation = this.isEdit
        ? this.bundlesService.update(this.bundleId!, bundleData)
        : this.bundlesService.create(bundleData);

      operation.subscribe({
        next: () => {
          this.router.navigate(['/bundles']);
        },
        error: (error) => {
          this.errorMessage = error.message || 'An error occurred while saving';
          this.loading = false;
        }
      });
    } else {
      Object.keys(this.bundleForm.controls).forEach(key => {
        this.bundleForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/bundles']);
  }
}







