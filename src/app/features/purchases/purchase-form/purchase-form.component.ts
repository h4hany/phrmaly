import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PurchasesService } from '../../../core/services/purchases.service';
import { SuppliersService } from '../../../core/services/suppliers.service';
import { DrugsService } from '../../../core/services/drugs.service';
import { FormWrapperComponent } from '../../../shared/components/form-wrapper/form-wrapper.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { TextInputComponent } from '../../../shared/components/input/text-input.component';
import { AutocompleteInputComponent, AutocompleteOption } from '../../../shared/components/input/autocomplete-input.component';

@Component({
  selector: 'app-purchase-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormWrapperComponent,
    ButtonComponent,
    AlertComponent,
    TextInputComponent,
    AutocompleteInputComponent
  ],
  template: `
    <app-form-wrapper [title]="isEdit ? 'Edit Purchase Invoice' : 'Add New Purchase Invoice'">
      @if (errorMessage) {
        <app-alert type="error" [title]="errorMessage" />
      }

      <form [formGroup]="purchaseForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <app-text-input
              type="text"
              formControlName="invoiceNumber"
              label="Invoice Number"
              [required]="true"
              prefixIcon="receipt"
            ></app-text-input>
          </div>

          <div>
            <app-autocomplete-input
              formControlName="supplierId"
              label="Supplier"
              [required]="true"
              [options]="supplierOptions"
              placeholder="Select Supplier"
              prefixIcon="factory"
            ></app-autocomplete-input>
          </div>

          <div>
            <app-text-input
              type="date"
              formControlName="purchaseDate"
              label="Purchase Date"
              [required]="true"
              prefixIcon="calendar"
            ></app-text-input>
          </div>

          <div>
            <app-text-input
              type="date"
              formControlName="dueDate"
              label="Due Date"
              prefixIcon="calendar"
            ></app-text-input>
          </div>
        </div>

        <!-- Items -->
        <div class="border-t pt-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Items</h3>
            <app-button type="button" variant="outline" size="sm" (onClick)="addItem()">
              <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Item
            </app-button>
          </div>

          <div formArrayName="items" class="space-y-4">
            @for (item of itemsArray.controls; track $index; let i = $index) {
              <div [formGroupName]="i" class="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-[var(--radius-md)]">
                <div class="md:col-span-2">
                  <app-autocomplete-input
                    formControlName="drugId"
                    label="Drug"
                    [options]="drugOptions"
                    placeholder="Select Drug"
                    prefixIcon="medicine"
                  ></app-autocomplete-input>
                </div>
                <div>
                  <app-text-input
                    type="number"
                    formControlName="quantity"
                    label="Quantity"
                    [min]="1"
                    prefixIcon="package"
                  ></app-text-input>
                </div>
                <div>
                  <app-text-input
                    type="number"
                    formControlName="unitCost"
                    label="Unit Cost"
                    [step]="0.01"
                    [min]="0"
                    prefixIcon="currency-dollar"
                  ></app-text-input>
                </div>
                <div class="flex items-end">
                  <app-button
                    type="button"
                    variant="ghost"
                    size="sm"
                    (onClick)="removeItem(i)"
                  >
                    <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </app-button>
                </div>
              </div>
            }
          </div>

          <div class="mt-4 p-4 bg-gray-50 rounded-[var(--radius-md)]">
            <div class="flex justify-between items-center">
              <span class="text-lg font-semibold text-gray-900">Total Amount:</span>
              <span class="text-lg font-bold text-gray-900">{{ formattedTotalAmount }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Info -->
        <div class="border-t pt-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <app-text-input
                type="number"
                formControlName="paidAmount"
                label="Paid Amount"
                [step]="0.01"
                [min]="0"
                prefixIcon="currency-dollar"
              ></app-text-input>
            </div>
            <div>
              <app-autocomplete-input
                formControlName="paymentStatus"
                label="Payment Status"
                [options]="paymentStatusOptions"
                placeholder="Select payment status"
                prefixIcon="check-circle"
              ></app-autocomplete-input>
            </div>
            <div class="flex items-end">
              <div class="w-full p-3 bg-gray-50 rounded-[var(--radius-md)]">
                <div class="text-sm text-gray-600">Remaining Amount</div>
                <div class="text-lg font-semibold text-gray-900">{{ formattedRemainingAmount }}</div>
              </div>
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
            [disabled]="purchaseForm.invalid || itemsArray.length === 0"
          >
            {{ isEdit ? 'Update' : 'Create' }} Purchase
          </app-button>
        </div>
      </form>
    </app-form-wrapper>
  `,
  styles: []
})
export class PurchaseFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private purchasesService = inject(PurchasesService);
  private suppliersService = inject(SuppliersService);
  private drugsService = inject(DrugsService);

  purchaseForm!: FormGroup;
  loading = false;
  errorMessage = '';
  isEdit = false;
  purchaseId: string | null = null;
  suppliers: any[] = [];
  pharmacyDrugs: any[] = [];
  supplierOptions: AutocompleteOption[] = [];
  drugOptions: AutocompleteOption[] = [];
  paymentStatusOptions: AutocompleteOption[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'partial', label: 'Partial' },
    { value: 'paid', label: 'Paid' }
  ];

  get itemsArray(): FormArray {
    return this.purchaseForm.get('items') as FormArray;
  }

  get totalAmount(): number {
    const items = this.itemsArray.value;
    return items.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.unitCost || 0);
    }, 0);
  }

  get remainingAmount(): number {
    const paid = this.purchaseForm.get('paidAmount')?.value || 0;
    return Math.max(0, this.totalAmount - paid);
  }

  get formattedTotalAmount(): string {
    return this.totalAmount.toFixed(2);
  }

  get formattedRemainingAmount(): string {
    return this.remainingAmount.toFixed(2);
  }

  ngOnInit(): void {
    this.purchaseId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.purchaseId;

    this.purchaseForm = this.fb.group({
      invoiceNumber: ['', [Validators.required]],
      supplierId: ['', [Validators.required]],
      purchaseDate: ['', [Validators.required]],
      dueDate: [''],
      items: this.fb.array([]),
      paidAmount: [0],
      paymentStatus: ['pending']
    });

    this.loadSuppliers();
    this.loadDrugs();

    if (this.isEdit && this.purchaseId) {
      this.loadPurchase();
    }
  }

  private loadSuppliers(): void {
    this.suppliersService.getAll({ page: 1, pageSize: 100 }).subscribe({
      next: (response) => {
        this.suppliers = response.data;
        this.supplierOptions = this.suppliers.map(supplier => ({
          value: supplier.id,
          label: supplier.name
        }));
      }
    });
  }

  private loadDrugs(): void {
    this.drugsService.getPharmacyDrugs().subscribe({
      next: (response) => {
        this.pharmacyDrugs = Array.isArray(response) ? response : response.data;
        this.drugOptions = this.pharmacyDrugs.map(drug => ({
          value: drug.id,
          label: drug.generalDrug?.name || 'Drug ' + drug.id
        }));
      }
    });
  }

  private loadPurchase(): void {
    this.purchasesService.getById(this.purchaseId!).subscribe({
      next: (purchase) => {
        if (purchase) {
          this.purchaseForm.patchValue({
            invoiceNumber: purchase.invoiceNumber,
            supplierId: purchase.supplierId,
            purchaseDate: this.formatDateForInput(purchase.purchaseDate),
            dueDate: purchase.dueDate ? this.formatDateForInput(purchase.dueDate) : '',
            paidAmount: purchase.paidAmount,
            paymentStatus: purchase.paymentStatus
          });

          purchase.items.forEach(item => {
            this.addItemWithData(item);
          });
        }
      },
      error: () => {
        this.errorMessage = 'Failed to load purchase invoice';
      }
    });
  }

  addItem(): void {
    const itemForm = this.fb.group({
      drugId: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitCost: [0, [Validators.required, Validators.min(0)]]
    });
    this.itemsArray.push(itemForm);
  }

  addItemWithData(item: any): void {
    const itemForm = this.fb.group({
      drugId: [item.drugId, [Validators.required]],
      quantity: [item.quantity, [Validators.required, Validators.min(1)]],
      unitCost: [item.unitCost, [Validators.required, Validators.min(0)]]
    });
    this.itemsArray.push(itemForm);
  }

  removeItem(index: number): void {
    this.itemsArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.purchaseForm.valid && this.itemsArray.length > 0) {
      this.loading = true;
      this.errorMessage = '';

      const formValue = this.purchaseForm.value;
      const items = formValue.items.map((item: any) => ({
        drugId: item.drugId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalCost: item.quantity * item.unitCost
      }));

      const purchaseData = {
        invoiceNumber: formValue.invoiceNumber,
        supplierId: formValue.supplierId,
        purchaseDate: new Date(formValue.purchaseDate),
        dueDate: formValue.dueDate ? new Date(formValue.dueDate) : undefined,
        items: items,
        totalAmount: this.totalAmount,
        paidAmount: formValue.paidAmount || 0,
        remainingAmount: this.remainingAmount,
        paymentStatus: formValue.paymentStatus,
        pharmacyId: 'ph1' // Get from context
      };

      const operation = this.isEdit
        ? this.purchasesService.update(this.purchaseId!, purchaseData)
        : this.purchasesService.create(purchaseData);

      operation.subscribe({
        next: () => {
          this.router.navigate(['/purchases']);
        },
        error: (error) => {
          this.errorMessage = error.message || 'An error occurred while saving';
          this.loading = false;
        }
      });
    } else {
      Object.keys(this.purchaseForm.controls).forEach(key => {
        this.purchaseForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/purchases']);
  }

  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
