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
import { TextInputComponent } from '../../../shared/components/input/text-input.component';
import { TextareaInputComponent } from '../../../shared/components/input/textarea-input.component';
import { RadioInputComponent } from '../../../shared/components/input/radio-input.component';
import { AutocompleteInputComponent, AutocompleteOption } from '../../../shared/components/input/autocomplete-input.component';

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
    TextInputComponent,
    TextareaInputComponent,
    RadioInputComponent,
    AutocompleteInputComponent
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
            <app-text-input
              type="text"
              formControlName="fullName"
              [label]="'patient.fullName'"
              [required]="true"
              [hasError]="!!(patientForm.get('fullName')?.invalid && patientForm.get('fullName')?.touched)"
              [errorMessage]="(patientForm.get('fullName')?.invalid && patientForm.get('fullName')?.touched) ? 'validation.fullNameRequired' : undefined"
              prefixIcon="user"
            ></app-text-input>
          </div>

          <div>
            <app-text-input
              type="date"
              formControlName="dateOfBirth"
              [label]="'patient.dateOfBirth'"
              [required]="true"
              [hasError]="!!(patientForm.get('dateOfBirth')?.invalid && patientForm.get('dateOfBirth')?.touched)"
              [errorMessage]="(patientForm.get('dateOfBirth')?.invalid && patientForm.get('dateOfBirth')?.touched) ? 'validation.dateOfBirthRequired' : undefined"
              prefixIcon="calendar"
            ></app-text-input>
          </div>

          <div>
            <app-radio-input
              formControlName="gender"
              [label]="'patient.gender'"
              [required]="true"
              [radioOptions]="genderOptions"
              [hasError]="!!(patientForm.get('gender')?.invalid && patientForm.get('gender')?.touched)"
              [errorMessage]="(patientForm.get('gender')?.invalid && patientForm.get('gender')?.touched) ? 'validation.genderRequired' : undefined"
            ></app-radio-input>
          </div>

          <div>
            <app-text-input
              type="tel"
              formControlName="phone"
              [label]="'patient.phone'"
              [required]="true"
              [hasError]="!!(patientForm.get('phone')?.invalid && patientForm.get('phone')?.touched)"
              [errorMessage]="(patientForm.get('phone')?.invalid && patientForm.get('phone')?.touched) ? 'validation.phoneRequired' : undefined"
              prefixIcon="phone"
            ></app-text-input>
          </div>

          <div>
            <app-text-input
              type="email"
              formControlName="email"
              [label]="'patient.email'"
              [hasError]="!!(patientForm.get('email')?.invalid && patientForm.get('email')?.touched)"
              [errorMessage]="(patientForm.get('email')?.invalid && patientForm.get('email')?.touched) ? 'validation.emailInvalid' : undefined"
              prefixIcon="mail"
            ></app-text-input>
          </div>

          <div>
            <app-autocomplete-input
              formControlName="occupation"
              [label]="'patient.occupation'"
              [options]="occupationOptions"
              [placeholder]="'form.selectOrType'"
              [allowAddNew]="true"
            ></app-autocomplete-input>
          </div>
        </div>

        <!-- Address Information -->
        <div class="border-t pt-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ 'patient.addressInfo' | translate }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <app-autocomplete-input
                formControlName="city"
                [label]="'patient.city'"
                [required]="true"
                [options]="cityOptions"
                [placeholder]="'form.selectOrType'"
                [allowAddNew]="true"
                [hasError]="!!(patientForm.get('city')?.invalid && patientForm.get('city')?.touched)"
                [errorMessage]="(patientForm.get('city')?.invalid && patientForm.get('city')?.touched) ? 'validation.cityRequired' : undefined"
              ></app-autocomplete-input>
            </div>

            <div>
              <app-autocomplete-input
                formControlName="area"
                [label]="'patient.area'"
                [required]="true"
                [options]="areaOptions"
                [placeholder]="'form.selectOrType'"
                [allowAddNew]="true"
                [hasError]="!!(patientForm.get('area')?.invalid && patientForm.get('area')?.touched)"
                [errorMessage]="(patientForm.get('area')?.invalid && patientForm.get('area')?.touched) ? 'validation.areaRequired' : undefined"
              ></app-autocomplete-input>
            </div>

            <div class="md:col-span-2">
              <app-text-input
                type="text"
                formControlName="street"
                [label]="'patient.street'"
                [required]="true"
                [hasError]="!!(patientForm.get('street')?.invalid && patientForm.get('street')?.touched)"
                prefixIcon="map-pin"
              ></app-text-input>
            </div>

            <div class="md:col-span-2">
              <app-textarea-input
                formControlName="addressNotes"
                [label]="'patient.notes'"
                [rows]="3"
                prefixIcon="document-text"
              ></app-textarea-input>
            </div>
          </div>
        </div>

        <!-- Medical Notes -->
        <div class="border-t pt-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ 'patient.medicalInfo' | translate }}</h3>
          <div>
            <app-textarea-input
              formControlName="medicalNotes"
              [label]="'patient.medicalNotes'"
              [placeholder]="'placeholder.medicalNotes'"
              [rows]="4"
              prefixIcon="document-text"
            ></app-textarea-input>
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

  // Radio options for gender
  genderOptions: Array<{ value: any; label: string }> = [
    { value: 'male', label: 'form.gender.male' },
    { value: 'female', label: 'form.gender.female' }
  ];
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
