import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { InvoicesService } from '../../../core/services/invoices.service';
import { PatientsService } from '../../../core/services/patients.service';
import { DrugsService } from '../../../core/services/drugs.service';
import { BundlesService } from '../../../core/services/bundles.service';
import { BarcodeService } from '../../../shared/services/barcode.service';
import { BarcodeScannerDirective } from '../../../shared/directives/barcode-scanner.directive';
import { FormWrapperComponent } from '../../../shared/components/form-wrapper/form-wrapper.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FormWrapperComponent,
    ButtonComponent,
    AlertComponent,
    BarcodeScannerDirective
  ],
  template: `
    <app-form-wrapper [title]="isEdit ? 'Edit Sales Invoice' : 'Create New Sales Invoice'">
      @if (errorMessage) {
        <app-alert type="error" [title]="errorMessage" />
      }

      <form [formGroup]="invoiceForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Patient <span class="text-red-500">*</span>
            </label>
            <select
              formControlName="patientId"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            >
              <option value="">Select Patient</option>
              @for (patient of patients; track patient.id) {
                <option [value]="patient.id">{{ patient.fullName }}</option>
              }
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Promo Code</label>
            <input
              type="text"
              formControlName="promoCode"
              placeholder="Enter promo code"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Discount (Optional)</label>
            <input
              type="number"
              formControlName="discount"
              placeholder="0.00"
              step="0.01"
              min="0"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            />
          </div>
        </div>

        <!-- Items Section -->
        <div class="border-t pt-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Items</h3>
            <div class="flex gap-3">
              <div class="relative">
                <input
                  type="text"
                  placeholder="Scan barcode or search..."
                  [(ngModel)]="barcodeInput"
                  [ngModelOptions]="{standalone: true}"
                  (keyup.enter)="addItemByBarcode()"
                  appBarcodeScanner
                  (barcodeScanned)="onBarcodeScanned($event)"
                  class="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                />
                <svg class="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <app-button type="button" variant="outline" size="sm" (onClick)="showDrugSelector = !showDrugSelector">
                Add Drug
              </app-button>
            </div>
          </div>

          <!-- Drug Selector Modal (simplified) -->
          @if (showDrugSelector) {
            <div class="mb-4 p-4 bg-gray-50 rounded-[var(--radius-md)]">
              <select
                [(ngModel)]="selectedDrugId"
                [ngModelOptions]="{standalone: true}"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm mb-2"
              >
                <option value="">Select Drug</option>
                @for (drug of pharmacyDrugs; track drug.id) {
                  <option [value]="drug.id">{{ drug.generalDrug?.name || 'Drug ' + drug.id }} - {{ drug.price }}</option>
                }
              </select>
              <app-button type="button" variant="primary" size="sm" (onClick)="addSelectedDrug()">Add</app-button>
            </div>
          }

          <div formArrayName="items" class="space-y-4">
            @for (item of itemsArray.controls; track $index; let i = $index) {
              <div [formGroupName]="i" class="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-[var(--radius-md)]">
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Drug</label>
                  <input
                    type="text"
                    [value]="getDrugName(item.get('drugId')?.value)"
                    readonly
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm bg-gray-100"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    formControlName="quantity"
                    min="1"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                  <input
                    type="number"
                    formControlName="unitPrice"
                    step="0.01"
                    readonly
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm bg-gray-100"
                  />
                </div>
                <div class="flex items-end">
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
            }
          </div>

          <div class="mt-4 p-4 bg-gray-50 rounded-[var(--radius-md)] space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-700">Subtotal:</span>
              <span class="font-medium">{{ formattedSubtotal }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-700">Discount:</span>
              <span class="font-medium">{{ formattedDiscount }}</span>
            </div>
            <div class="flex justify-between pt-2 border-t">
              <span class="text-lg font-semibold text-gray-900">Total:</span>
              <span class="text-lg font-bold text-gray-900">{{ formattedTotal }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Info -->
        <div class="border-t pt-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
              <select
                formControlName="paymentStatus"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              >
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                formControlName="paymentMethod"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              >
                <option value="">Select Method</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
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
            [disabled]="invoiceForm.invalid || itemsArray.length === 0"
          >
            {{ isEdit ? 'Update' : 'Create' }} Invoice
          </app-button>
        </div>
      </form>
    </app-form-wrapper>
  `,
  styles: []
})
export class InvoiceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private invoicesService = inject(InvoicesService);
  private patientsService = inject(PatientsService);
  private drugsService = inject(DrugsService);
  private bundlesService = inject(BundlesService);
  private barcodeService = inject(BarcodeService);

  invoiceForm!: FormGroup;
  loading = false;
  errorMessage = '';
  isEdit = false;
  invoiceId: string | null = null;
  patients: any[] = [];
  pharmacyDrugs: any[] = [];
  barcodeInput = '';
  showDrugSelector = false;
  selectedDrugId = '';

  get itemsArray(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  get subtotal(): number {
    const items = this.itemsArray.value;
    return items.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.unitPrice || 0);
    }, 0);
  }

  get discount(): number {
    return this.invoiceForm.get('discount')?.value || 0;
  }

  get total(): number {
    return Math.max(0, this.subtotal - this.discount);
  }

  get formattedSubtotal(): string {
    return this.subtotal.toFixed(2);
  }

  get formattedDiscount(): string {
    return this.discount.toFixed(2);
  }

  get formattedTotal(): string {
    return this.total.toFixed(2);
  }

  ngOnInit(): void {
    this.invoiceId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.invoiceId;

    this.invoiceForm = this.fb.group({
      patientId: ['', [Validators.required]],
      promoCode: [''],
      items: this.fb.array([]),
      discount: [0],
      paymentStatus: ['pending'],
      paymentMethod: ['']
    });

    this.loadPatients();
    this.loadDrugs();

    if (this.isEdit && this.invoiceId) {
      this.loadInvoice();
    }
  }

  private loadPatients(): void {
    this.patientsService.getAll({ page: 1, pageSize: 100 }).subscribe({
      next: (response) => {
        this.patients = response.data;
      }
    });
  }

  private loadDrugs(): void {
    this.drugsService.getPharmacyDrugs({ page: 1, pageSize: 100 }).subscribe({
      next: (response) => {
        this.pharmacyDrugs = response.data;
      }
    });
  }

  private loadInvoice(): void {
    this.invoicesService.getById(this.invoiceId!).subscribe({
      next: (invoice) => {
        if (invoice) {
          this.invoiceForm.patchValue({
            patientId: invoice.patientId,
            promoCode: invoice.promoCode || '',
            discount: invoice.discount,
            paymentStatus: invoice.paymentStatus,
            paymentMethod: invoice.paymentMethod || ''
          });

          invoice.items.forEach(item => {
            this.addItemWithData(item);
          });
        }
      },
      error: () => {
        this.errorMessage = 'Failed to load invoice';
      }
    });
  }

  onBarcodeScanned(barcode: string): void {
    this.addItemByBarcode(barcode);
  }

  addItemByBarcode(barcode?: string): void {
    const barcodeToSearch = barcode || this.barcodeInput.trim();
    if (!barcodeToSearch) return;

    this.drugsService.getPharmacyDrugByBarcode(barcodeToSearch).subscribe({
      next: (drug) => {
        if (drug) {
          this.addItemWithDrug(drug);
          this.barcodeInput = '';
        } else {
          this.errorMessage = 'Drug not found for barcode: ' + barcodeToSearch;
        }
      },
      error: () => {
        this.errorMessage = 'Failed to search drug';
      }
    });
  }

  addSelectedDrug(): void {
    if (!this.selectedDrugId) return;

    const drug = this.pharmacyDrugs.find(d => d.id === this.selectedDrugId);
    if (drug) {
      this.addItemWithDrug(drug);
      this.selectedDrugId = '';
      this.showDrugSelector = false;
    }
  }

  addItemWithDrug(drug: any): void {
    const itemForm = this.fb.group({
      drugId: [drug.id, [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [drug.price, [Validators.required]]
    });
    this.itemsArray.push(itemForm);
  }

  addItemWithData(item: any): void {
    const itemForm = this.fb.group({
      drugId: [item.drugId, [Validators.required]],
      quantity: [item.quantity, [Validators.required, Validators.min(1)]],
      unitPrice: [item.unitPrice, [Validators.required]]
    });
    this.itemsArray.push(itemForm);
  }

  removeItem(index: number): void {
    this.itemsArray.removeAt(index);
  }

  getDrugName(drugId: string): string {
    const drug = this.pharmacyDrugs.find(d => d.id === drugId);
    return drug?.generalDrug?.name || 'Unknown Drug';
  }

  onSubmit(): void {
    if (this.invoiceForm.valid && this.itemsArray.length > 0) {
      this.loading = true;
      this.errorMessage = '';

      const formValue = this.invoiceForm.value;
      const items = formValue.items.map((item: any) => ({
        drugId: item.drugId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice
      }));

      const invoiceData = {
        patientId: formValue.patientId,
        items: items,
        subtotal: this.subtotal,
        discount: this.discount,
        promoCode: formValue.promoCode || undefined,
        total: this.total,
        paymentStatus: formValue.paymentStatus,
        paymentMethod: formValue.paymentMethod || undefined,
        pharmacyId: 'ph1'
      };

      const operation = this.isEdit
        ? this.invoicesService.update(this.invoiceId!, invoiceData)
        : this.invoicesService.create(invoiceData);

      operation.subscribe({
        next: () => {
          this.router.navigate(['/invoices']);
        },
        error: (error) => {
          this.errorMessage = error.message || 'An error occurred while saving';
          this.loading = false;
        }
      });
    } else {
      Object.keys(this.invoiceForm.controls).forEach(key => {
        this.invoiceForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/invoices']);
  }
}
