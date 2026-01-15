import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PharmacyStaffService } from '../../../core/services/pharmacy-staff.service';
import { FormWrapperComponent } from '../../../shared/components/form-wrapper/form-wrapper.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { UserRole } from '../../../core/models/user.model';
import { PharmacyContextService } from '../../../core/services/pharmacy-context.service';

@Component({
  selector: 'app-pharmacy-staff-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormWrapperComponent,
    ButtonComponent,
    AlertComponent,
    TranslatePipe
  ],
  template: `
    <app-form-wrapper [title]="isEdit ? 'Edit Staff Member' : 'Add New Staff Member'">
      @if (errorMessage) {
        <app-alert type="error" [title]="errorMessage" />
      }

      <form [formGroup]="staffForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              formControlName="fullName"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-[#166534]"
              [class.border-red-500]="staffForm.get('fullName')?.invalid && staffForm.get('fullName')?.touched"
            />
            @if (staffForm.get('fullName')?.invalid && staffForm.get('fullName')?.touched) {
              <p class="mt-1 text-sm text-red-600">Full name is required</p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email <span class="text-red-500">*</span>
            </label>
            <input
              type="email"
              formControlName="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-[#166534]"
              [class.border-red-500]="staffForm.get('email')?.invalid && staffForm.get('email')?.touched"
            />
            @if (staffForm.get('email')?.invalid && staffForm.get('email')?.touched) {
              <p class="mt-1 text-sm text-red-600">Valid email is required</p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              formControlName="phone"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-[#166534]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              formControlName="username"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-[#166534]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Role <span class="text-red-500">*</span>
            </label>
            <select
              formControlName="role"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-[#166534]"
              [class.border-red-500]="staffForm.get('role')?.invalid && staffForm.get('role')?.touched"
            >
              <option value="">Select Role</option>
              <option value="pharmacy_manager">Pharmacy Manager</option>
              <option value="pharmacy_staff">Pharmacy Staff</option>
            </select>
            @if (staffForm.get('role')?.invalid && staffForm.get('role')?.touched) {
              <p class="mt-1 text-sm text-red-600">Role is required</p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              formControlName="status"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-[#166534]"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              formControlName="notes"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-[#166534]"
            ></textarea>
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
            {{ isEdit ? 'Update' : 'Create' }} Staff Member
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





