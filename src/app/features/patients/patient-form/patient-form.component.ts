import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PatientsService } from '../../../core/services/patients.service';
import { TranslationService } from '../../../core/services/translation.service';
import { FormWrapperComponent } from '../../../shared/components/form-wrapper/form-wrapper.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { AutocompleteComponent, AutocompleteOption } from '../../../shared/components/autocomplete/autocomplete.component';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormWrapperComponent,
    ButtonComponent,
    AlertComponent,
    TranslatePipe,
    AutocompleteComponent
  ],
  template: `
    <app-form-wrapper [title]="(isEdit ? 'form.editPatient' : 'form.addPatient') | translate">
      @if (errorMessage) {
        <app-alert type="error" [title]="errorMessage" />
      }

      <form [formGroup]="patientForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Personal Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ 'patient.fullName' | translate }} <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              formControlName="fullName"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-[#166534]"
              [class.border-red-500]="patientForm.get('fullName')?.invalid && patientForm.get('fullName')?.touched"
            />
            @if (patientForm.get('fullName')?.invalid && patientForm.get('fullName')?.touched) {
              <p class="mt-1 text-sm text-red-600">{{ 'validation.fullNameRequired' | translate }}</p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ 'patient.dateOfBirth' | translate }} <span class="text-red-500">*</span>
            </label>
            <input
              type="date"
              formControlName="dateOfBirth"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-[#166534]"
              [class.border-red-500]="patientForm.get('dateOfBirth')?.invalid && patientForm.get('dateOfBirth')?.touched"
            />
            @if (patientForm.get('dateOfBirth')?.invalid && patientForm.get('dateOfBirth')?.touched) {
              <p class="mt-1 text-sm text-red-600">{{ 'validation.dateOfBirthRequired' | translate }}</p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ 'patient.gender' | translate }} <span class="text-red-500">*</span>
            </label>
            <select
              formControlName="gender"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-[#166534]"
              [class.border-red-500]="patientForm.get('gender')?.invalid && patientForm.get('gender')?.touched"
            >
              <option value="">{{ 'form.selectGender' | translate }}</option>
              <option value="male">{{ 'form.gender.male' | translate }}</option>
              <option value="female">{{ 'form.gender.female' | translate }}</option>
              <option value="other">{{ 'form.gender.other' | translate }}</option>
            </select>
            @if (patientForm.get('gender')?.invalid && patientForm.get('gender')?.touched) {
              <p class="mt-1 text-sm text-red-600">{{ 'validation.genderRequired' | translate }}</p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ 'patient.phone' | translate }} <span class="text-red-500">*</span>
            </label>
            <input
              type="tel"
              formControlName="phone"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-[#166534]"
              [class.border-red-500]="patientForm.get('phone')?.invalid && patientForm.get('phone')?.touched"
            />
            @if (patientForm.get('phone')?.invalid && patientForm.get('phone')?.touched) {
              <p class="mt-1 text-sm text-red-600">{{ 'validation.phoneRequired' | translate }}</p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'patient.email' | translate }}</label>
            <input
              type="email"
              formControlName="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-[#166534]"
              [class.border-red-500]="patientForm.get('email')?.invalid && patientForm.get('email')?.touched"
            />
            @if (patientForm.get('email')?.invalid && patientForm.get('email')?.touched) {
              <p class="mt-1 text-sm text-red-600">{{ 'validation.emailInvalid' | translate }}</p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'patient.occupation' | translate }}</label>
            <app-autocomplete
              formControlName="occupation"
              [options]="occupationOptions"
              [placeholder]="'form.selectOrType' | translate"
              [allowCustom]="true"
            ></app-autocomplete>
          </div>
        </div>

        <!-- Address Information -->
        <div class="border-t pt-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ 'patient.addressInfo' | translate }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ 'patient.city' | translate }} <span class="text-red-500">*</span>
              </label>
              <app-autocomplete
                formControlName="city"
                [options]="cityOptions"
                [placeholder]="'form.selectOrType' | translate"
                [allowCustom]="true"
                [hasError]="!!(patientForm.get('city')?.invalid && patientForm.get('city')?.touched)"
              ></app-autocomplete>
              @if (patientForm.get('city')?.invalid && patientForm.get('city')?.touched) {
                <p class="mt-1 text-sm text-red-600">{{ 'validation.cityRequired' | translate }}</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ 'patient.area' | translate }} <span class="text-red-500">*</span>
              </label>
              <app-autocomplete
                formControlName="area"
                [options]="areaOptions"
                [placeholder]="'form.selectOrType' | translate"
                [allowCustom]="true"
                [hasError]="!!(patientForm.get('area')?.invalid && patientForm.get('area')?.touched)"
              ></app-autocomplete>
              @if (patientForm.get('area')?.invalid && patientForm.get('area')?.touched) {
                <p class="mt-1 text-sm text-red-600">{{ 'validation.areaRequired' | translate }}</p>
              }
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ 'patient.street' | translate }} <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                formControlName="street"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-[#166534]"
                [class.border-red-500]="patientForm.get('street')?.invalid && patientForm.get('street')?.touched"
              />
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'patient.notes' | translate }}</label>
              <textarea
                formControlName="addressNotes"
                rows="3"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-[#166534]"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Medical Notes -->
        <div class="border-t pt-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ 'patient.medicalInfo' | translate }}</h3>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ 'patient.medicalNotes' | translate }}</label>
            <textarea
              formControlName="medicalNotes"
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-[#166534]"
              [placeholder]="'placeholder.medicalNotes' | translate"
            ></textarea>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex items-center justify-end gap-4 pt-6 border-t">
          <app-button
            type="button"
            variant="outline"
            (onClick)="onCancel()"
          >
            {{ 'common.cancel' | translate }}
          </app-button>
          <app-button
            type="submit"
            variant="primary"
            [loading]="loading"
            [disabled]="patientForm.invalid"
          >
            {{ (isEdit ? 'form.updatePatient' : 'form.createPatient') | translate }}
          </app-button>
        </div>
      </form>
    </app-form-wrapper>
  `,
  styles: []
})
export class PatientFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private patientsService = inject(PatientsService);
  private translationService = inject(TranslationService);
  
  translate(key: string): string {
    return this.translationService.translate(key);
  }

  patientForm!: FormGroup;
  loading = false;
  errorMessage = '';
  isEdit = false;
  patientId: string | null = null;

  // Autocomplete options
  occupationOptions: AutocompleteOption[] = [
    { value: 'doctor', label: 'Doctor' },
    { value: 'engineer', label: 'Engineer' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'nurse', label: 'Nurse' },
    { value: 'accountant', label: 'Accountant' },
    { value: 'lawyer', label: 'Lawyer' },
    { value: 'architect', label: 'Architect' },
    { value: 'pharmacist', label: 'Pharmacist' },
    { value: 'dentist', label: 'Dentist' },
    { value: 'manager', label: 'Manager' },
    { value: 'student', label: 'Student' },
    { value: 'retired', label: 'Retired' },
    { value: 'business_owner', label: 'Business Owner' },
    { value: 'government_employee', label: 'Government Employee' },
    { value: 'private_employee', label: 'Private Employee' }
  ];

  cityOptions: AutocompleteOption[] = [
    { value: 'cairo', label: 'Cairo' },
    { value: 'alexandria', label: 'Alexandria' },
    { value: 'giza', label: 'Giza' },
    { value: 'shubra_el_kheima', label: 'Shubra El Kheima' },
    { value: 'port_said', label: 'Port Said' },
    { value: 'suez', label: 'Suez' },
    { value: 'luxor', label: 'Luxor' },
    { value: 'aswan', label: 'Aswan' },
    { value: 'mansoura', label: 'Mansoura' },
    { value: 'tanta', label: 'Tanta' },
    { value: 'ismailia', label: 'Ismailia' },
    { value: 'assiut', label: 'Assiut' },
    { value: 'zagazig', label: 'Zagazig' },
    { value: 'damanhur', label: 'Damanhur' },
    { value: 'minya', label: 'Minya' }
  ];

  areaOptions: AutocompleteOption[] = [
    { value: 'nasr_city', label: 'Nasr City' },
    { value: 'maadi', label: 'Maadi' },
    { value: 'zamalek', label: 'Zamalek' },
    { value: 'heliopolis', label: 'Heliopolis' },
    { value: 'downtown', label: 'Downtown' },
    { value: 'new_cairo', label: 'New Cairo' },
    { value: '6_october', label: '6th October' },
    { value: 'sheikh_zayed', label: 'Sheikh Zayed' },
    { value: 'al_rehab', label: 'Al Rehab' },
    { value: 'madinet_nasr', label: 'Madinet Nasr' },
    { value: 'shubra', label: 'Shubra' },
    { value: 'abbassia', label: 'Abbassia' },
    { value: 'ain_shams', label: 'Ain Shams' },
    { value: 'mokattam', label: 'Mokattam' },
    { value: 'new_helipolis', label: 'New Heliopolis' }
  ];

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.patientId;

    this.patientForm = this.fb.group({
      fullName: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.email]],
      occupation: [''],
      city: ['', [Validators.required]],
      area: ['', [Validators.required]],
      street: ['', [Validators.required]],
      addressNotes: [''],
      medicalNotes: ['']
    });

    if (this.isEdit && this.patientId) {
      this.loadPatient();
    }
  }

  private loadPatient(): void {
    this.patientsService.getById(this.patientId!).subscribe({
      next: (patient) => {
        if (patient) {
          this.patientForm.patchValue({
            fullName: patient.fullName,
            dateOfBirth: this.formatDateForInput(patient.dateOfBirth),
            gender: patient.gender,
            phone: patient.phone,
            email: patient.email || '',
            occupation: patient.occupation || '',
            city: patient.address.city,
            area: patient.address.area,
            street: patient.address.street,
            addressNotes: patient.address.notes || '',
            medicalNotes: patient.medicalNotes || ''
          });
        }
      },
      error: (error) => {
        this.errorMessage = this.translate('error.loadPatient');
      }
    });
  }

  onSubmit(): void {
    if (this.patientForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const formValue = this.patientForm.value;
      const patientData = {
        fullName: formValue.fullName,
        dateOfBirth: new Date(formValue.dateOfBirth),
        gender: formValue.gender,
        phone: formValue.phone,
        email: formValue.email || undefined,
        occupation: formValue.occupation || undefined,
        address: {
          city: formValue.city,
          area: formValue.area,
          street: formValue.street,
          notes: formValue.addressNotes || undefined
        },
        medicalNotes: formValue.medicalNotes || undefined
      };

      const operation = this.isEdit
        ? this.patientsService.update(this.patientId!, patientData)
        : this.patientsService.create(patientData);

      operation.subscribe({
        next: () => {
          this.router.navigate(['/patients']);
        },
        error: (error) => {
          this.errorMessage = error.message || this.translate('error.savePatient');
          this.loading = false;
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.patientForm.controls).forEach(key => {
        this.patientForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/patients']);
  }

  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
