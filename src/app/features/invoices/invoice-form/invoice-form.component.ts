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

          @if (false) {
            <form [formGroup]="invoiceForm" class="p-8">
              <!-- Patient & Doctor Section -->
              <div class="mb-10">
                <div class="flex items-center mb-6">
                  <div class="w-1 h-8 rounded-full mr-3" [style.background]="'var(--sidebar-bg)'"></div>
                  <h3 class="text-xl font-bold text-gray-900">{{ 'invoice.wizard.patientDoctorInfo' | translate }}</h3>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Patient Selection -->
                  <div class="group">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                      {{ 'invoice.patient' | translate }}
                      <span class="text-red-500 ml-1">*</span>
                    </label>
                    <div class="relative patient-dropdown-container">
                      <input
                        type="text"
                        [(ngModel)]="patientInput"
                        [ngModelOptions]="{standalone: true}"
                        (input)="onPatientInput($event)"
                        (focus)="showPatientDropdown = true"
                        [placeholder]="'form.selectPatient' | translate"
                        class="w-full px-4 py-3.5 pl-12 border-2 border-gray-200 rounded-xl text-sm bg-white focus:outline-none transition-all duration-200 hover:border-gray-300"
                        onfocus="this.style.borderColor='var(--sidebar-bg)'; this.style.boxShadow='0 0 0 4px rgba(0, 48, 50, 0.1)';"
                        onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none';"
                      />
                      <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>

                      @if (showPatientDropdown) {
                        <div class="absolute z-20 mt-2 w-full bg-white shadow-2xl max-h-64 rounded-xl border border-gray-100 overflow-hidden animate-slide-down">
                          <div class="py-2 max-h-64 overflow-auto">
                            @if (patientInput.trim() && filteredPatients.length > 0) {
                              @for (patient of filteredPatients; track patient.id) {
                                <button
                                  type="button"
                                  (click)="selectPatient(patient)"
                                  class="block w-full text-left px-4 py-3 text-sm transition-colors cursor-pointer border-l-4 border-transparent"
                                  style="color: rgb(55 65 81);"
                                  onmouseenter="this.style.backgroundColor='rgba(0, 48, 50, 0.1)'; this.style.borderLeftColor='var(--sidebar-bg)';"
                                  onmouseleave="this.style.backgroundColor=''; this.style.borderLeftColor='transparent';"
                                >
                                  <div class="flex items-center">
                                    <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {{ patient.fullName }}
                                  </div>
                                </button>
                              }
                            }
                            @if (patientInput.trim() && filteredPatients.length === 0) {
                              <div class="px-4 py-3 text-sm text-gray-500">
                                {{ 'common.noData' | translate }}
                              </div>
                            }
                            @if (!patientInput.trim()) {
                              @for (patient of patients; track patient.id) {
                                <button
                                  type="button"
                                  (click)="selectPatient(patient)"
                                  class="block w-full text-left px-4 py-3 text-sm transition-colors cursor-pointer border-l-4 border-transparent"
                                  style="color: rgb(55 65 81);"
                                  onmouseenter="this.style.backgroundColor='rgba(0, 48, 50, 0.1)'; this.style.borderLeftColor='var(--sidebar-bg)';"
                                  onmouseleave="this.style.backgroundColor=''; this.style.borderLeftColor='transparent';"
                                >
                                  <div class="flex items-center">
                                    <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {{ patient.fullName }}
                                  </div>
                                </button>
                              }
                            }
                          </div>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Doctor Autocomplete -->
                  <div class="group">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">{{ 'invoice.doctor' | translate }}</label>
                    <div class="relative doctor-dropdown-container">
                      <input
                        type="text"
                        [(ngModel)]="doctorInput"
                        [ngModelOptions]="{standalone: true}"
                        (input)="onDoctorInput($event)"
                        (focus)="showDoctorDropdown = true"
                        [placeholder]="'form.selectOrType' | translate"
                        class="w-full px-4 py-3.5 pl-12 border-2 border-gray-200 rounded-xl text-sm bg-white focus:outline-none transition-all duration-200 hover:border-gray-300"
                        onfocus="this.style.borderColor='var(--sidebar-bg)'; this.style.boxShadow='0 0 0 4px rgba(0, 48, 50, 0.1)';"
                        onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none';"
                      />
                      <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>

                      @if (showDoctorDropdown) {
                        <div class="absolute z-20 mt-2 w-full bg-white shadow-2xl max-h-64 rounded-xl border border-gray-100 overflow-hidden animate-slide-down">
                          <div class="py-2 max-h-64 overflow-auto">
                            @if (doctorInput.trim() && filteredDoctors.length > 0) {
                              @for (doctor of filteredDoctors; track doctor.id || doctor.name) {
                                <button
                                  type="button"
                                  (click)="selectDoctor(doctor)"
                                  class="block w-full text-left px-4 py-3 text-sm transition-colors cursor-pointer text-gray-900 border-l-4 border-transparent"
                                  onmouseenter="this.style.backgroundColor='rgba(0, 48, 50, 0.1)'; this.style.borderLeftColor='var(--sidebar-bg)'; this.style.color='rgb(55 65 81)';"
                                  onmouseleave="this.style.backgroundColor=''; this.style.borderLeftColor='transparent'; this.style.color='rgb(55 65 81)';"
                                  style="color: rgb(55 65 81);"
                                >
                                  <div class="flex items-center">
                                    <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {{ doctor.name }}
                                  </div>
                                </button>
                              }
                            }
                            @if (doctorInput.trim() && filteredDoctors.length === 0) {
                              <button
                                type="button"
                                (click)="addNewDoctor()"
                                class="block w-full text-left px-4 py-3 text-sm hover:bg-green-50 transition-colors cursor-pointer text-green-600 font-semibold border-l-4 border-transparent hover:border-green-500"
                              >
                                <div class="flex items-center">
                                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                  </svg>
                                  {{ 'invoice.addNewDoctor' | translate }}: {{ doctorInput }}
                                </div>
                              </button>
                            }
                            @if (!doctorInput.trim()) {
                              @for (doctor of doctors; track doctor.id) {
                                <button
                                  type="button"
                                  (click)="selectDoctor(doctor)"
                                  class="block w-full text-left px-4 py-3 text-sm transition-colors cursor-pointer text-gray-900 border-l-4 border-transparent"
                                  onmouseenter="this.style.backgroundColor='rgba(0, 48, 50, 0.1)'; this.style.borderLeftColor='var(--sidebar-bg)'; this.style.color='rgb(55 65 81)';"
                                  onmouseleave="this.style.backgroundColor=''; this.style.borderLeftColor='transparent'; this.style.color='rgb(55 65 81)';"
                                  style="color: rgb(55 65 81);"
                                >
                                  <div class="flex items-center">
                                    <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {{ doctor.name }}
                                  </div>
                                </button>
                              }
                            }
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>

              <!-- Items Section -->
              <div class="mb-10">
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center">
                    <div class="w-1 h-8 rounded-full mr-3" [style.background]="'var(--sidebar-bg)'"></div>
                    <h3 class="text-xl font-bold text-gray-900">{{ 'invoice.items' | translate }}</h3>
                  </div>
                  <div class="flex gap-3">
                    <!-- Barcode Scanner -->
                    <div class="relative group">
                      <input
                        type="text"
                        [placeholder]="'placeholder.scanBarcode' | translate"
                        [(ngModel)]="barcodeInput"
                        [ngModelOptions]="{standalone: true}"
                        (keyup.enter)="addItemByBarcode()"
                        appBarcodeScanner
                        (barcodeScanned)="onBarcodeScanned($event)"
                        class="w-64 pl-11 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm bg-white focus:outline-none transition-all duration-200 hover:border-gray-300"
                        onfocus="this.style.borderColor='var(--sidebar-bg)'; this.style.boxShadow='0 0 0 4px rgba(0, 48, 50, 0.1)';"
                        onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none';"
                      />
                      <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                      </div>
                    </div>

                    <button
                      type="button"
                      (click)="showDrugSelector = !showDrugSelector"
                      class="px-5 py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
                      [style.background]="'var(--sidebar-active-bg)'"
                      [style.color]="'var(--sidebar-active-text)'"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                      {{ 'form.invoice.addDrug' | translate }}
                    </button>
                  </div>
                </div>

                @if (showDrugSelector) {
                  <div class="mb-6 p-6 rounded-xl border-2 animate-slide-down" style="background: rgba(0, 48, 50, 0.1); border-color: rgba(0, 48, 50, 0.3); color: rgb(55 65 81);">
                    <div class="flex gap-3">
                      <div class="relative flex-1 drug-dropdown-container">
                        <input
                          type="text"
                          [(ngModel)]="drugInput"
                          [ngModelOptions]="{standalone: true}"
                          (input)="onDrugInput($event)"
                          (focus)="showDrugDropdown = true"
                          [placeholder]="'form.selectDrug' | translate"
                          class="w-full px-4 py-3 pl-12 border-2 rounded-xl text-sm bg-white focus:outline-none transition-all"
                          style="border-color: rgba(0, 48, 50, 0.4);"
                          onfocus="this.style.borderColor='var(--sidebar-bg)'; this.style.boxShadow='0 0 0 4px rgba(0, 48, 50, 0.1)';"
                          onblur="this.style.borderColor='rgba(0, 48, 50, 0.4)'; this.style.boxShadow='none';"
                        />
                        <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                        </div>

                        @if (showDrugDropdown) {
                          <div class="absolute z-20 mt-2 w-full bg-white shadow-2xl max-h-64 rounded-xl border border-gray-100 overflow-hidden animate-slide-down">
                            <div class="py-2 max-h-64 overflow-auto">
                              @if (drugInput.trim() && filteredDrugs.length > 0) {
                                @for (drug of filteredDrugs; track drug.id) {
                                  <button
                                    type="button"
                                    (click)="selectDrug(drug)"
                                    class="block w-full text-left px-4 py-3 text-sm transition-colors cursor-pointer border-l-4 border-transparent"
                                    style="color: rgb(55 65 81);"
                                    onmouseenter="this.style.backgroundColor='rgba(0, 48, 50, 0.1)'; this.style.borderLeftColor='var(--sidebar-bg)'; this.style.color='rgb(55 65 81)';"
                                    onmouseleave="this.style.backgroundColor=''; this.style.borderLeftColor='transparent'; this.style.color='rgb(55 65 81)';"
                                  >
                                    <div class="flex items-center justify-between">
                                      <div class="flex items-center">
                                        <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                        </svg>
                                        <span>{{ drug.generalDrug?.name || 'Drug ' + drug.id }}</span>
                                      </div>
                                      <span class="text-xs text-gray-500 ml-2">{{ drug.price }} EGP</span>
                                    </div>
                                  </button>
                                }
                              }
                              @if (drugInput.trim() && filteredDrugs.length === 0) {
                                <div class="px-4 py-3 text-sm text-gray-500">
                                  {{ 'common.noData' | translate }}
                                </div>
                              }
                              @if (!drugInput.trim()) {
                                @for (drug of pharmacyDrugs; track drug.id) {
                                  <button
                                    type="button"
                                    (click)="selectDrug(drug)"
                                    class="block w-full text-left px-4 py-3 text-sm transition-colors cursor-pointer border-l-4 border-transparent"
                                    style="color: rgb(55 65 81);"
                                    onmouseenter="this.style.backgroundColor='rgba(0, 48, 50, 0.1)'; this.style.borderLeftColor='var(--sidebar-bg)'; this.style.color='rgb(55 65 81)';"
                                    onmouseleave="this.style.backgroundColor=''; this.style.borderLeftColor='transparent'; this.style.color='rgb(55 65 81)';"
                                  >
                                    <div class="flex items-center justify-between">
                                      <div class="flex items-center">
                                        <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                        </svg>
                                        <span>{{ drug.generalDrug?.name || 'Drug ' + drug.id }}</span>
                                      </div>
                                      <span class="text-xs text-gray-500 ml-2">{{ drug.price }} EGP</span>
                                    </div>
                                  </button>
                                }
                              }
                            </div>
                          </div>
                        }
                      </div>
                      <button
                        type="button"
                        (click)="addSelectedDrug()"
                        class="px-6 py-3 rounded-xl font-semibold text-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                        [style.background]="'var(--sidebar-active-bg)'"
                        [style.color]="'var(--sidebar-active-text)'"
                      >
                        {{ 'common.add' | translate }}
                      </button>
                    </div>
                  </div>
                }

                <div formArrayName="items" class="space-y-4">
                  @if (itemsArray.length === 0) {
                    <div class="text-center py-16 px-4">
                      <div class="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <h4 class="text-lg font-semibold text-gray-900 mb-2">{{ 'invoice.wizard.noItemsYet' | translate }}</h4>
                      <p class="text-gray-600 mb-6">{{ 'invoice.wizard.addDrugsHint' | translate }}</p>
                    </div>
                  }

                  @for (item of itemsArray.controls; track $index; let i = $index) {
                    <div [formGroupName]="i" class="group relative grid grid-cols-1 md:grid-cols-5 gap-4 p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-100 hover:shadow-md transition-all duration-200 animate-slide-in-left" [style.animation-delay]="(i * 0.05) + 's'" onmouseenter="this.style.borderColor='rgba(0, 48, 50, 0.5)';" onmouseleave="this.style.borderColor='#f3f4f6';">
                      <!-- Drug Name -->
                      <div class="md:col-span-2">
                        <label class="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">{{ 'drug.name' | translate }}</label>
                        <div class="flex items-center">
                          <div class="w-10 h-10 rounded-lg flex items-center justify-center mr-3" [style.background]="'rgba(0, 48, 50, 0.2)'">
                            <svg class="w-5 h-5" [style.color]="'var(--sidebar-active-text)'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            [value]="getDrugName(item.get('drugId')?.value)"
                            readonly
                            class="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 font-medium"
                          />
                        </div>
                      </div>

                      <!-- Quantity -->
                      <div>
                        <label class="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">{{ 'invoice.quantity' | translate }}</label>
                        <input
                          type="number"
                          formControlName="quantity"
                          min="1"
                          class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm bg-white focus:outline-none transition-all text-center font-semibold text-gray-900"
                          onfocus="this.style.borderColor='var(--sidebar-bg)'; this.style.boxShadow='0 0 0 4px rgba(0, 48, 50, 0.1)';"
                          onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none';"
                        />
                      </div>

                      <!-- Unit Price -->
                      <div>
                        <label class="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">{{ 'form.invoice.unitPrice' | translate }}</label>
                        <div class="relative">
                          <input
                            type="number"
                            formControlName="unitPrice"
                            step="0.01"
                            readonly
                            class="w-full px-4 py-3 pr-8 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 font-semibold"
                          />
                          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">EGP</span>
                        </div>
                      </div>

                      <!-- Remove Button -->
                      <div class="flex items-end justify-end md:justify-start">
                        <button
                          type="button"
                          (click)="removeItem(i)"
                          class="group/btn p-3 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                          title="Remove item"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <!-- Animated item indicator -->
                      <div class="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-0 rounded-full group-hover:h-3/4 transition-all duration-300" [style.background]="'var(--sidebar-bg)'"></div>
                    </div>
                  }
                </div>

                <!-- Summary Card -->
                @if (itemsArray.length > 0) {
                  <div class="mt-6 p-6 rounded-xl border-2" style="background: rgba(0, 48, 50, 0.1); border-color: rgba(0, 48, 50, 0.3); color: rgb(55 65 81);">
                    <div class="space-y-3">
                      <div class="flex justify-between items-center pb-3" style="border-bottom: 1px solid rgba(0, 48, 50, 0.3);">
                        <span class="text-sm font-semibold text-gray-700">{{ 'invoice.subtotal' | translate }}</span>
                        <span class="text-lg font-bold text-gray-900">{{ formattedSubtotal }} <span class="text-sm font-normal text-gray-600">EGP</span></span>
                      </div>
                      <div class="flex justify-between items-center pt-2">
                        <span class="text-lg font-bold text-gray-900">{{ 'invoice.total' | translate }}</span>
                        <span class="text-2xl font-bold" [style.color]="'var(--sidebar-active-text)'">
                          {{ formattedTotal }} <span class="text-base font-semibold text-gray-600">EGP</span>
                        </span>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <!-- Payment Info -->
              <div class="mb-8">
                <div class="flex items-center mb-6">
                  <div class="w-1 h-8 rounded-full mr-3" [style.background]="'var(--sidebar-bg)'"></div>
                  <h3 class="text-xl font-bold text-gray-900">{{ 'form.invoice.paymentInfo' | translate }}</h3>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Payment Status -->
                  <div class="group">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">{{ 'invoice.paymentStatus' | translate }}</label>
                    <div class="relative">
                      <select
                        formControlName="paymentStatus"
                        class="w-full px-4 py-3.5 pl-12 border-2 border-gray-200 rounded-xl text-sm bg-white focus:outline-none transition-all appearance-none cursor-pointer hover:border-gray-300"
                        onfocus="this.style.borderColor='var(--sidebar-bg)'; this.style.boxShadow='0 0 0 4px rgba(0, 48, 50, 0.1)';"
                        onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none';"
                      >
                        <option value="pending">{{ 'invoice.status.pending' | translate }}</option>
                        <option value="partial">{{ 'invoice.status.partial' | translate }}</option>
                        <option value="paid">{{ 'invoice.status.paid' | translate }}</option>
                      </select>
                      <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <!-- Payment Method -->
                  <div class="group">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">{{ 'invoice.paymentMethod' | translate }}</label>
                    <div class="relative">
                      <select
                        formControlName="paymentMethod"
                        class="w-full px-4 py-3.5 pl-12 border-2 border-gray-200 rounded-xl text-sm bg-white focus:outline-none transition-all appearance-none cursor-pointer hover:border-gray-300"
                        onfocus="this.style.borderColor='var(--sidebar-bg)'; this.style.boxShadow='0 0 0 4px rgba(0, 48, 50, 0.1)';"
                        onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none';"
                      >
                        <option value="">{{ 'form.selectMethod' | translate }}</option>
                        <option value="cash">{{ 'form.invoice.cash' | translate }}</option>
                        <option value="card">{{ 'form.invoice.card' | translate }}</option>
                        <option value="bank_transfer">{{ 'form.invoice.bankTransfer' | translate }}</option>
                      </select>
                      <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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
                  type="button"
                  (click)="onCreateVoucher()"
                  [disabled]="invoiceForm.invalid || itemsArray.length === 0"
                  class="px-6 py-3 border-2 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-200 flex items-center gap-2"
                  [style.border-color]="'var(--primary-bg)'"
                  [style.color]="'var(--primary-text)'"
                    onmouseenter="if (!this.disabled) this.style.backgroundColor='rgba(217, 242, 117, 0.1)';"
                  onmouseleave="if (!this.disabled) this.style.backgroundColor='';"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  {{ 'invoice.wizard.createVoucher' | translate }}
                </button>
                <button
                  type="button"
                  (click)="onCreateInvoice()"
                  [disabled]="invoiceForm.invalid || itemsArray.length === 0 || loading"
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
                  {{ 'invoice.wizard.createInvoice' | translate }}
                </button>
              </div>
            </form>
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

          @if (false) {
            <div class="p-8 space-y-8">
              <!-- Voucher Name -->
                  <div class="rounded-xl p-6 border-2" style="background: rgba(0, 48, 50, 0.1); border-color: rgba(0, 48, 50, 0.3); color: rgb(55 65 81);">
                <label class="block text-sm font-semibold text-gray-700 mb-2">{{ 'invoice.voucher.voucherName' | translate }}</label>
                <div class="flex items-center">
                  <div class="w-12 h-12 rounded-lg flex items-center justify-center mr-4" [style.background]="'rgba(0, 48, 50, 0.2)'">
                    <svg class="w-6 h-6" [style.color]="'var(--sidebar-active-text)'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    [value]="voucher?.voucherName"
                    readonly
                    class="flex-1 px-4 py-3 border rounded-lg text-sm bg-white/50 font-mono text-gray-900 font-semibold"
                    style="border-color: rgba(0, 48, 50, 0.4);"
                  />
                </div>
              </div>

              <!-- Grouped Products by Origin -->
              <div class="space-y-6">
                @for (group of voucherProductGroups; track group.origin) {
                  <div class="border-2 border-gray-200 rounded-xl overflow-hidden transition-all duration-300" onmouseenter="this.style.borderColor='rgba(0, 48, 50, 0.5)';" onmouseleave="this.style.borderColor='#e5e7eb';">
                    <div class="px-6 py-4" [style.background]="'var(--sidebar-bg)'" [style.color]="'var(--sidebar-active-text)'">
                      <h4 class="text-lg font-bold text-white flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {{ group.origin === 'local' ? ('drug.origin.local' | translate) : group.origin === 'imported' ? ('drug.origin.imported' | translate) : ('invoice.voucher.unknownOrigin' | translate) }}
                      </h4>
                    </div>
                    <div class="p-6 space-y-4 bg-gradient-to-br from-gray-50 to-white">
                      @for (product of group.products; track product.drugId) {
                        <div class="grid grid-cols-1 md:grid-cols-5 gap-4 p-5 bg-white rounded-xl border-2 border-gray-100 hover:shadow-md transition-all duration-200" onmouseenter="this.style.borderColor='rgba(0, 48, 50, 0.5)';" onmouseleave="this.style.borderColor='#f3f4f6';">
                          <!-- Product Info with Checkbox -->
                          <div class="md:col-span-2">
                            <div class="flex items-start space-x-3">
                              <input
                                type="checkbox"
                                [(ngModel)]="product.applyDiscount"
                                [ngModelOptions]="{standalone: true}"
                                (change)="calculateVoucherDiscount()"
                                class="w-5 h-5 mt-1 border-gray-300 rounded cursor-pointer transition-all"
                                [style.accent-color]="'var(--sidebar-bg)'"
                              />
                              <div class="flex-1">
                                <span class="text-sm font-bold text-gray-900 block mb-1">{{ product.drugName }}</span>
                                <div class="text-xs text-gray-600 bg-gray-100 rounded-lg px-3 py-1.5 inline-block">
                                  {{ 'invoice.quantity' | translate }}: <span class="font-semibold">{{ product.quantity }}</span> ×
                                  <span class="font-semibold">{{ product.price | number:'1.2-2' }}</span> =
                                  <span class="font-bold" [style.color]="'var(--sidebar-active-text)'">{{ (product.quantity * product.price) | number:'1.2-2' }} EGP</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <!-- Discount Percentage -->
                          <div class="md:col-span-2">
                            <label class="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                              {{ 'invoice.voucher.discountPercentage' | translate }}
                            </label>
                            <div class="relative">
                              <input
                                type="number"
                                [(ngModel)]="product.discountPercentage"
                                [ngModelOptions]="{standalone: true}"
                                [disabled]="!product.applyDiscount"
                                (input)="calculateVoucherDiscount()"
                                min="0"
                                max="100"
                                step="0.01"
                                class="w-full px-4 py-3 pr-8 border-2 rounded-lg text-sm transition-all disabled:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-200 focus:outline-none"
                                [style.border-color]="product.applyDiscount ? 'rgba(0, 48, 50, 0.4)' : '#e5e7eb'"
                                [style.background-color]="product.applyDiscount ? 'rgba(0, 48, 50, 0.1)' : '#f9fafb'"
                                [style.color]="product.applyDiscount ? 'rgb(55 65 81)' : ''"
                                onfocus="if (!this.disabled) { this.style.borderColor='var(--sidebar-bg)'; this.style.boxShadow='0 0 0 4px rgba(0, 48, 50, 0.1)'; }"
                                onblur="if (!this.disabled) { this.style.borderColor='rgba(0, 48, 50, 0.4)'; this.style.boxShadow='none'; }"
                              />
                              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-600">%</span>
                            </div>
                          </div>

                          <!-- Discounted Price -->
                          <div class="flex items-center justify-end">
                            <div class="text-right">
                              <div class="text-xs font-semibold text-gray-600 mb-1">{{ 'invoice.totalPrice' | translate }}</div>
                              <div class="text-lg font-bold text-gray-900">{{ getDiscountedPrice(product) | number:'1.2-2' }}</div>
                              <div class="text-xs text-gray-500">EGP</div>
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- Average Discount and Amount -->
              <div class="border-t-2 border-gray-200 pt-8">
                <!-- Info Note -->
                <div class="border-2 rounded-xl p-5 mb-6 flex items-start" style="background: rgba(0, 48, 50, 0.1); border-color: rgba(0, 48, 50, 0.3); color: rgb(55 65 81);">
                  <svg class="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" [style.color]="'var(--sidebar-active-text)'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p class="text-sm font-semibold mb-1" [style.color]="'var(--sidebar-active-text)'">
                      {{ 'invoice.voucher.note' | translate }}
                    </p>
                    <p class="text-sm" [style.color]="'var(--card-text)'">
                      {{ 'invoice.voucher.averageDiscountNote' | translate }}
                    </p>
                  </div>
                </div>

                <!-- Summary Grid -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div class="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border-2 border-gray-200">
                    <label class="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">{{ 'invoice.subtotal' | translate }}</label>
                    <div class="text-2xl font-bold text-gray-900">{{ subtotal | number:'1.2-2' }}</div>
                    <div class="text-sm text-gray-600">EGP</div>
                  </div>

                  <div class="p-5 rounded-xl border-2" style="background: rgba(0, 48, 50, 0.1); border-color: rgba(0, 48, 50, 0.3); color: rgb(55 65 81);">
                    <label class="block text-xs font-semibold mb-2 uppercase tracking-wide" [style.color]="'var(--sidebar-active-text)'">{{ 'invoice.voucher.averageDiscount' | translate }}</label>
                    <div class="text-2xl font-bold" [style.color]="'var(--sidebar-active-text)'">{{ averageDiscountPercentage.toFixed(2) }}%</div>
                    <div class="text-sm" [style.color]="'var(--sidebar-active-text)'">{{ 'invoice.voucher.averageDiscountLabel' | translate }}</div>
                  </div>

                  <div class="bg-gradient-to-br from-green-50 to-emerald-50/30 p-5 rounded-xl border-2 border-green-200">
                    <label class="block text-xs font-semibold text-green-700 mb-2 uppercase tracking-wide">{{ 'invoice.voucher.discountAmount' | translate }}</label>
                    <div class="text-2xl font-bold text-green-600">{{ voucherDiscountAmount | number:'1.2-2' }}</div>
                    <div class="text-sm text-green-600">{{ 'invoice.voucher.egpSaved' | translate }}</div>
                  </div>
                </div>

                <!-- Final Total -->
                <div class="rounded-xl p-6" [style.background]="'var(--sidebar-bg)'" [style.color]="'var(--sidebar-text)'">
                  <div class="flex justify-between items-center">
                    <div>
                      <div class="text-sm font-semibold opacity-90 mb-1">{{ 'invoice.total' | translate }}</div>
                      <div class="text-4xl font-bold">{{ (subtotal - voucherDiscountAmount) | number:'1.2-2' }} <span class="text-xl">EGP</span></div>
                    </div>
                    <svg class="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Form Actions -->
              <div class="flex items-center justify-end gap-4 pt-8 border-t-2 border-gray-100">
                <button
                  type="button"
                  (click)="goToStep(1)"
                  class="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  {{ 'common.back' | translate }}
                </button>
                <button
                  type="button"
                  (click)="onCreateVoucherInvoice()"
                  [disabled]="loading"
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
                  {{ 'invoice.wizard.createInvoice' | translate }}
                </button>
              </div>
            </div>
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

          @if (false) {
            <div class="p-8 space-y-8">
              <!-- Patient Info Card -->
                  <div class="rounded-xl p-6 border-2" style="background: rgba(0, 48, 50, 0.1); border-color: rgba(0, 48, 50, 0.3); color: rgb(55 65 81);">
                <div class="flex items-center mb-4">
                  <div class="w-12 h-12 rounded-full flex items-center justify-center mr-3" [style.background]="'rgba(0, 48, 50, 0.2)'">
                    <svg class="w-6 h-6" [style.color]="'var(--sidebar-active-text)'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 class="text-lg font-bold text-gray-900">{{ 'invoice.voucher.patientInfo' | translate }}</h3>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="bg-white rounded-lg p-4">
                    <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">{{ 'patient.fullName' | translate }}</label>
                    <div class="text-lg font-bold text-gray-900">{{ selectedPatient?.fullName }}</div>
                  </div>
                  <div class="bg-white rounded-lg p-4">
                    <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">{{ 'patient.phone' | translate }}</label>
                    <div class="text-lg font-bold text-gray-900">{{ selectedPatient?.phone }}</div>
                  </div>
                </div>
              </div>

              <!-- QR Code Display -->
              <div class="flex justify-center">
                <div class="relative bg-white p-8 rounded-2xl border-4 shadow-2xl" style="border-color: rgba(0, 48, 50, 0.4);">
                  <!-- Decorative corners -->
                  <div class="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 rounded-tl-lg" [style.border-color]="'var(--sidebar-bg)'"></div>
                  <div class="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 rounded-tr-lg" [style.border-color]="'var(--sidebar-bg)'"></div>
                  <div class="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 rounded-bl-lg" [style.border-color]="'var(--sidebar-bg)'"></div>
                  <div class="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 rounded-br-lg" [style.border-color]="'var(--sidebar-bg)'"></div>

                  <canvas #qrCanvas class="w-64 h-64"></canvas>

                  <div class="mt-4 text-center">
                    <p class="text-xs font-semibold text-gray-600 uppercase tracking-wide">{{ 'invoice.voucher.voucherCode' | translate }}</p>
                    <p class="text-lg font-bold font-mono" [style.color]="'var(--sidebar-active-text)'">{{ voucher?.voucherCode }}</p>
                  </div>
                </div>
              </div>

              <!-- Instructions -->
              <div class="text-center space-y-4">
                <div class="bg-gradient-to-br from-green-50 to-emerald-50/30 rounded-xl p-6 border-2 border-green-200">
                  <div class="flex items-start justify-center">
                    <svg class="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-sm text-green-900 text-left">
                      {{ 'invoice.voucher.qrCodeDescription' | translate }}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  (click)="sendVoucherToPatient()"
                  [disabled]="sendingVoucher"
                  class="px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none transition-all duration-200 flex items-center gap-3 mx-auto"
                  [style.background]="'var(--primary-bg)'"
                  [style.color]="'var(--primary-text)'"
                >
                  @if (sendingVoucher) {
                    <svg class="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ 'invoice.voucher.sending' | translate }}
                  } @else {
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    {{ 'invoice.voucher.sendToPatient' | translate }}
                  }
                </button>
              </div>

              <!-- Form Actions -->
              <div class="flex items-center justify-end gap-4 pt-8 border-t-2 border-gray-100">
                <button
                  type="button"
                  (click)="goToStep(2)"
                  class="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  {{ 'common.back' | translate }}
                </button>
                <button
                  type="button"
                  (click)="onCancel()"
                  class="px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-800 hover:shadow-lg transition-all duration-200"
                >
                  {{ 'common.close' | translate }}
                </button>
              </div>
            </div>
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
