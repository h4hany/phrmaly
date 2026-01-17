import { Component, OnInit, inject, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { InvoicesService } from '../../../core/services/invoices.service';
import { PatientsService } from '../../../core/services/patients.service';
import { DrugsService } from '../../../core/services/drugs.service';
import { InvoiceCartService } from '../../../core/services/invoice-cart.service';
import { BarcodeScannerDirective } from '../../../shared/directives/barcode-scanner.directive';
import { FormWrapperComponent } from '../../../shared/components/form-wrapper/form-wrapper.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { PharmacyContextService } from '../../../core/services/pharmacy-context.service';
import * as QRCode from 'qrcode';
import { PharmacyDrug } from '../../../core/models/drug.model';
import { Patient } from '../../../core/models/patient.model';

interface VoucherProductGroup {
  origin: 'local' | 'imported' | 'unknown';
  products: Array<{
    drugId: string;
    drugName: string;
    price: number;
    quantity: number;
    applyDiscount: boolean;
    discountPercentage: number;
  }>;
}

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
    BarcodeScannerDirective,
    TranslatePipe
  ],
  template: `
    <app-form-wrapper [title]="currentStep === 1 ? (isEdit ? ('form.editInvoice' | translate) : ('invoice.wizard.step1Title' | translate)) : currentStep === 2 ? ('invoice.wizard.step2Title' | translate) : ('invoice.wizard.step3Title' | translate)">
      @if (errorMessage) {
        <app-alert type="error" [title]="errorMessage" />
      }

      <!-- Wizard Steps Indicator -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2 flex-1">
            <div class="flex items-center">
              <div class="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors"
                   [class.bg-[var(--primary-color)]="currentStep >= 1"
                   [class.border-[var(--primary-color)]="currentStep >= 1"
                   [class.text-white]="currentStep >= 1"
                   [class.border-gray-300]="currentStep < 1"
                   [class.text-gray-500]="currentStep < 1">
                <span class="text-sm font-medium">1</span>
              </div>
              <span class="ml-2 text-sm font-medium" [class.text-[var(--primary-color)]="currentStep >= 1"
                    [class.text-gray-500]="currentStep < 1">
                {{ 'invoice.wizard.step1' | translate }}
              </span>
            </div>
            <div class="flex-1 h-0.5 mx-4" [class.bg-[var(--primary-color)]="currentStep >= 2"
                 [class.bg-gray-300]="currentStep < 2"></div>
            <div class="flex items-center">
              <div class="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors"
                   [class.bg-[var(--primary-color)]="currentStep >= 2"
                   [class.border-[var(--primary-color)]="currentStep >= 2"
                   [class.text-white]="currentStep >= 2"
                   [class.border-gray-300]="currentStep < 2"
                   [class.text-gray-500]="currentStep < 2">
                <span class="text-sm font-medium">2</span>
              </div>
              <span class="ml-2 text-sm font-medium" [class.text-[var(--primary-color)]="currentStep >= 2"
                    [class.text-gray-500]="currentStep < 2">
                {{ 'invoice.wizard.step2' | translate }}
              </span>
            </div>
            <div class="flex-1 h-0.5 mx-4" [class.bg-[var(--primary-color)]="currentStep >= 3"
                 [class.bg-gray-300]="currentStep < 3"></div>
            <div class="flex items-center">
              <div class="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors"
                   [class.bg-[var(--primary-color)]="currentStep >= 3"
                   [class.border-[var(--primary-color)]="currentStep >= 3"
                   [class.text-white]="currentStep >= 3"
                   [class.border-gray-300]="currentStep < 3"
                   [class.text-gray-500]="currentStep < 3">
                <span class="text-sm font-medium">3</span>
              </div>
              <span class="ml-2 text-sm font-medium" [class.text-[var(--primary-color)]="currentStep >= 3"
                    [class.text-gray-500]="currentStep < 3">
                {{ 'invoice.wizard.step3' | translate }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 1: Invoice Creation -->
      @if (currentStep === 1) {
        <form [formGroup]="invoiceForm" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ 'invoice.patient' | translate }} <span class="text-red-500">*</span>
              </label>
              <select
                formControlName="patientId"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              >
                <option value="">{{ 'form.selectPatient' | translate }}</option>
                @for (patient of patients; track patient.id) {
                  <option [value]="patient.id">{{ patient.fullName }}</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'invoice.doctor' | translate }}</label>
              <div class="relative doctor-dropdown-container">
                <input
                  type="text"
                  [(ngModel)]="doctorInput"
                  [ngModelOptions]="{standalone: true}"
                  (input)="onDoctorInput($event)"
                  (focus)="showDoctorDropdown = true"
                  [placeholder]="'form.selectOrType' | translate"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                />
                @if (showDoctorDropdown) {
                  <div class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-[var(--radius-md)] py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto">
                    @if (doctorInput.trim() && filteredDoctors.length > 0) {
                      @for (doctor of filteredDoctors; track doctor.id || doctor.name) {
                        <button
                          type="button"
                          (click)="selectDoctor(doctor)"
                          class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer text-gray-900"
                        >
                          {{ doctor.name }}
                        </button>
                      }
                    }
                    @if (doctorInput.trim() && filteredDoctors.length === 0) {
                      <button
                        type="button"
                        (click)="addNewDoctor()"
                        class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer text-[var(--primary-color)] font-medium"
                      >
                        {{ 'invoice.addNewDoctor' | translate }}: {{ doctorInput }}
                      </button>
                    }
                    @if (!doctorInput.trim()) {
                      @for (doctor of doctors; track doctor.id) {
                        <button
                          type="button"
                          (click)="selectDoctor(doctor)"
                          class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer text-gray-900"
                        >
                          {{ doctor.name }}
                        </button>
                      }
                    }
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Items Section -->
          <div class="border-t pt-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">{{ 'invoice.items' | translate }}</h3>
              <div class="flex gap-3">
                <div class="relative">
                  <input
                    type="text"
                    [placeholder]="'placeholder.scanBarcode' | translate"
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
                  {{ 'form.invoice.addDrug' | translate }}
                </app-button>
              </div>
            </div>

            @if (showDrugSelector) {
              <div class="mb-4 p-4 bg-gray-50 rounded-[var(--radius-md)]">
                <select
                  [(ngModel)]="selectedDrugId"
                  [ngModelOptions]="{standalone: true}"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm mb-2"
                >
                  <option value="">{{ 'form.selectDrug' | translate }}</option>
                  @for (drug of pharmacyDrugs; track drug.id) {
                    <option [value]="drug.id">{{ drug.generalDrug?.name || 'Drug ' + drug.id }} - {{ drug.price }}</option>
                  }
                </select>
                <app-button type="button" variant="primary" size="sm" (onClick)="addSelectedDrug()">{{ 'common.add' | translate }}</app-button>
              </div>
            }

            <div formArrayName="items" class="space-y-4">
              @for (item of itemsArray.controls; track $index; let i = $index) {
                <div [formGroupName]="i" class="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-[var(--radius-md)]">
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'drug.name' | translate }}</label>
                    <input
                      type="text"
                      [value]="getDrugName(item.get('drugId')?.value)"
                      readonly
                      class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm bg-gray-100"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'invoice.quantity' | translate }}</label>
                    <input
                      type="number"
                      formControlName="quantity"
                      min="1"
                      class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'form.invoice.unitPrice' | translate }}</label>
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
                <span class="text-gray-700">{{ 'invoice.subtotal' | translate }}:</span>
                <span class="font-medium">{{ formattedSubtotal }}</span>
              </div>
              <div class="flex justify-between pt-2 border-t">
                <span class="text-lg font-semibold text-gray-900">{{ 'invoice.total' | translate }}:</span>
                <span class="text-lg font-bold text-gray-900">{{ formattedTotal }}</span>
              </div>
            </div>
          </div>

          <!-- Payment Info -->
          <div class="border-t pt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ 'form.invoice.paymentInfo' | translate }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'invoice.paymentStatus' | translate }}</label>
                <select
                  formControlName="paymentStatus"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                >
                  <option value="pending">{{ 'invoice.status.pending' | translate }}</option>
                  <option value="partial">{{ 'invoice.status.partial' | translate }}</option>
                  <option value="paid">{{ 'invoice.status.paid' | translate }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'invoice.paymentMethod' | translate }}</label>
                <select
                  formControlName="paymentMethod"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                >
                  <option value="">{{ 'form.selectMethod' | translate }}</option>
                  <option value="cash">{{ 'form.invoice.cash' | translate }}</option>
                  <option value="card">{{ 'form.invoice.card' | translate }}</option>
                  <option value="bank_transfer">{{ 'form.invoice.bankTransfer' | translate }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex items-center justify-end gap-4 pt-6 border-t">
            <app-button type="button" variant="outline" (onClick)="onCancel()">
              {{ 'common.cancel' | translate }}
            </app-button>
            <app-button
              type="button"
              variant="outline"
              (onClick)="onCreateVoucher()"
              [disabled]="invoiceForm.invalid || itemsArray.length === 0"
            >
              {{ 'invoice.wizard.createVoucher' | translate }}
            </app-button>
            <app-button
              type="button"
              variant="primary"
              (onClick)="onCreateInvoice()"
              [loading]="loading"
              [disabled]="invoiceForm.invalid || itemsArray.length === 0"
            >
              {{ 'invoice.wizard.createInvoice' | translate }}
            </app-button>
          </div>
        </form>
      }

      <!-- Step 2: Voucher Creation -->
      @if (currentStep === 2) {
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'invoice.voucher.voucherName' | translate }}</label>
            <input
              type="text"
              [value]="voucherName"
              readonly
              class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm bg-gray-100"
            />
          </div>

          <!-- Grouped Products by Origin -->
          <div class="space-y-6">
            @for (group of voucherProductGroups; track group.origin) {
              <div class="border rounded-[var(--radius-md)] p-4">
                <h4 class="text-lg font-medium text-gray-900 mb-4">
                  {{ group.origin === 'local' ? ('drug.origin.local' | translate) : group.origin === 'imported' ? ('drug.origin.imported' | translate) : ('invoice.voucher.unknownOrigin' | translate) }}
                </h4>
                <div class="space-y-4">
                  @for (product of group.products; track product.drugId) {
                    <div class="grid grid-cols-1 md:grid-cols-5 gap-4 p-3 bg-gray-50 rounded-[var(--radius-md)]">
                      <div class="md:col-span-2">
                        <div class="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            [(ngModel)]="product.applyDiscount"
                            [ngModelOptions]="{standalone: true}"
                            (change)="calculateVoucherDiscount()"
                            class="w-4 h-4 text-[var(--primary-color)] focus:ring-[var(--primary-color)] border-gray-300 rounded"
                          />
                          <span class="text-sm font-medium text-gray-900">{{ product.drugName }}</span>
                        </div>
                        <div class="mt-1 text-sm text-gray-600">
                          {{ 'invoice.quantity' | translate }}: {{ product.quantity }} × {{ product.price | number:'1.2-2' }} = {{ (product.quantity * product.price) | number:'1.2-2' }}
                        </div>
                      </div>
                      <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'invoice.voucher.discountPercentage' | translate }}</label>
                        <input
                          type="number"
                          [(ngModel)]="product.discountPercentage"
                          [ngModelOptions]="{standalone: true}"
                          [disabled]="!product.applyDiscount"
                          (input)="calculateVoucherDiscount()"
                          min="0"
                          max="100"
                          step="0.01"
                          class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div class="flex items-end">
                        <div class="text-sm text-gray-600">
                          <div>{{ 'invoice.totalPrice' | translate }}:</div>
                          <div class="font-medium text-gray-900">{{ getDiscountedPrice(product) | number:'1.2-2' }}</div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Average Discount and Amount -->
          <div class="border-t pt-6">
            <div class="bg-blue-50 border border-blue-200 rounded-[var(--radius-md)] p-4 mb-4">
              <p class="text-sm text-blue-800 mb-2">
                <strong>{{ 'invoice.voucher.note' | translate }}:</strong> {{ 'invoice.voucher.averageDiscountNote' | translate }}
              </p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'invoice.subtotal' | translate }}</label>
                <input
                  type="text"
                  [value]="subtotal | number:'1.2-2'"
                  readonly
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm bg-gray-100"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'invoice.voucher.averageDiscount' | translate }}</label>
                <input
                  type="text"
                  [value]="averageDiscountPercentage.toFixed(2) + '%'"
                  readonly
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm bg-gray-100"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'invoice.voucher.discountAmount' | translate }}</label>
                <input
                  type="text"
                  [value]="voucherDiscountAmount | number:'1.2-2'"
                  readonly
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm bg-gray-100"
                />
              </div>
            </div>
            <div class="mt-4 pt-4 border-t">
              <div class="flex justify-between items-center">
                <label class="block text-lg font-semibold text-gray-900">{{ 'invoice.total' | translate }}</label>
                <span class="text-xl font-bold text-gray-900">{{ (subtotal - voucherDiscountAmount) | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex items-center justify-end gap-4 pt-6 border-t">
            <app-button type="button" variant="outline" (onClick)="goToStep(1)">
              {{ 'common.back' | translate }}
            </app-button>
            <app-button
              type="button"
              variant="primary"
              (onClick)="onCreateVoucherInvoice()"
              [loading]="loading"
            >
              {{ 'invoice.wizard.createInvoice' | translate }}
            </app-button>
          </div>
        </div>
      }

      <!-- Step 3: Send Voucher QR Code -->
      @if (currentStep === 3) {
        <div class="space-y-6">
          <div class="bg-gray-50 rounded-[var(--radius-md)] p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ 'invoice.voucher.patientInfo' | translate }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'patient.fullName' | translate }}</label>
                <div class="text-gray-900">{{ selectedPatient?.fullName }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'patient.phone' | translate }}</label>
                <div class="text-gray-900">{{ selectedPatient?.phone }}</div>
              </div>
            </div>
          </div>

          <div class="flex justify-center">
            <div class="bg-white p-6 rounded-[var(--radius-md)] border-2 border-gray-200">
              <canvas #qrCanvas class="w-64 h-64"></canvas>
            </div>
          </div>

          <div class="text-center">
            <p class="text-sm text-gray-600 mb-4">{{ 'invoice.voucher.qrCodeDescription' | translate }}</p>
            <app-button
              type="button"
              variant="primary"
              (onClick)="sendVoucherToPatient()"
              [loading]="sendingVoucher"
            >
              {{ 'invoice.voucher.sendToPatient' | translate }}
            </app-button>
          </div>

          <!-- Form Actions -->
          <div class="flex items-center justify-end gap-4 pt-6 border-t">
            <app-button type="button" variant="outline" (onClick)="goToStep(2)">
              {{ 'common.back' | translate }}
            </app-button>
            <app-button type="button" variant="outline" (onClick)="onCancel()">
              {{ 'common.close' | translate }}
            </app-button>
          </div>
        </div>
      }
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
  private invoiceCartService = inject(InvoiceCartService);
  private pharmacyContextService = inject(PharmacyContextService);

  @ViewChild('qrCanvas', { static: false }) qrCanvas!: ElementRef<HTMLCanvasElement>;

  invoiceForm!: FormGroup;
  loading = false;
  sendingVoucher = false;
  errorMessage = '';
  isEdit = false;
  invoiceId: string | null = null;
  currentStep = 1;
  patients: Patient[] = [];
  pharmacyDrugs: PharmacyDrug[] = [];
  selectedPatient: Patient | null = null;
  barcodeInput = '';
  showDrugSelector = false;
  selectedDrugId = '';

  // Doctor autocomplete
  doctorInput = '';
  showDoctorDropdown = false;
  doctors: Array<{id: string, name: string}> = [
    { id: 'DOC001', name: 'Dr. John Smith' },
    { id: 'DOC002', name: 'Dr. Jane Doe' },
    { id: 'DOC003', name: 'Dr. Michael Johnson' },
    { id: 'DOC004', name: 'Dr. Sarah Williams' }
  ];
  filteredDoctors: Array<{id?: string, name: string}> = [];
  selectedDoctor: {doctorName: string, doctorId?: string, isNewDoctor: boolean} | null = null;

  // Voucher data
  voucherName = '';
  voucherCode = '';
  voucherProductGroups: VoucherProductGroup[] = [];
  averageDiscountPercentage = 0;
  voucherDiscountAmount = 0;

  get itemsArray(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  get subtotal(): number {
    const items = this.itemsArray.value;
    return items.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.unitPrice || 0);
    }, 0);
  }

  get total(): number {
    return this.subtotal;
  }

  get formattedSubtotal(): string {
    return this.subtotal.toFixed(2);
  }

  get formattedTotal(): string {
    return this.total.toFixed(2);
  }

  ngOnInit(): void {
    this.invoiceId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.invoiceId;

    this.invoiceForm = this.fb.group({
      patientId: ['', [Validators.required]],
      items: this.fb.array([]),
      paymentStatus: ['pending'],
      paymentMethod: [''],
      doctor: [null]
    });

    this.loadPatients();
    this.loadDrugs();

    if (this.isEdit && this.invoiceId) {
      this.loadInvoice();
    }
  }

  getWizardTitle(): string {
    // Title is handled in template with translate pipe
    return '';
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
        if (!this.isEdit && this.itemsArray.length === 0) {
          this.loadDrugsFromCart();
        }
      }
    });
  }

  private loadInvoice(): void {
    this.invoicesService.getById(this.invoiceId!).subscribe({
      next: (invoice) => {
        if (invoice) {
          this.invoiceForm.patchValue({
            patientId: invoice.patientId,
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

  addItemWithDrug(drug: PharmacyDrug): void {
    const existingIndex = this.itemsArray.controls.findIndex(
      control => control.get('drugId')?.value === drug.id
    );

    if (existingIndex >= 0) {
      const existingControl = this.itemsArray.at(existingIndex);
      const currentQuantity = existingControl.get('quantity')?.value || 1;
      existingControl.patchValue({ quantity: currentQuantity + 1 });
      return;
    }

    const itemForm = this.fb.group({
      drugId: [drug.id, [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [drug.priceAfterDiscount || drug.price, [Validators.required]]
    });
    this.itemsArray.push(itemForm);
  }

  private loadDrugsFromCart(): void {
    if (this.isEdit) return;

    const cartDrugs = this.invoiceCartService.getDrugs();
    if (cartDrugs.length > 0) {
      cartDrugs.forEach(cartDrug => {
        const fullDrug = this.pharmacyDrugs.find(d => d.id === cartDrug.id) || cartDrug;
        this.addItemWithDrug(fullDrug);
      });
    }
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

  onCreateInvoice(): void {
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
        discount: 0,
        total: this.total,
        paymentStatus: formValue.paymentStatus,
        paymentMethod: formValue.paymentMethod || undefined,
        pharmacyId: this.pharmacyContextService.getCurrentPharmacy()?.id || 'ph1'
      };

      const operation = this.isEdit
        ? this.invoicesService.update(this.invoiceId!, invoiceData)
        : this.invoicesService.create(invoiceData);

      operation.subscribe({
        next: () => {
          this.invoiceCartService.clear();
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

  onCreateVoucher(): void {
    if (this.invoiceForm.valid && this.itemsArray.length > 0) {
      const patientId = this.invoiceForm.get('patientId')?.value;
      if (!patientId) {
        this.errorMessage = 'Please select a patient first';
        return;
      }

      this.selectedPatient = this.patients.find(p => p.id === patientId) || null;
      if (!this.selectedPatient) {
        this.errorMessage = 'Patient not found';
        return;
      }

      // Generate voucher name
      const pharmacy = this.pharmacyContextService.getCurrentPharmacy();
      const uniqueId = Date.now().toString(36).toUpperCase();
      this.voucherName = `${patientId}-${pharmacy?.name || 'Pharmacy'}-${uniqueId}`;
      this.voucherCode = uniqueId;

      // Group products by origin
      this.groupProductsByOrigin();

      // Move to step 2
      this.currentStep = 2;
    }
  }

  private groupProductsByOrigin(): void {
    const items = this.itemsArray.value;
    const groups: { [key: string]: VoucherProductGroup } = {};

    items.forEach((item: any) => {
      const drug = this.pharmacyDrugs.find(d => d.id === item.drugId);
      const origin = drug?.origin || 'unknown';

      if (!groups[origin]) {
        groups[origin] = {
          origin: origin as 'local' | 'imported' | 'unknown',
          products: []
        };
      }

      groups[origin].products.push({
        drugId: item.drugId,
        drugName: this.getDrugName(item.drugId),
        price: item.unitPrice,
        quantity: item.quantity,
        applyDiscount: false,
        discountPercentage: 0
      });
    });

    this.voucherProductGroups = Object.values(groups);
    this.calculateVoucherDiscount();
  }

  getDiscountedPrice(product: VoucherProductGroup['products'][0]): number {
    // Show original price - discount is applied to total, not individual items
    return product.quantity * product.price;
  }

  calculateVoucherDiscount(): void {
    let totalDiscountPercentages = 0;
    let discountCount = 0;
    const totalOrderAmount = this.subtotal;

    // Calculate average discount percentage from all selected discounts
    this.voucherProductGroups.forEach(group => {
      group.products.forEach(product => {
        if (product.applyDiscount && product.discountPercentage > 0) {
          totalDiscountPercentages += product.discountPercentage;
          discountCount++;
        }
      });
    });

    // Calculate average discount percentage
    if (discountCount > 0) {
      this.averageDiscountPercentage = totalDiscountPercentages / discountCount;
    } else {
      this.averageDiscountPercentage = 0;
    }

    // Apply average discount to total order amount
    this.voucherDiscountAmount = (totalOrderAmount * this.averageDiscountPercentage) / 100;
  }

  onCreateVoucherInvoice(): void {
    this.loading = true;
    this.errorMessage = '';

    const formValue = this.invoiceForm.value;
    // Keep original prices - discount is applied to total, not individual items
    const items = formValue.items.map((item: any) => ({
      drugId: item.drugId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice
    }));

    // Apply average discount to total order amount
    const totalDiscount = this.voucherDiscountAmount;
    const finalTotal = this.subtotal - totalDiscount;

    const invoiceData = {
      patientId: formValue.patientId,
      items: items,
      subtotal: this.subtotal,
      discount: totalDiscount,
      total: finalTotal,
      paymentStatus: formValue.paymentStatus,
      paymentMethod: formValue.paymentMethod || undefined,
      pharmacyId: this.pharmacyContextService.getCurrentPharmacy()?.id || 'ph1',
      voucherCode: this.voucherCode,
      voucherName: this.voucherName
    };

    this.invoicesService.create(invoiceData).subscribe({
      next: () => {
        this.loading = false;
        // Move to step 3 and generate QR code
        this.currentStep = 3;
        setTimeout(() => this.generateQRCode(), 200);
      },
      error: (error) => {
        this.errorMessage = error.message || 'An error occurred while saving';
        this.loading = false;
      }
    });
  }

  private generateQRCode(): void {
    if (!this.qrCanvas?.nativeElement) {
      setTimeout(() => this.generateQRCode(), 100);
      return;
    }

    const canvas = this.qrCanvas.nativeElement;
    const qrData = JSON.stringify({
      voucherCode: this.voucherCode,
      voucherName: this.voucherName,
      patientId: this.selectedPatient?.id,
      patientName: this.selectedPatient?.fullName,
      subtotal: this.subtotal,
      averageDiscountPercentage: this.averageDiscountPercentage,
      discountAmount: this.voucherDiscountAmount,
      total: this.subtotal - this.voucherDiscountAmount,
      createdAt: new Date().toISOString()
    });

    QRCode.toCanvas(canvas, qrData, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }, (error) => {
      if (error) {
        console.error('Error generating QR code:', error);
        this.errorMessage = 'Failed to generate QR code';
      }
    });
  }

  sendVoucherToPatient(): void {
    if (!this.selectedPatient || !this.qrCanvas) {
      this.errorMessage = 'Patient or QR code not available';
      return;
    }

    this.sendingVoucher = true;

    // Convert canvas to blob
    this.qrCanvas.nativeElement.toBlob((blob: Blob | null) => {
      if (!blob) {
        this.errorMessage = 'Failed to generate QR code image';
        this.sendingVoucher = false;
        return;
      }

      // Copy image to clipboard
      const item = new ClipboardItem({ 'image/png': blob });
      navigator.clipboard.write([item]).then(() => {
        // Open WhatsApp with patient phone number
        const phoneNumber = this.selectedPatient!.phone.replace(/[^0-9]/g, '');
        const whatsappUrl = `https://wa.me/${phoneNumber}`;
        window.open(whatsappUrl, '_blank');

        this.sendingVoucher = false;
        // Show success message
        setTimeout(() => {
          this.router.navigate(['/invoices']);
        }, 2000);
      }).catch((error) => {
        console.error('Failed to copy to clipboard:', error);
        // Fallback: download the image
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `voucher-${this.voucherCode}.png`;
        a.click();
        URL.revokeObjectURL(url);

        // Open WhatsApp
        const phoneNumber = this.selectedPatient!.phone.replace(/[^0-9]/g, '');
        const whatsappUrl = `https://wa.me/${phoneNumber}`;
        window.open(whatsappUrl, '_blank');

        this.sendingVoucher = false;
      });
    }, 'image/png');
  }

  goToStep(step: number): void {
    this.currentStep = step;
    if (step === 3) {
      setTimeout(() => this.generateQRCode(), 200);
    }
  }

  onCancel(): void {
    this.router.navigate(['/invoices']);
  }

  onDoctorInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.doctorInput = input.value;
    this.showDoctorDropdown = true;

    if (this.doctorInput.trim()) {
      const searchTerm = this.doctorInput.toLowerCase();
      this.filteredDoctors = this.doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm)
      );
    } else {
      this.filteredDoctors = [...this.doctors];
    }
  }

  selectDoctor(doctor: {id?: string, name: string}): void {
    this.doctorInput = doctor.name;
    this.selectedDoctor = {
      doctorName: doctor.name,
      doctorId: doctor.id,
      isNewDoctor: false
    };
    this.showDoctorDropdown = false;
    this.invoiceForm.patchValue({ doctor: this.selectedDoctor });
  }

  addNewDoctor(): void {
    const doctorName = this.doctorInput.trim();
    if (doctorName) {
      this.selectedDoctor = {
        doctorName: doctorName,
        isNewDoctor: true
      };
      this.showDoctorDropdown = false;
      this.invoiceForm.patchValue({ doctor: this.selectedDoctor });
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.doctor-dropdown-container')) {
      this.showDoctorDropdown = false;
    }
  }
}

