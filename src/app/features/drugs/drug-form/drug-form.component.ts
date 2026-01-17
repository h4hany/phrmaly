import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DrugsService } from '../../../core/services/drugs.service';
import { FormWrapperComponent } from '../../../shared/components/form-wrapper/form-wrapper.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-drug-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormWrapperComponent,
    ButtonComponent,
    AlertComponent,
    TranslatePipe
  ],
  template: `
    <app-form-wrapper [title]="isEdit ? 'Edit Pharmacy Drug' : 'Add New Pharmacy Drug'">
      @if (errorMessage) {
        <app-alert type="error" [title]="errorMessage" />
      }

      <form [formGroup]="drugForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              General Drug <span class="text-red-500">*</span>
            </label>
            <select
              formControlName="generalDrugId"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              [class.border-red-500]="drugForm.get('generalDrugId')?.invalid && drugForm.get('generalDrugId')?.touched"
            >
              <option value="">Select General Drug</option>
              @for (drug of generalDrugs; track drug.id) {
                <option [value]="drug.id">{{ drug.name }} - {{ drug.manufacturer }}</option>
              }
            </select>
            @if (drugForm.get('generalDrugId')?.invalid && drugForm.get('generalDrugId')?.touched) {
              <p class="mt-1 text-sm text-red-600">General drug is required</p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Internal Barcode (PLU) <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              formControlName="internalBarcode"
              placeholder="6-8 digits"
              maxlength="8"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              [class.border-red-500]="drugForm.get('internalBarcode')?.invalid && drugForm.get('internalBarcode')?.touched"
            />
            @if (drugForm.get('internalBarcode')?.invalid && drugForm.get('internalBarcode')?.touched) {
              <p class="mt-1 text-sm text-red-600">Internal barcode is required (6-8 digits)</p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Price <span class="text-red-500">*</span>
            </label>
            <input
              type="number"
              formControlName="price"
              step="0.01"
              min="0"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Price After Discount</label>
            <input
              type="number"
              formControlName="priceAfterDiscount"
              step="0.01"
              min="0"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity <span class="text-red-500">*</span>
            </label>
            <input
              type="number"
              formControlName="stockQuantity"
              min="0"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Minimum Stock <span class="text-red-500">*</span>
            </label>
            <input
              type="number"
              formControlName="minimumStock"
              min="0"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
            <input
              type="date"
              formControlName="expiryDate"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              formControlName="status"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ 'drug.classification' | translate }}
            </label>
            <div class="flex gap-4">
              <label class="flex items-center cursor-pointer">
                <input
                  type="radio"
                  formControlName="classification"
                  value="medicinal"
                  class="w-4 h-4 text-[var(--primary-color)] focus:ring-[var(--primary-color)] border-gray-300"
                />
                <span class="ml-2 text-sm text-gray-700">{{ 'drug.classification.medicinal' | translate }}</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input
                  type="radio"
                  formControlName="classification"
                  value="cosmetic"
                  class="w-4 h-4 text-[var(--primary-color)] focus:ring-[var(--primary-color)] border-gray-300"
                />
                <span class="ml-2 text-sm text-gray-700">{{ 'drug.classification.cosmetic' | translate }}</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ 'drug.origin' | translate }}
            </label>
            <div class="flex gap-4">
              <label class="flex items-center cursor-pointer">
                <input
                  type="radio"
                  formControlName="origin"
                  value="local"
                  class="w-4 h-4 text-[var(--primary-color)] focus:ring-[var(--primary-color)] border-gray-300"
                />
                <span class="ml-2 text-sm text-gray-700">{{ 'drug.origin.local' | translate }}</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input
                  type="radio"
                  formControlName="origin"
                  value="imported"
                  class="w-4 h-4 text-[var(--primary-color)] focus:ring-[var(--primary-color)] border-gray-300"
                />
                <span class="ml-2 text-sm text-gray-700">{{ 'drug.origin.imported' | translate }}</span>
              </label>
            </div>
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
            [disabled]="drugForm.invalid"
          >
            {{ isEdit ? 'Update' : 'Create' }} Drug
          </app-button>
        </div>
      </form>
    </app-form-wrapper>
  `,
  styles: []
})
export class DrugFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private drugsService = inject(DrugsService);

  drugForm!: FormGroup;
  loading = false;
  errorMessage = '';
  isEdit = false;
  drugId: string | null = null;
  generalDrugs: any[] = [];

  ngOnInit(): void {
    this.drugId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.drugId;

    this.drugForm = this.fb.group({
      generalDrugId: ['', [Validators.required]],
      internalBarcode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(8)]],
      price: [0, [Validators.required, Validators.min(0)]],
      priceAfterDiscount: [0, [Validators.min(0)]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      minimumStock: [0, [Validators.required, Validators.min(0)]],
      expiryDate: [''],
      status: ['active'],
      classification: ['medicinal'],
      origin: ['local']
    });

    this.loadGeneralDrugs();

    if (this.isEdit && this.drugId) {
      this.loadDrug();
    }
  }

  private loadGeneralDrugs(): void {
    this.drugsService.getAllGeneralDrugs().subscribe({
      next: (drugs) => {
        this.generalDrugs = drugs;
      }
    });
  }

  private loadDrug(): void {
    this.drugsService.getPharmacyDrugById(this.drugId!).subscribe({
      next: (drug) => {
        if (drug) {
          this.drugForm.patchValue({
            generalDrugId: drug.generalDrugId,
            internalBarcode: drug.internalBarcode,
            price: drug.price,
            priceAfterDiscount: drug.priceAfterDiscount,
            stockQuantity: drug.stockQuantity,
            minimumStock: drug.minimumStock,
            expiryDate: drug.expiryDate ? this.formatDateForInput(drug.expiryDate) : '',
            status: drug.status,
            classification: drug.classification || 'medicinal',
            origin: drug.origin || 'local'
          });
        }
      },
      error: () => {
        this.errorMessage = 'Failed to load drug data';
      }
    });
  }

  onSubmit(): void {
    if (this.drugForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const formValue = this.drugForm.value;
      const drugData = {
        generalDrugId: formValue.generalDrugId,
        pharmacyId: 'ph1',
        internalBarcode: formValue.internalBarcode,
        price: formValue.price,
        priceAfterDiscount: formValue.priceAfterDiscount || formValue.price,
        stockQuantity: formValue.stockQuantity,
        minimumStock: formValue.minimumStock,
        expiryDate: formValue.expiryDate ? new Date(formValue.expiryDate) : undefined,
        status: formValue.status,
        classification: formValue.classification,
        origin: formValue.origin
      };

      const operation = this.isEdit
        ? this.drugsService.updatePharmacyDrug(this.drugId!, drugData)
        : this.drugsService.createPharmacyDrug(drugData);

      operation.subscribe({
        next: () => {
          this.router.navigate(['/drugs']);
        },
        error: (error) => {
          this.errorMessage = error.message || 'An error occurred while saving the drug';
          this.loading = false;
        }
      });
    } else {
      Object.keys(this.drugForm.controls).forEach(key => {
        this.drugForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/drugs']);
  }

  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
