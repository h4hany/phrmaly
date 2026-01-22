import {Component, ElementRef, HostListener, inject, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {InvoicesService} from '../../../core/services/invoices.service';
import {PatientsService} from '../../../core/services/patients.service';
import {DrugsService} from '../../../core/services/drugs.service';
import {InvoiceCartService} from '../../../core/services/invoice-cart.service';
import {BarcodeScannerDirective} from '../../../shared/directives/barcode-scanner.directive';
import {AlertComponent} from '../../../shared/components/alert/alert.component';
import {TranslatePipe} from '../../../core/pipes/translate.pipe';
import {PharmacyContextService} from '../../../core/services/pharmacy-context.service';
import html2canvas from 'html2canvas';
import {PharmacyDrug} from '../../../core/models/drug.model';
import {Patient} from '../../../core/models/patient.model';
import {Voucher} from '../../../core/models/voucher.model';
import {Pharmacy} from '../../../core/models/user.model';
import {InvoiceStepComponent} from './invoice-step.component';
import {VoucherStepComponent} from './voucher-step.component';
import {ShareVoucherStepComponent} from './share-voucher-step.component';

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
    AlertComponent,
    BarcodeScannerDirective,
    TranslatePipe,
    InvoiceStepComponent,
    VoucherStepComponent,
    ShareVoucherStepComponent
  ],
  template: `
    <div class="min-h-screen" [style.background]="'var(--page-bg)'">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8 animate-fade-in">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            {{ currentStep === 1 ? (isEdit ? ('form.editInvoice' | translate) : ('invoice.wizard.step1Title' | translate)) : currentStep === 2 ? ('invoice.wizard.step2Title' | translate) : ('invoice.wizard.step3Title' | translate) }}
          </h1>
          <p class="text-gray-600">
            {{ currentStep === 1 ? ('invoice.wizard.step1Description' | translate) : currentStep === 2 ? ('invoice.wizard.step2Description' | translate) : ('invoice.wizard.step3Description' | translate) }}
          </p>
        </div>

        @if (errorMessage) {
          <div class="mb-6 animate-slide-down">
            <app-alert type="error" [title]="errorMessage" />
          </div>
        }

        <!-- Enhanced Wizard Steps Indicator -->
        <div class="mb-12 animate-fade-in-up" style="animation-delay: 0.1s">
          <div class="relative">
            <!-- Progress Bar Background -->
            <div class="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full"></div>
            <!-- Active Progress Bar -->
            <div
              class="absolute top-5 left-0 h-1 rounded-full transition-all duration-700 ease-out"
              [style.width]="currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%'"
              [style.background]="'var(--sidebar-bg)'"
            ></div>

            <div class="relative flex justify-between">
              <!-- Step 1 -->
              <div class="flex flex-col items-center group cursor-pointer" (click)="currentStep > 1 && goToStep(1)">
                <div
                  class="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border-2"
                  [class.bg-white]="currentStep < 1"
                  [class.border-gray-300]="currentStep < 1"
                  [class.scale-110]="currentStep === 1"
                  [style.background]="currentStep >= 1 ? 'var(--sidebar-bg)' : 'white'"
                  [style.border-color]="currentStep >= 1 ? 'var(--sidebar-bg)' : '#d1d5db'"
                >
                  @if (currentStep > 1) {
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  } @else {
                    <span class="text-lg font-bold" [class.text-white]="currentStep >= 1" [class.text-gray-500]="currentStep < 1">1</span>
                  }
                </div>
                <div class="mt-3 text-center">
                  <p class="text-sm font-semibold transition-colors" [class.text-gray-900]="currentStep > 1" [class.text-gray-500]="currentStep < 1" [style.color]="currentStep === 1 ? 'var(--sidebar-active-text)' : ''">
                    {{ 'invoice.wizard.step1' | translate }}
                  </p>
                  <p class="text-xs text-gray-500 mt-1 max-w-[120px]">{{ 'invoice.wizard.step1Subtitle' | translate }}</p>
                </div>
              </div>

              <!-- Step 2 -->
              <div class="flex flex-col items-center group cursor-pointer" (click)="currentStep > 2 && goToStep(2)">
                <div
                  class="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border-2"
                  [class.bg-white]="currentStep < 2"
                  [class.border-gray-300]="currentStep < 2"
                  [class.scale-110]="currentStep === 2"
                  [style.background]="currentStep >= 2 ? 'var(--sidebar-bg)' : 'white'"
                  [style.border-color]="currentStep >= 2 ? 'var(--sidebar-bg)' : '#d1d5db'"
                >
                  @if (currentStep > 2) {
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  } @else {
                    <span class="text-lg font-bold" [class.text-white]="currentStep >= 2" [class.text-gray-500]="currentStep < 2">2</span>
                  }
                </div>
                <div class="mt-3 text-center">
                  <p class="text-sm font-semibold transition-colors" [class.text-gray-900]="currentStep > 2" [class.text-gray-500]="currentStep < 2" [style.color]="currentStep === 2 ? 'var(--sidebar-active-text)' : ''">
                    {{ 'invoice.wizard.step2' | translate }}
                  </p>
                  <p class="text-xs text-gray-500 mt-1 max-w-[120px]">{{ 'invoice.wizard.step2Subtitle' | translate }}</p>
                </div>
              </div>

              <!-- Step 3 -->
              <div class="flex flex-col items-center group">
                <div
                  class="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border-2"
                  [class.bg-white]="currentStep < 3"
                  [class.border-gray-300]="currentStep < 3"
                  [class.scale-110]="currentStep === 3"
                  [style.background]="currentStep >= 3 ? 'var(--sidebar-bg)' : 'white'"
                  [style.border-color]="currentStep >= 3 ? 'var(--sidebar-bg)' : '#d1d5db'"
                >
                  <span class="text-lg font-bold" [class.text-white]="currentStep >= 3" [class.text-gray-500]="currentStep < 3">3</span>
                </div>
                <div class="mt-3 text-center">
                  <p class="text-sm font-semibold transition-colors" [class.text-gray-500]="currentStep < 3" [style.color]="currentStep === 3 ? 'var(--sidebar-active-text)' : ''">
                    {{ 'invoice.wizard.step3' | translate }}
                  </p>
                  <p class="text-xs text-gray-500 mt-1 max-w-[120px]">{{ 'invoice.wizard.step3Subtitle' | translate }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Card -->
        <div class="rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up" style="animation-delay: 0.2s; background: var(--card-bg);">

          <!-- Step 1: Invoice Creation -->
          @if (currentStep === 1) {
            <app-invoice-step
              [invoiceForm]="invoiceForm"
              [itemsArray]="itemsArray"
              [patients]="patients"
              [pharmacyDrugs]="pharmacyDrugs"
              [doctors]="doctors"
              [filteredDoctors]="filteredDoctors"
              [filteredPatients]="filteredPatients"
              [filteredDrugs]="filteredDrugs"
              [patientInput]="patientInput"
              [doctorInput]="doctorInput"
              [drugInput]="drugInput"
              [barcodeInput]="barcodeInput"
              [showPatientDropdown]="showPatientDropdown"
              [showDoctorDropdown]="showDoctorDropdown"
              [showDrugDropdown]="showDrugDropdown"
              [showDrugSelector]="showDrugSelector"
              [loading]="loading"
              [formattedSubtotal]="formattedSubtotal"
              [formattedTotal]="formattedTotal"
              [getDrugName]="getDrugName.bind(this)"
              (onPatientInput)="onPatientInput($event)"
              (onPatientFocus)="showPatientDropdown = true"
              (onPatientSelect)="selectPatient($event)"
              (onDoctorInput)="onDoctorInput($event)"
              (onDoctorFocus)="showDoctorDropdown = true"
              (onDoctorSelect)="selectDoctor($event)"
              (onAddNewDoctor)="addNewDoctor()"
              (onDrugInput)="onDrugInput($event)"
              (onDrugFocus)="showDrugDropdown = true"
              (onDrugSelect)="selectDrug($event)"
              (onToggleDrugSelector)="showDrugSelector = !showDrugSelector"
              (onAddSelectedDrug)="addSelectedDrug()"
              (onBarcodeEnter)="addItemByBarcode()"
              (onBarcodeScanned)="onBarcodeScanned($event)"
              (onRemoveItem)="removeItem($event)"
              (onCreateVoucher)="onCreateVoucher()"
              (onCreateInvoice)="onCreateInvoice()"
              (onCancel)="onCancel()"
            ></app-invoice-step>
          }



          <!-- Step 2: Voucher Creation -->
          @if (currentStep === 2) {
            <app-voucher-step
              [voucher]="voucher!"
              [voucherProductGroups]="voucherProductGroups"
              [subtotal]="subtotal"
              [averageDiscountPercentage]="averageDiscountPercentage"
              [voucherDiscountAmount]="voucherDiscountAmount"
              [loading]="loading"
              [getDiscountedPrice]="getDiscountedPrice.bind(this)"
              (onCalculateDiscount)="calculateVoucherDiscount()"
              (onBack)="goToStep(1)"
              (onCreateVoucherInvoice)="onCreateVoucherInvoice()"
            ></app-voucher-step>
          }



          <!-- Step 3: Send Voucher QR Code -->
          @if (currentStep === 3) {
            <app-share-voucher-step
              [voucher]="voucher!"
              [averageDiscountPercentage]="averageDiscountPercentage"
              [sendingVoucher]="sendingVoucher"
              (onSendVoucher)="sendVoucherToPatient()"
              (onBack)="goToStep(2)"
              (onClose)="onCancel()"
              (onCardReady)="onCardReadyHandler($event)"
              (onCardCopied)="onCardCopied($event)"
            ></app-share-voucher-step>
          }


        </div>
      </div>
    </div>

    <style>
      @keyframes fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes fade-in-up {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes slide-down {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes slide-in-left {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .animate-fade-in {
        animation: fade-in 0.5s ease-out;
      }

      .animate-fade-in-up {
        animation: fade-in-up 0.6s ease-out;
      }

      .animate-slide-down {
        animation: slide-down 0.3s ease-out;
      }

      .animate-slide-in-left {
        animation: slide-in-left 0.4s ease-out;
      }

      /* Custom scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      ::-webkit-scrollbar-track {
        background: var(--scrollbar-bg);
        border-radius: 4px;
      }

      ::-webkit-scrollbar-thumb {
        background: var(--scrollbar-thumb);
        border-radius: 4px;
      }

      ::-webkit-scrollbar-thumb:hover {
        opacity: 0.8;
      }
    </style>
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

  cardElementRef!: ElementRef<HTMLDivElement>;

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

  // Drug autocomplete
  drugInput = '';
  showDrugDropdown = false;
  filteredDrugs: PharmacyDrug[] = [];

  // Patient autocomplete
  patientInput = '';
  showPatientDropdown = false;
  filteredPatients: Patient[] = [];

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
  voucher: Voucher | null = null;
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

          // Set patient input when loading existing invoice
          if (invoice.patientId) {
            const patient = this.patients.find(p => p.id === invoice.patientId);
            if (patient) {
              this.patientInput = patient.fullName;
              this.selectedPatient = patient;
            }
          }

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

  onDrugInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.drugInput = input.value;
    this.showDrugDropdown = true;

    if (this.drugInput.trim()) {
      const searchTerm = this.drugInput.toLowerCase();
      this.filteredDrugs = this.pharmacyDrugs.filter(drug => {
        const drugName = drug.generalDrug?.name || 'Drug ' + drug.id;
        return drugName.toLowerCase().includes(searchTerm);
      });
    } else {
      this.filteredDrugs = [...this.pharmacyDrugs];
    }
  }

  selectDrug(drug: PharmacyDrug): void {
    this.drugInput = drug.generalDrug?.name || 'Drug ' + drug.id;
    this.selectedDrugId = drug.id;
    this.showDrugDropdown = false;
  }

  addSelectedDrug(): void {
    if (!this.selectedDrugId) {
      // If no drug selected but drugInput has value, try to find and select it
      if (this.drugInput.trim()) {
        const drug = this.pharmacyDrugs.find(d => {
          const drugName = d.generalDrug?.name || 'Drug ' + d.id;
          return drugName.toLowerCase() === this.drugInput.toLowerCase();
        });
        if (drug) {
          this.selectedDrugId = drug.id;
        } else {
          return;
        }
      } else {
        return;
      }
    }

    const drug = this.pharmacyDrugs.find(d => d.id === this.selectedDrugId);
    if (drug) {
      this.addItemWithDrug(drug);
      this.selectedDrugId = '';
      this.drugInput = '';
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

      const pharmacy = this.pharmacyContextService.getCurrentPharmacy();
      if (!pharmacy) {
        this.errorMessage = 'Pharmacy not found';
        return;
      }

      const uniqueId = Date.now().toString(36).toUpperCase();
      const voucherName = `${patientId}-${pharmacy.name}-${uniqueId}`;
      const createdAt = new Date();
      const validUntil = new Date();
      validUntil.setMonth(validUntil.getMonth() + 3); // Valid for 3 months

      // Create voucher object
      this.voucher = {
        voucherName: voucherName,
        voucherCode: uniqueId,
        createdAt: createdAt,
        validUntil: validUntil,
        amount: this.subtotal, // Will be updated after discount calculation
        patient: this.selectedPatient,
        pharmacy: pharmacy
      };

      this.groupProductsByOrigin(); // This already calls calculateVoucherDiscount()
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
    return product.quantity * product.price;
  }

  calculateVoucherDiscount(): void {
    let totalDiscountPercentages = 0;
    let discountCount = 0;
    const totalOrderAmount = this.subtotal;

    this.voucherProductGroups.forEach(group => {
      group.products.forEach(product => {
        if (product.applyDiscount && product.discountPercentage > 0) {
          totalDiscountPercentages += product.discountPercentage;
          discountCount++;
        }
      });
    });

    if (discountCount > 0) {
      this.averageDiscountPercentage = totalDiscountPercentages / discountCount;
    } else {
      this.averageDiscountPercentage = 0;
    }

    this.voucherDiscountAmount = (totalOrderAmount * this.averageDiscountPercentage) / 100;

    // Update voucher amount
    if (this.voucher) {
      this.voucher.amount = this.subtotal - this.voucherDiscountAmount;
    }
  }

  onCreateVoucherInvoice(): void {
    this.loading = true;
    this.errorMessage = '';

    const formValue = this.invoiceForm.value;
    const items = formValue.items.map((item: any) => ({
      drugId: item.drugId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice
    }));

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
      voucherCode: this.voucher?.voucherCode || '',
      voucherName: this.voucher?.voucherName || ''
    };

    this.invoicesService.create(invoiceData).subscribe({
      next: () => {
        this.loading = false;
        this.currentStep = 3;
      },
      error: (error) => {
        this.errorMessage = error.message || 'An error occurred while saving';
        this.loading = false;
      }
    });
  }


  sendVoucherToPatient(): void {
    if (!this.voucher || !this.cardElementRef) {
      this.errorMessage = 'Voucher or card not available';
      return;
    }

    this.sendingVoucher = true;

    // Use html2canvas to capture the entire card
    const cardElement = this.cardElementRef.nativeElement;


    html2canvas(cardElement, {
      // @ts-ignore
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: false
    }).then((canvas: HTMLCanvasElement) => {
      canvas.toBlob((blob: Blob | null) => {
        this.sendingVoucher = false;
        if (!blob) {
          this.errorMessage = 'Failed to generate card image';
          return;
        }

        const item = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([item]).then(() => {
          const phoneNumber = this.voucher!.patient.phone.replace(/[^0-9]/g, '');
          const whatsappUrl = `https://wa.me/${phoneNumber}`;
          window.open(whatsappUrl, '_blank');

          setTimeout(() => {
            this.router.navigate(['/invoices']);
          }, 2000);
        }).catch((error) => {
          console.error('Failed to copy to clipboard:', error);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `voucher-${this.voucher!.voucherCode}.png`;
          a.click();
          URL.revokeObjectURL(url);

          const phoneNumber = this.voucher!.patient.phone.replace(/[^0-9]/g, '');
          const whatsappUrl = `https://wa.me/${phoneNumber}`;
          window.open(whatsappUrl, '_blank');
        });
      }, 'image/png');
    }).catch((error) => {
      console.error('Failed to capture card:', error);
      this.errorMessage = 'Failed to capture card image';
      this.sendingVoucher = false;
    });
  }

  onCardReadyHandler(elementRef: ElementRef<HTMLDivElement>): void {
    this.cardElementRef = elementRef;
  }

  onCardCopied(blob: Blob): void {
    // Card was copied, can show a notification or handle it
    console.log('Card copied to clipboard');
  }

  goToStep(step: number): void {
    this.currentStep = step;
  }

  onCancel(): void {
    this.router.navigate(['/invoices']);
  }

  onPatientInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.patientInput = input.value;
    this.showPatientDropdown = true;

    if (this.patientInput.trim()) {
      const searchTerm = this.patientInput.toLowerCase();
      this.filteredPatients = this.patients.filter(patient =>
        patient.fullName.toLowerCase().includes(searchTerm)
      );
    } else {
      this.filteredPatients = [...this.patients];
    }
  }

  selectPatient(patient: Patient): void {
    this.patientInput = patient.fullName;
    this.selectedPatient = patient;
    this.invoiceForm.patchValue({ patientId: patient.id });
    this.showPatientDropdown = false;
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
    if (!target.closest('.patient-dropdown-container')) {
      this.showPatientDropdown = false;
    }
    if (!target.closest('.drug-dropdown-container')) {
      this.showDrugDropdown = false;
    }
  }
}
