import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PatientsService } from '../../../core/services/patients.service';
import { TranslationService } from '../../../core/services/translation.service';
import { ModernFormWrapperComponent } from '../../../shared/components/modern-form-wrapper/modern-form-wrapper.component';
import { FormSectionComponent } from '../../../shared/components/form-section/form-section.component';
import { RadioInputComponent } from '../../../shared/components/input/radio-input.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ModernFormWrapperComponent,
    FormSectionComponent,
    RadioInputComponent,
    TranslatePipe
  ],
  template: `
    <app-modern-form-wrapper
      [title]="(isEdit ? 'form.editPatient' : 'form.addPatient')"
      [description]="(isEdit ? 'form.editPatientDescription' : 'form.addPatientDescription')"
      [errorMessage]="errorMessage"
    >
      <form [formGroup]="patientForm" (ngSubmit)="onSubmit()" class="p-8">
        <!-- Personal Information Section -->
        <app-form-section [title]="'patient.personalInfo'">

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Full Name -->
                <div class="group">
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    {{ 'patient.fullName' | translate }}
                    <span class="text-red-500 ml-1">*</span>
                  </label>
                  <div class="relative">
                    <input
                      type="text"
                      formControlName="fullName"
                      [placeholder]="'placeholder.fullName' | translate"
                      class="w-full px-4 py-3.5 pl-12 border-2 border-gray-200 rounded-xl text-sm bg-white focus:outline-none transition-all duration-200 hover:border-gray-300"
                      [class.border-red-500]="patientForm.get('fullName')?.invalid && patientForm.get('fullName')?.touched"
                      onfocus="this.style.borderColor='var(--sidebar-bg)'; this.style.boxShadow='0 0 0 4px rgba(0, 48, 50, 0.1)';"
                      onblur="this.style.borderColor=this.classList.contains('border-red-500') ? '#ef4444' : '#e5e7eb'; this.style.boxShadow='none';"
                    />
                    <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  @if (patientForm.get('fullName')?.invalid && patientForm.get('fullName')?.touched) {
                    <p class="mt-1 text-xs text-red-500">{{ 'validation.fullNameRequired' | translate }}</p>
                  }
                </div>

                <!-- Date of Birth -->
                <div class="group">
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    {{ 'patient.dateOfBirth' | translate }}
                    <span class="text-red-500 ml-1">*</span>
                  </label>
                  <div class="relative">
                    <input
                      type="date"
                      formControlName="dateOfBirth"
                      class="w-full px-4 py-3.5 pl-12 border-2 border-gray-200 rounded-xl text-sm bg-white focus:outline-none transition-all duration-200 hover:border-gray-300"
                      [class.border-red-500]="patientForm.get('dateOfBirth')?.invalid && patientForm.get('dateOfBirth')?.touched"
                      onfocus="this.style.borderColor='var(--sidebar-bg)'; this.style.boxShadow='0 0 0 4px rgba(0, 48, 50, 0.1)';"
                      onblur="this.style.borderColor=this.classList.contains('border-red-500') ? '#ef4444' : '#e5e7eb'; this.style.boxShadow='none';"
                    />
                    <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  @if (patientForm.get('dateOfBirth')?.invalid && patientForm.get('dateOfBirth')?.touched) {
                    <p class="mt-1 text-xs text-red-500">{{ 'validation.dateOfBirthRequired' | translate }}</p>
                  }
                </div>

                <!-- Gender -->
                <div class="group">
                  <app-radio-input
                    formControlName="gender"
                    [label]="'patient.gender'"
                    [required]="true"
                    [radioOptions]="genderOptions"
                    [hasError]="!!(patientForm.get('gender')?.invalid && patientForm.get('gender')?.touched)"
                    [errorMessage]="(patientForm.get('gender')?.invalid && patientForm.get('gender')?.touched) ? 'validation.genderRequired' : undefined"
                  ></app-radio-input>
                </div>

                <!-- Phone -->
                <div class="group">
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    {{ 'patient.phone' | translate }}
                    <span class="text-red-500 ml-1">*</span>
                  </label>
                  <div class="relative">
                    <input
                      type="tel"
                      formControlName="phone"
                      [placeholder]="'placeholder.phone' | translate"
                      class="w-full px-4 py-3.5 pl-12 border-2 border-gray-200 rounded-xl text-sm bg-white focus:outline-none transition-all duration-200 hover:border-gray-300"
                      [class.border-red-500]="patientForm.get('phone')?.invalid && patientForm.get('phone')?.touched"
                      onfocus="this.style.borderColor='var(--sidebar-bg)'; this.style.boxShadow='0 0 0 4px rgba(0, 48, 50, 0.1)';"
                      onblur="this.style.borderColor=this.classList.contains('border-red-500') ? '#ef4444' : '#e5e7eb'; this.style.boxShadow='none';"
                    />
                    <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                  @if (patientForm.get('phone')?.invalid && patientForm.get('phone')?.touched) {
                    <p class="mt-1 text-xs text-red-500">{{ 'validation.phoneRequired' | translate }}</p>
                  }
                </div>

                <!-- Email -->
                <div class="group">
                  <label class="block text-sm font-semibold text-gray-700 mb-2">{{ 'patient.email' | translate }}</label>
                  <div class="relative">
                    <input
                      type="email"
                      formControlName="email"
                      [placeholder]="'placeholder.email' | translate"
                      class="w-full px-4 py-3.5 pl-12 border-2 border-gray-200 rounded-xl text-sm bg-white focus:outline-none transition-all duration-200 hover:border-gray-300"
                      [class.border-red-500]="patientForm.get('email')?.invalid && patientForm.get('email')?.touched"
                      onfocus="this.style.borderColor='var(--sidebar-bg)'; this.style.boxShadow='0 0 0 4px rgba(0, 48, 50, 0.1)';"
                      onblur="this.style.borderColor=this.classList.contains('border-red-500') ? '#ef4444' : '#e5e7eb'; this.style.boxShadow='none';"
                    />
                    <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  @if (patientForm.get('email')?.invalid && patientForm.get('email')?.touched) {
                    <p class="mt-1 text-xs text-red-500">{{ 'validation.emailInvalid' | translate }}</p>
                  }
                </div>

                <!-- Occupation -->
                <div class="group">
                  <label class="block text-sm font-semibold text-gray-700 mb-2">{{ 'patient.occupation' | translate }}</label>
                  <div class="relative">
                    <input
                      type="text"
                      formControlName="occupation"
                      [placeholder]="'form.selectOrType' | translate"
                      class="w-full px-4 py-3.5 pl-12 border-2 border-gray-200 rounded-xl text-sm bg-white focus:outline-none transition-all duration-200 hover:border-gray-300"
                      onfocus="this.style.borderColor='var(--sidebar-bg)'; this.style.boxShadow='0 0 0 4px rgba(0, 48, 50, 0.1)';"
                      onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none';"
                    />
                    <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
        </app-form-section>

        <!-- Address Information Section -->
        <app-form-section [title]="'patient.addressInfo'">

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- City -->
                <div class="group">
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    {{ 'patient.city' | translate }}
                    <span class="text-red-500 ml-1">*</span>
                  </label>
                  <div class="relative">
                    <input
                      type="text"
                      formControlName="city"
                      [placeholder]="'form.selectOrType' | translate"
                      class="w-full px-4 py-3.5 pl-12 border-2 border-gray-200 rounded-xl text-sm bg-white focus:outline-none transition-all duration-200 hover:border-gray-300"
                      [class.border-red-500]="patientForm.get('city')?.invalid && patientForm.get('city')?.touched"
                      onfocus="this.style.borderColor='var(--sidebar-bg)'; this.style.boxShadow='0 0 0 4px rgba(0, 48, 50, 0.1)';"
                      onblur="this.style.borderColor=this.classList.contains('border-red-500') ? '#ef4444' : '#e5e7eb'; this.style.boxShadow='none';"
                    />
                    <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  @if (patientForm.get('city')?.invalid && patientForm.get('city')?.touched) {
                    <p class="mt-1 text-xs text-red-500">{{ 'validation.cityRequired' | translate }}</p>
                  }
                </div>

                <!-- Area -->
                <div class="group">
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    {{ 'patient.area' | translate }}
                    <span class="text-red-500 ml-1">*</span>
                  </label>
                  <div class="relative">
                    <input
                      type="text"
                      formControlName="area"
                      [placeholder]="'form.selectOrType' | translate"
                      class="w-full px-4 py-3.5 pl-12 border-2 border-gray-200 rounded-xl text-sm bg-white focus:outline-none transition-all duration-200 hover:border-gray-300"
                      [class.border-red-500]="patientForm.get('area')?.invalid && patientForm.get('area')?.touched"
                      onfocus="this.style.borderColor='var(--sidebar-bg)'; this.style.boxShadow='0 0 0 4px rgba(0, 48, 50, 0.1)';"
                      onblur="this.style.borderColor=this.classList.contains('border-red-500') ? '#ef4444' : '#e5e7eb'; this.style.boxShadow='none';"
                    />
                    <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  @if (patientForm.get('area')?.invalid && patientForm.get('area')?.touched) {
                    <p class="mt-1 text-xs text-red-500">{{ 'validation.areaRequired' | translate }}</p>
                  }
                </div>

                <!-- Street -->
                <div class="group md:col-span-2">
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    {{ 'patient.street' | translate }}
                    <span class="text-red-500 ml-1">*</span>
                  </label>
                  <div class="relative">
                    <input
                      type="text"
                      formControlName="street"
                      [placeholder]="'placeholder.street' | translate"
                      class="w-full px-4 py-3.5 pl-12 border-2 border-gray-200 rounded-xl text-sm bg-white focus:outline-none transition-all duration-200 hover:border-gray-300"
                      [class.border-red-500]="patientForm.get('street')?.invalid && patientForm.get('street')?.touched"
                      onfocus="this.style.borderColor='var(--sidebar-bg)'; this.style.boxShadow='0 0 0 4px rgba(0, 48, 50, 0.1)';"
                      onblur="this.style.borderColor=this.classList.contains('border-red-500') ? '#ef4444' : '#e5e7eb'; this.style.boxShadow='none';"
                    />
                    <div class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  @if (patientForm.get('street')?.invalid && patientForm.get('street')?.touched) {
                    <p class="mt-1 text-xs text-red-500">{{ 'validation.streetRequired' | translate }}</p>
                  }
                </div>

                <!-- Address Notes -->
                <div class="group md:col-span-2">
                  <label class="block text-sm font-semibold text-gray-700 mb-2">{{ 'patient.notes' | translate }}</label>
                  <div class="relative">
                    <textarea
                      formControlName="addressNotes"
                      [placeholder]="'placeholder.addressNotes' | translate"
                      rows="3"
                      class="w-full px-4 py-3.5 pl-12 border-2 border-gray-200 rounded-xl text-sm bg-white focus:outline-none transition-all duration-200 hover:border-gray-300 resize-none"
                      onfocus="this.style.borderColor='var(--sidebar-bg)'; this.style.boxShadow='0 0 0 4px rgba(0, 48, 50, 0.1)';"
                      onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none';"
                    ></textarea>
                    <div class="absolute left-4 top-4 text-gray-400 pointer-events-none">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
        </app-form-section>

        <!-- Medical Information Section -->
        <app-form-section [title]="'patient.medicalInfo'">

              <div class="group">
                <label class="block text-sm font-semibold text-gray-700 mb-2">{{ 'patient.medicalNotes' | translate }}</label>
                <div class="relative">
                  <textarea
                    formControlName="medicalNotes"
                    [placeholder]="'placeholder.medicalNotes' | translate"
                    rows="4"
                    class="w-full px-4 py-3.5 pl-12 border-2 border-gray-200 rounded-xl text-sm bg-white focus:outline-none transition-all duration-200 hover:border-gray-300 resize-none"
                    onfocus="this.style.borderColor='var(--sidebar-bg)'; this.style.boxShadow='0 0 0 4px rgba(0, 48, 50, 0.1)';"
                    onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none';"
                  ></textarea>
                  <div class="absolute left-4 top-4 text-gray-400 pointer-events-none">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
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
            [disabled]="patientForm.invalid || loading"
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
            {{ (isEdit ? 'form.updatePatient' : 'form.createPatient') | translate }}
          </button>
        </div>
      </form>
    </app-modern-form-wrapper>
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

  // Radio options for gender
  genderOptions: Array<{ value: any; label: string }> = [
    { value: 'male', label: 'form.gender.male' },
    { value: 'female', label: 'form.gender.female' }
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
