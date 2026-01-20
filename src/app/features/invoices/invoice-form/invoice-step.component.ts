import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { BarcodeScannerDirective } from '../../../shared/directives/barcode-scanner.directive';
import { Patient } from '../../../core/models/patient.model';
import { PharmacyDrug } from '../../../core/models/drug.model';

@Component({
  selector: 'app-invoice-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslatePipe,
    BarcodeScannerDirective
  ],
  template: `
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
                (input)="onPatientInput.emit($event)"
                (focus)="onPatientFocus.emit()"
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
                          (click)="onPatientSelect.emit(patient)"
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
                          (click)="onPatientSelect.emit(patient)"
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
                (input)="onDoctorInput.emit($event)"
                (focus)="onDoctorFocus.emit()"
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
                          (click)="onDoctorSelect.emit(doctor)"
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
                        (click)="onAddNewDoctor.emit()"
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
                          (click)="onDoctorSelect.emit(doctor)"
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
                (keyup.enter)="onBarcodeEnter.emit()"
                appBarcodeScanner
                (barcodeScanned)="onBarcodeScanned.emit($event)"
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
              (click)="onToggleDrugSelector.emit()"
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
                  (input)="onDrugInput.emit($event)"
                  (focus)="onDrugFocus.emit()"
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
                            (click)="onDrugSelect.emit(drug)"
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
                            (click)="onDrugSelect.emit(drug)"
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
                (click)="onAddSelectedDrug.emit()"
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
                  (click)="onRemoveItem.emit(i)"
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
          (click)="onCancel.emit()"
          class="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
        >
          {{ 'common.cancel' | translate }}
        </button>
        <button
          type="button"
          (click)="onCreateVoucher.emit()"
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
          (click)="onCreateInvoice.emit()"
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
  `
})
export class InvoiceStepComponent {
  @Input() invoiceForm!: FormGroup;
  @Input() itemsArray!: FormArray;
  @Input() patients: Patient[] = [];
  @Input() pharmacyDrugs: PharmacyDrug[] = [];
  @Input() doctors: Array<{id: string, name: string}> = [];
  @Input() filteredDoctors: Array<{id?: string, name: string}> = [];
  @Input() filteredPatients: Patient[] = [];
  @Input() filteredDrugs: PharmacyDrug[] = [];
  @Input() patientInput = '';
  @Input() doctorInput = '';
  @Input() drugInput = '';
  @Input() barcodeInput = '';
  @Input() showPatientDropdown = false;
  @Input() showDoctorDropdown = false;
  @Input() showDrugDropdown = false;
  @Input() showDrugSelector = false;
  @Input() loading = false;
  @Input() formattedSubtotal = '0.00';
  @Input() formattedTotal = '0.00';
  @Input() getDrugName!: (drugId: string) => string;

  @Output() onPatientInput = new EventEmitter<Event>();
  @Output() onPatientFocus = new EventEmitter<void>();
  @Output() onPatientSelect = new EventEmitter<Patient>();
  @Output() onDoctorInput = new EventEmitter<Event>();
  @Output() onDoctorFocus = new EventEmitter<void>();
  @Output() onDoctorSelect = new EventEmitter<{id?: string, name: string}>();
  @Output() onAddNewDoctor = new EventEmitter<void>();
  @Output() onDrugInput = new EventEmitter<Event>();
  @Output() onDrugFocus = new EventEmitter<void>();
  @Output() onDrugSelect = new EventEmitter<PharmacyDrug>();
  @Output() onToggleDrugSelector = new EventEmitter<void>();
  @Output() onAddSelectedDrug = new EventEmitter<void>();
  @Output() onBarcodeEnter = new EventEmitter<void>();
  @Output() onBarcodeScanned = new EventEmitter<string>();
  @Output() onRemoveItem = new EventEmitter<number>();
  @Output() onCreateVoucher = new EventEmitter<void>();
  @Output() onCreateInvoice = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
}

