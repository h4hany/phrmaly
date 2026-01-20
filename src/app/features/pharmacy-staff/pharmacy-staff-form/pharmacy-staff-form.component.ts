import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PharmacyStaffService } from '../../../core/services/pharmacy-staff.service';
import { PharmacyContextService } from '../../../core/services/pharmacy-context.service';
import { FormWrapperComponent } from '../../../shared/components/form-wrapper/form-wrapper.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TextInputComponent } from '../../../shared/components/input/text-input.component';
import { TextareaInputComponent } from '../../../shared/components/input/textarea-input.component';
import { RadioInputComponent } from '../../../shared/components/input/radio-input.component';
import { AutocompleteInputComponent, AutocompleteOption } from '../../../shared/components/input/autocomplete-input.component';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-pharmacy-staff-form',
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
    <app-form-wrapper [title]="isEdit ? ('staff.edit' | translate) : ('staff.add' | translate)">
      @if (errorMessage) {
        <app-alert type="error" [title]="errorMessage" />
      }

      <form [formGroup]="staffForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <app-text-input
              type="text"
              formControlName="fullName"
              label="Full Name"
              [required]="true"
              [hasError]="!!(staffForm.get('fullName')?.invalid && staffForm.get('fullName')?.touched)"
              [errorMessage]="(staffForm.get('fullName')?.invalid && staffForm.get('fullName')?.touched) ? 'Full name is required' : undefined"
              prefixIcon="user"
            ></app-text-input>
          </div>

          <div>
            <app-text-input
              type="email"
              formControlName="email"
              label="Email"
              [required]="true"
              [hasError]="!!(staffForm.get('email')?.invalid && staffForm.get('email')?.touched)"
              [errorMessage]="(staffForm.get('email')?.invalid && staffForm.get('email')?.touched) ? 'Valid email is required' : undefined"
              prefixIcon="mail"
            ></app-text-input>
          </div>

          <div>
            <app-text-input
              type="tel"
              formControlName="phone"
              label="Phone"
              prefixIcon="phone"
            ></app-text-input>
          </div>

          <div>
            <app-text-input
              type="text"
              formControlName="username"
              label="Username"
              prefixIcon="user"
            ></app-text-input>
          </div>

          <div>
            <app-autocomplete-input
              formControlName="role"
              label="Role"
              [required]="true"
              [options]="roleOptions"
              [placeholder]="'form.selectStatus'"
              prefixIcon="id-badge"
              [hasError]="!!(staffForm.get('role')?.invalid && staffForm.get('role')?.touched)"
              [errorMessage]="(staffForm.get('role')?.invalid && staffForm.get('role')?.touched) ? 'Role is required' : undefined"
            ></app-autocomplete-input>
          </div>

          <div>
            <app-radio-input
              formControlName="status"
              [label]="'staff.status'"
              [radioOptions]="statusOptions"
            ></app-radio-input>
          </div>

          <div class="md:col-span-2">
            <app-textarea-input
              formControlName="notes"
              label="Notes"
              [rows]="3"
              prefixIcon="document-text"
            ></app-textarea-input>
          </div>
        </div>

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
            [disabled]="staffForm.invalid"
          >
            {{ isEdit ? ('staff.update' | translate) : ('staff.create' | translate) }}
          </app-button>
        </div>
      </form>
    </app-form-wrapper>
  `,
  styles: []
})
export class PharmacyStaffFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private pharmacyStaffService = inject(PharmacyStaffService);
  private pharmacyContext = inject(PharmacyContextService);

  staffForm!: FormGroup;
  loading = false;
  errorMessage = '';
  isEdit = false;
  staffId: string | null = null;
  roleOptions: AutocompleteOption[] = [
    { value: 'account_owner', label: 'staff.accountOwner' },
    { value: 'pharmacy_manager', label: 'staff.pharmacyManager' },
    { value: 'pharmacy_staff', label: 'staff.pharmacyStaff' }
  ];
  statusOptions: Array<{ value: any; label: string }> = [
    { value: 'active', label: 'common.active' },
    { value: 'inactive', label: 'common.inactive' }
  ];

  ngOnInit(): void {
    this.staffId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.staffId && this.route.snapshot.url[this.route.snapshot.url.length - 1]?.path === 'edit';

    const pharmacy = this.pharmacyContext.getCurrentPharmacy();
    const pharmacyId = pharmacy?.id || 'ph1';

    this.staffForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      username: [''],
      role: ['', [Validators.required]],
      status: ['active'],
      notes: ['']
    });

    if (this.isEdit && this.staffId) {
      this.loadStaff();
    }
  }

  private loadStaff(): void {
    this.loading = true;
    this.pharmacyStaffService.getById(this.staffId!).subscribe({
      next: (staff) => {
        if (staff) {
          this.staffForm.patchValue({
            fullName: staff.fullName,
            email: staff.email,
            phone: staff.phone || '',
            username: staff.username || '',
            role: staff.role,
            status: staff.status,
            notes: ''
          });
        }
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load staff member';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.staffForm.invalid) {
      this.staffForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const pharmacy = this.pharmacyContext.getCurrentPharmacy();
    const pharmacyId = pharmacy?.id || 'ph1';

    const formValue = {
      ...this.staffForm.value,
      pharmacyId
    };

    const operation = this.isEdit
      ? this.pharmacyStaffService.update(this.staffId!, formValue)
      : this.pharmacyStaffService.create(formValue);

    operation.subscribe({
      next: () => {
        this.router.navigate(['/pharmacy-staff']);
      },
      error: () => {
        this.errorMessage = this.isEdit ? 'Failed to update staff member' : 'Failed to create staff member';
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/pharmacy-staff']);
  }
}





