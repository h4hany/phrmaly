import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TranslatePipe} from '../../../core/pipes/translate.pipe';
import {Patient} from '../../../core/models/patient.model';


@Component({
  selector: 'app-patient-info-section',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, TranslatePipe],
  template: `
    <div class="glass-card rounded-2xl p-8 shadow-xl animate-slide-in">
      <div class="flex items-center mb-6">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mr-3">
          <svg class="w-6 h-6 text-[var(--primary-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900">{{ 'invoice.patientInfo' | translate }}</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Patient Selector -->
        <div class="relative">
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            {{ 'invoice.patient' | translate }} <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <select
              [value]="patientId"
              (change)="onPatientChange($event)"
              class="custom-select w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--primary-color)] transition-all"
            >
              <option value="">{{ 'form.selectPatient' | translate }}</option>
              @for (patient of patients; track patient.id) {
                <option [value]="patient.id">{{ patient.fullName }} - ID: {{ patient.id }}</option>
              }
            </select>
            <div class="absolute right-3 top-3.5 pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Doctor Autocomplete -->
        <div class="relative doctor-dropdown-container">
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            {{ 'invoice.doctor' | translate }} <span class="text-gray-400">({{ 'common.optional' | translate }})</span>
          </label>
          <div class="relative">
            <input
              type="text"
              [value]="doctorInput"
              (input)="onDoctorInputChange($event)"
              (focus)="onDoctorFocus()"
              [placeholder]="'form.selectOrType' | translate"
              class="custom-input w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--primary-color)] transition-all"
            />
            <div class="absolute right-3 top-3.5 pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>

            <!-- Dropdown -->
            @if (showDoctorDropdown) {
              <div class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-xl py-1 ring-1 ring-black ring-opacity-5 overflow-auto">
                @if (doctorInput.trim() && filteredDoctors.length > 0) {
                  @for (doctor of filteredDoctors; track doctor.id || doctor.name) {
                    <button
                      type="button"
                      (click)="selectDoctor(doctor)"
                      class="block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 cursor-pointer text-gray-900 transition-colors"
                    >
                      <div class="flex items-center">
                        <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        {{ doctor.name }}
                      </div>
                    </button>
                  }
                }
                @if (doctorInput.trim() && filteredDoctors.length === 0) {
                  <button
                    type="button"
                    (click)="addDoctor()"
                    class="block w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 cursor-pointer text-[var(--primary-color)] font-medium transition-colors"
                  >
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
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
                      class="block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 cursor-pointer text-gray-900 transition-colors"
                    >
                      <div class="flex items-center">
                        <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        {{ doctor.name }}
                      </div>
                    </button>
                  }
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .glass-card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .custom-select {
      appearance: none;
      background-image: none;
    }

    .custom-input:focus,
    .custom-select:focus {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
    }

    @keyframes slide-in {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-slide-in {
      animation: slide-in 0.3s ease;
    }
  `]
})
export class PatientInfoSectionComponent {
  @Input() patients: Patient[] = [];
  @Input() doctors: Array<{id: string, name: string}> = [];
  @Input() patientId: string = '';
  @Input() doctorInput: string = '';
  @Input() showDoctorDropdown: boolean = false;
  @Input() filteredDoctors: Array<{id?: string, name: string}> = [];

  @Output() patientChange = new EventEmitter<string>();
  @Output() doctorInputChange = new EventEmitter<Event>();
  @Output() doctorFocus = new EventEmitter<void>();
  @Output() doctorSelect = new EventEmitter<{id?: string, name: string}>();
  @Output() doctorAdd = new EventEmitter<void>();

  onPatientChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.patientChange.emit(select.value);
  }

  onDoctorInputChange(event: Event): void {
    this.doctorInputChange.emit(event);
  }

  onDoctorFocus(): void {
    this.doctorFocus.emit();
  }

  selectDoctor(doctor: {id?: string, name: string}): void {
    this.doctorSelect.emit(doctor);
  }

  addDoctor(): void {
    this.doctorAdd.emit();
  }
}
