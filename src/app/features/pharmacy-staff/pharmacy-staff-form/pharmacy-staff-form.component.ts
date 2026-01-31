import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PharmacyStaffService, StaffPermissions } from '../../../core/services/pharmacy-staff.service';
import { PharmacyContextService } from '../../../core/services/pharmacy-context.service';
import { ModernFormWrapperComponent } from '../../../shared/components/modern-form-wrapper/modern-form-wrapper.component';
import { FormSectionComponent } from '../../../shared/components/form-section/form-section.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TextInputComponent } from '../../../shared/components/input/text-input.component';
import { TextareaInputComponent } from '../../../shared/components/input/textarea-input.component';
import { RadioInputComponent } from '../../../shared/components/input/radio-input.component';
import { AutocompleteInputComponent, AutocompleteOption } from '../../../shared/components/input/autocomplete-input.component';
import { CheckboxInputComponent } from '../../../shared/components/input/checkbox-input.component';
import { TabsComponent, TabComponent } from '../../../shared/components/tabs/tabs.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-pharmacy-staff-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ModernFormWrapperComponent,
    FormSectionComponent,
    TranslatePipe,
    TextInputComponent,
    TextareaInputComponent,
    RadioInputComponent,
    AutocompleteInputComponent,
    CheckboxInputComponent,
    TabsComponent,
    TabComponent,
    AlertComponent
  ],
  template: `
    <app-modern-form-wrapper
      [title]="(isEdit ? 'staff.edit' : 'staff.add')"
      [description]="(isEdit ? 'form.editStaffDescription' : 'form.addStaffDescription')"
      [errorMessage]="errorMessage"
    >
      <form [formGroup]="staffForm" (ngSubmit)="onSubmit()" class="p-8">
        <!-- Personal Information Section -->
        <app-form-section [title]="'staff.personalInfo'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <app-text-input
                type="text"
                formControlName="fullName"
                [label]="'patient.fullName'"
                [required]="true"
                [hasError]="!!(staffForm.get('fullName')?.invalid && staffForm.get('fullName')?.touched)"
                [errorMessage]="(staffForm.get('fullName')?.invalid && staffForm.get('fullName')?.touched) ? 'validation.fullNameRequired' : undefined"
                prefixIcon="user"
              ></app-text-input>
            </div>

            <div>
              <app-text-input
                type="email"
                formControlName="email"
                [label]="'patient.email'"
                [required]="true"
                [hasError]="!!(staffForm.get('email')?.invalid && staffForm.get('email')?.touched)"
                [errorMessage]="(staffForm.get('email')?.invalid && staffForm.get('email')?.touched) ? 'validation.emailInvalid' : undefined"
                prefixIcon="mail"
              ></app-text-input>
            </div>

            <div>
              <app-text-input
                type="tel"
                formControlName="phone"
                [label]="'patient.phone'"
                prefixIcon="phone"
              ></app-text-input>
            </div>

            <div>
              <app-text-input
                type="text"
                formControlName="username"
                [label]="'staff.username'"
                prefixIcon="user"
              ></app-text-input>
            </div>
          </div>
        </app-form-section>

        <!-- Role & Status Section -->
        <app-form-section [title]="'staff.roleAndStatus'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <app-autocomplete-input
                formControlName="role"
                [label]="'staff.role'"
                [required]="true"
                [options]="roleOptions"
                [placeholder]="'form.selectRole'"
                prefixIcon="id-badge"
                [hasError]="!!(staffForm.get('role')?.invalid && staffForm.get('role')?.touched)"
                [errorMessage]="(staffForm.get('role')?.invalid && staffForm.get('role')?.touched) ? 'validation.roleRequired' : undefined"
              ></app-autocomplete-input>
            </div>

            <div>
              <app-radio-input
                formControlName="status"
                [label]="'staff.status'"
                [radioOptions]="statusOptions"
              ></app-radio-input>
            </div>
          </div>
        </app-form-section>

        <!-- Notes Section -->
        <app-form-section [title]="'form.staff.notes'">
          <div>
            <app-textarea-input
              formControlName="notes"
              [label]="'form.staff.notes'"
              [rows]="3"
              prefixIcon="document-text"
            ></app-textarea-input>
          </div>
        </app-form-section>

        <!-- Permissions Section (Only in Edit Mode) -->
        @if (isEdit) {
          <app-form-section [title]="'staff.permissions'">
            @if (loadingPermissions) {
              <div class="text-center py-12">
                <p class="text-[var(--card-text)]">{{ 'common.loading' | translate }}</p>
              </div>
            } @else if (permissionsError) {
              <app-alert type="error" [title]="permissionsError" />
            } @else if (staffPermissions) {
              <form [formGroup]="permissionsForm" (ngSubmit)="savePermissions()">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  @for (module of staffPermissions.modules; track module.moduleCode) {
                    <div class="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <h4 class="text-lg font-semibold text-gray-800 mb-4">
                        {{ module.moduleName }}
                      </h4>
                      <div class="space-y-3">
                        @for (permission of module.permissions; track permission.permissionId) {
                          <app-checkbox-input
                            [formControl]="getPermissionControl(permission.permissionId)"
                            [checkboxOptions]="[{ value: true, label: getPermissionLabel(permission.permissionKey) }]"
                            [label]="''"
                          ></app-checkbox-input>
                        }
                      </div>
                    </div>
                  }
                </div>
                <div class="flex items-center justify-end gap-4 pt-8 border-t-2 border-gray-100 mt-6">
                  <button
                    type="button"
                    (click)="cancelPermissionsEdit()"
                    class="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                  >
                    {{ 'common.cancel' | translate }}
                  </button>
                  <button
                    type="submit"
                    [disabled]="permissionsForm.invalid || savingPermissions"
                    class="px-6 py-3 rounded-xl font-semibold hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none transition-all duration-200 flex items-center gap-2"
                    [style.background]="'var(--primary-bg)'"
                    [style.color]="'var(--primary-text)'"
                  >
                    @if (savingPermissions) {
                      <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    } @else {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    }
                    {{ 'common.save' | translate }}
                  </button>
                </div>
              </form>
            }
          </app-form-section>
        }

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
            [disabled]="staffForm.invalid || loading"
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
            {{ (isEdit ? 'staff.update' : 'staff.create') | translate }}
          </button>
        </div>
      </form>
    </app-modern-form-wrapper>
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
  permissionsForm!: FormGroup;
  loading = false;
  errorMessage = '';
  isEdit = false;
  staffId: string | null = null;
  
  // Permissions
  staffPermissions: StaffPermissions | null = null;
  loadingPermissions = false;
  permissionsError = '';
  savingPermissions = false;
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
      this.loadPermissions();
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
        this.errorMessage = 'error.loadStaff';
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
        this.errorMessage = this.isEdit ? 'error.updateStaff' : 'error.createStaff';
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/pharmacy-staff']);
  }

  loadPermissions(): void {
    if (!this.staffId) return;
    
    const currentPharmacy = this.pharmacyContext.getCurrentPharmacy();
    if (!currentPharmacy) {
      this.permissionsError = 'No pharmacy selected';
      return;
    }

    this.loadingPermissions = true;
    this.permissionsError = '';
    
    this.pharmacyStaffService.getPermissions(this.staffId, currentPharmacy.id).subscribe({
      next: (permissions) => {
        this.staffPermissions = permissions;
        this.initializePermissionsForm(permissions);
        this.loadingPermissions = false;
      },
      error: (error) => {
        this.permissionsError = error.message || 'Failed to load permissions';
        this.loadingPermissions = false;
      }
    });
  }

  initializePermissionsForm(permissions: StaffPermissions): void {
    const formControls: { [key: string]: FormControl } = {};
    
    permissions.modules.forEach(module => {
      module.permissions.forEach(permission => {
        formControls[permission.permissionId] = new FormControl(permission.isGranted);
      });
    });

    this.permissionsForm = this.fb.group(formControls);
  }

  getPermissionControl(permissionId: string): FormControl {
    return this.permissionsForm.get(permissionId) as FormControl;
  }

  savePermissions(): void {
    if (!this.staffId || !this.staffPermissions) return;

    const currentPharmacy = this.pharmacyContext.getCurrentPharmacy();
    if (!currentPharmacy) {
      this.permissionsError = 'No pharmacy selected';
      return;
    }

    const selectedPermissionIds: string[] = [];
    Object.keys(this.permissionsForm.controls).forEach(permissionId => {
      if (this.permissionsForm.get(permissionId)?.value) {
        selectedPermissionIds.push(permissionId);
      }
    });

    this.savingPermissions = true;
    this.permissionsError = '';

    this.pharmacyStaffService.updatePermissions(this.staffId, currentPharmacy.id, selectedPermissionIds).subscribe({
      next: () => {
        this.savingPermissions = false;
        // Reload permissions to reflect changes
        this.loadPermissions();
      },
      error: (error) => {
        this.permissionsError = error.message || 'Failed to update permissions';
        this.savingPermissions = false;
      }
    });
  }

  cancelPermissionsEdit(): void {
    if (this.staffPermissions) {
      this.initializePermissionsForm(this.staffPermissions);
    }
  }

  getPermissionLabel(permissionKey: string): string {
    // Extract action from permission key (e.g., "dashboard.read" -> "read")
    const parts = permissionKey.split('.');
    if (parts.length > 1) {
      return parts[parts.length - 1]; // Return the last part (action)
    }
    return permissionKey;
  }
}
