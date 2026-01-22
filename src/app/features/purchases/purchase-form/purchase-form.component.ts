import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PurchasesService } from '../../../core/services/purchases.service';
import { SuppliersService } from '../../../core/services/suppliers.service';
import { DrugsService } from '../../../core/services/drugs.service';
import { ModernFormWrapperComponent } from '../../../shared/components/modern-form-wrapper/modern-form-wrapper.component';
import { FormSectionComponent } from '../../../shared/components/form-section/form-section.component';
import { TextInputComponent } from '../../../shared/components/input/text-input.component';
import { AutocompleteInputComponent, AutocompleteOption } from '../../../shared/components/input/autocomplete-input.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-purchase-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ModernFormWrapperComponent,
    FormSectionComponent,
    TextInputComponent,
    AutocompleteInputComponent,
    TranslatePipe
  ],
  template: `
    <app-modern-form-wrapper
      [title]="(isEdit ? 'form.editPurchase' : 'form.addPurchase')"
      [description]="(isEdit ? 'form.editPurchaseDescription' : 'form.addPurchaseDescription')"
      [errorMessage]="errorMessage"
    >
      <form [formGroup]="purchaseForm" (ngSubmit)="onSubmit()" class="p-8">
        <!-- Purchase Information Section -->
        <app-form-section [title]="'purchase.basicInfo'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <app-text-input
                type="text"
                formControlName="invoiceNumber"
                [label]="'form.purchase.invoiceNumber'"
                [required]="true"
                prefixIcon="receipt"
              ></app-text-input>
            </div>

            <div>
              <app-autocomplete-input
                formControlName="supplierId"
                [label]="'form.purchase.supplier'"
                [required]="true"
                [options]="supplierOptions"
                [placeholder]="'form.selectSupplier'"
                prefixIcon="factory"
              ></app-autocomplete-input>
            </div>

            <div>
              <app-text-input
                type="date"
                formControlName="purchaseDate"
                [label]="'form.purchase.purchaseDate'"
                [required]="true"
                prefixIcon="calendar"
              ></app-text-input>
            </div>

            <div>
              <app-text-input
                type="date"
                formControlName="dueDate"
                [label]="'form.purchase.dueDate'"
                prefixIcon="calendar"
              ></app-text-input>
            </div>
          </div>
        </app-form-section>

        <!-- Items Section -->
        <app-form-section [title]="'purchase.items'">
          <div class="flex items-center justify-between mb-6">
            <h4 class="text-lg font-semibold text-gray-700">{{ 'form.purchase.addItems' | translate }}</h4>
            <button
              type="button"
              (click)="addItem()"
              class="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ 'form.purchase.addItem' | translate }}
            </button>
          </div>

          <div formArrayName="items" class="space-y-4">
            @for (item of itemsArray.controls; track $index; let i = $index) {
              <div [formGroupName]="i" class="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div class="md:col-span-2">
                  <app-autocomplete-input
                    formControlName="drugId"
                    [label]="'form.purchase.drug'"
                    [options]="drugOptions"
                    [placeholder]="'form.selectDrug'"
                    prefixIcon="medicine"
                  ></app-autocomplete-input>
                </div>
                <div>
                  <app-text-input
                    type="number"
                    formControlName="quantity"
                    [label]="'form.purchase.quantity'"
                    [min]="1"
                    prefixIcon="package"
                  ></app-text-input>
                </div>
                <div>
                  <app-text-input
                    type="number"
                    formControlName="unitCost"
                    [label]="'form.purchase.unitCost'"
                    [step]="0.01"
                    [min]="0"
                    prefixIcon="currency-dollar"
                  ></app-text-input>
                </div>
                <div class="flex items-end">
                  <button
                    type="button"
                    (click)="removeItem(i)"
                    class="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>

          <div class="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div class="flex justify-between items-center">
              <span class="text-lg font-semibold text-gray-900">{{ 'form.purchase.totalAmount' | translate }}:</span>
              <span class="text-lg font-bold text-gray-900">{{ formattedTotalAmount }}</span>
            </div>
          </div>
        </app-form-section>

        <!-- Payment Information Section -->
        <app-form-section [title]="'purchase.paymentInfo'">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <app-text-input
                type="number"
                formControlName="paidAmount"
                [label]="'form.purchase.paidAmount'"
                [step]="0.01"
                [min]="0"
                prefixIcon="currency-dollar"
              ></app-text-input>
            </div>
            <div>
              <app-autocomplete-input
                formControlName="paymentStatus"
                [label]="'form.purchase.paymentStatus'"
                [options]="paymentStatusOptions"
                [placeholder]="'form.selectPaymentStatus'"
                prefixIcon="check-circle"
              ></app-autocomplete-input>
            </div>
            <div>
              <div class="w-full p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div class="text-sm text-gray-600 mb-1">{{ 'form.purchase.remainingAmount' | translate }}</div>
                <div class="text-lg font-semibold text-gray-900">{{ formattedRemainingAmount }}</div>
              </div>
            </div>
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
            [disabled]="purchaseForm.invalid || itemsArray.length === 0 || loading"
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
            {{ (isEdit ? 'form.updatePurchase' : 'form.createPurchase') | translate }}
          </button>
        </div>
      </form>
    </app-modern-form-wrapper>
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
    { value: 'pending', label: 'payment.pending' },
    { value: 'partial', label: 'payment.partial' },
    { value: 'paid', label: 'payment.paid' }
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
        this.errorMessage = 'error.loadPurchase';
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
          this.errorMessage = error.message || 'error.savePurchase';
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
