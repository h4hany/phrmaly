import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, FormControl, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ModernFormWrapperComponent } from '../../../shared/components/modern-form-wrapper/modern-form-wrapper.component';
import { FormSectionComponent } from '../../../shared/components/form-section/form-section.component';
import { TextInputComponent } from '../../../shared/components/input/text-input.component';
import { CheckboxInputComponent } from '../../../shared/components/input/checkbox-input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { AuthService } from '../../../core/services/auth.service';

interface ModulePermission {
  module: string;
  permissions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    actions: boolean;
  };
}

@Component({
  selector: 'app-modules-permissions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ModernFormWrapperComponent,
    FormSectionComponent,
    TextInputComponent,
    CheckboxInputComponent,
    ButtonComponent,
    TranslatePipe
  ],
  template: `
    <app-modern-form-wrapper
      [title]="'modulesPermissions.title'"
      [description]="'modulesPermissions.description'"
      [errorMessage]="errorMessage"
    >
      <form [formGroup]="modulesForm" (ngSubmit)="onSubmit()" class="p-8">
        <!-- Modules Section with Grid Layout -->
        <app-form-section [title]="'modulesPermissions.existingModules'">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Add New Module Card (First Card) -->
            <div class="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary transition-all duration-200 flex flex-col">
              <h4 class="text-lg font-semibold text-gray-800 mb-4">
                {{ 'modulesPermissions.addNewModule' | translate }}
              </h4>
              <div class="flex-1 flex flex-col">
                <div class="mb-4">
                  <app-text-input
                    type="text"
                    formControlName="newModuleName"
                    [label]="'modulesPermissions.moduleName'"
                    [required]="false"
                    [placeholder]="'modulesPermissions.moduleNamePlaceholder'"
                    prefixIcon="grid"
                  ></app-text-input>
                </div>
                <div class="mt-auto">
                  <app-button
                    type="button"
                    variant="primary"
                    size="md"
                    [fullWidth]="true"
                    [disabled]="!modulesForm.get('newModuleName')?.valid || loading"
                    (onClick)="addNewModule()"
                  >
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    {{ 'modulesPermissions.addModule' | translate }}
                  </app-button>
                </div>
              </div>
            </div>

            <!-- Existing Modules Cards -->
            <div formArrayName="modules" class="contents">
              @if (modulesArray && modulesArray.controls.length > 0) {
                @for (moduleGroup of modulesArray.controls; track $index; let i = $index) {
                <div [formGroupName]="i" class="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div class="flex items-center justify-between mb-4">
                    <h4 class="text-lg font-semibold text-gray-800">
                      {{ getModuleName(moduleGroup.get('module')?.value) | translate }}
                    </h4>
                    <button
                      type="button"
                      class="delete-icon-btn p-2 rounded-lg transition-all duration-200 opacity-80 hover:opacity-100 text-gray-600"
                      (click)="removeModule(i)"
                      [title]="'common.delete' | translate"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div class="space-y-3">
                    <app-checkbox-input
                      [formControl]="getPermissionControl(moduleGroup, 'view')"
                      [checkboxOptions]="[{ value: true, label: 'modulesPermissions.permissions.view' }]"
                      [label]="''"
                    ></app-checkbox-input>
                    <app-checkbox-input
                      [formControl]="getPermissionControl(moduleGroup, 'create')"
                      [checkboxOptions]="[{ value: true, label: 'modulesPermissions.permissions.create' }]"
                      [label]="''"
                    ></app-checkbox-input>
                    <app-checkbox-input
                      [formControl]="getPermissionControl(moduleGroup, 'edit')"
                      [checkboxOptions]="[{ value: true, label: 'modulesPermissions.permissions.edit' }]"
                      [label]="''"
                    ></app-checkbox-input>
                    <app-checkbox-input
                      [formControl]="getPermissionControl(moduleGroup, 'delete')"
                      [checkboxOptions]="[{ value: true, label: 'modulesPermissions.permissions.delete' }]"
                      [label]="''"
                    ></app-checkbox-input>
                    <app-checkbox-input
                      [formControl]="getPermissionControl(moduleGroup, 'actions')"
                      [checkboxOptions]="[{ value: true, label: 'modulesPermissions.permissions.actions' }]"
                      [label]="''"
                    ></app-checkbox-input>
                  </div>
                </div>
                }
              }
            </div>
          </div>
        </app-form-section>

        <!-- Form Actions -->
        <div class="flex items-center justify-end gap-4 pt-8 border-t-2 border-gray-100">
          <app-button
            type="button"
            variant="outline"
            size="lg"
            (onClick)="onCancel()"
          >
            {{ 'common.cancel' | translate }}
          </app-button>
          <app-button
            type="submit"
            variant="primary"
            size="lg"
            [disabled]="modulesForm.invalid || loading"
            [loading]="loading"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ 'common.save' | translate }}
          </app-button>
        </div>
      </form>
    </app-modern-form-wrapper>
  `,
  styles: [`
    .delete-icon-btn {
      background: transparent;
      color: rgb(107, 114, 128);
    }
    
    .delete-icon-btn:hover {
      background: var(--primary-bg);
      color: var(--primary-text);
    }
  `]
})
export class ModulesPermissionsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  modulesForm!: FormGroup;
  loading = false;
  errorMessage = '';

  get modulesArray(): FormArray {
    return this.modulesForm.get('modules') as FormArray;
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadModules();
  }

  initializeForm(): void {
    this.modulesForm = this.fb.group({
      modules: this.fb.array([]),
      newModuleName: ['', [Validators.minLength(2)]]
    });
  }

  loadModules(): void {
    // Load mock data first, then extract from permissions
    const mockModules = this.getMockModulesData();
    
    // Create form groups for each module from mock data
    mockModules.forEach(moduleData => {
      this.addModuleFormGroup(moduleData.module, moduleData.permissions);
    });
  }

  getMockModulesData(): ModulePermission[] {
    // Mock data for modules and permissions
    return [
      {
        module: 'dashboard',
        permissions: { view: true, create: false, edit: false, delete: false, actions: false }
      },
      {
        module: 'patients',
        permissions: { view: true, create: true, edit: true, delete: true, actions: true }
      },
      {
        module: 'staff',
        permissions: { view: true, create: true, edit: true, delete: false, actions: true }
      },
      {
        module: 'drugs',
        permissions: { view: true, create: true, edit: true, delete: true, actions: false }
      },
      {
        module: 'bundles',
        permissions: { view: true, create: true, edit: true, delete: true, actions: false }
      },
      {
        module: 'inventory',
        permissions: { view: true, create: false, edit: true, delete: false, actions: true }
      },
      {
        module: 'purchases',
        permissions: { view: true, create: true, edit: true, delete: false, actions: true }
      },
      {
        module: 'suppliers',
        permissions: { view: true, create: true, edit: true, delete: true, actions: false }
      },
      {
        module: 'invoices',
        permissions: { view: true, create: true, edit: true, delete: false, actions: true }
      },
      {
        module: 'vouchers',
        permissions: { view: true, create: true, edit: true, delete: false, actions: true }
      },
      {
        module: 'payments',
        permissions: { view: true, create: false, edit: false, delete: false, actions: true }
      },
      {
        module: 'audit',
        permissions: { view: true, create: false, edit: false, delete: false, actions: false }
      },
      {
        module: 'settings',
        permissions: { view: true, create: false, edit: true, delete: false, actions: false }
      },
      {
        module: 'system',
        permissions: { view: true, create: false, edit: true, delete: false, actions: true }
      },
      {
        module: 'reports',
        permissions: { view: true, create: false, edit: false, delete: false, actions: false }
      },
      {
        module: 'referrals',
        permissions: { view: true, create: true, edit: false, delete: false, actions: false }
      },
      {
        module: 'attendance',
        permissions: { view: true, create: true, edit: true, delete: false, actions: false }
      },
      {
        module: 'payroll',
        permissions: { view: true, create: false, edit: true, delete: false, actions: false }
      },
      {
        module: 'performance',
        permissions: { view: true, create: false, edit: true, delete: false, actions: false }
      },
      {
        module: 'training',
        permissions: { view: true, create: true, edit: true, delete: false, actions: false }
      }
    ];
  }

  getAllPermissions(): string[] {
    // Get all permissions from all roles in getMockPermissionContext
    const allPermissions: string[] = [];
    
    // Extract from ACCOUNT_OWNER role (most comprehensive)
    const accountOwnerPermissions = [
      'dashboard.view',
      'patients.view', 'patients.kpi.view', 'patients.orders.view',
      'patients.loyalty.view', 'patients.revenue.view', 'patients.vouchers.view',
      'staff.view', 'staff.details.view', 'staff.performance.view',
      'staff.risk.view', 'staff.activity.view',
      'attendance.view', 'payroll.view', 'performance.view', 'training.view',
      'drugs.view', 'drugs.create',
      'bundles.view',
      'inventory.alerts.view', 'inventory.map.view', 'inventory.transfers.view',
      'inventory.movements.view', 'inventory.requested.view',
      'purchases.view', 'purchases.create', 'suppliers.view',
      'invoices.view', 'invoices.create', 'invoices.edit', 'invoices.actions',
      'audit.view', 'payments.view', 'payments.methods.manage',
      'referrals.view',
      'settings.view', 'settings.account.view',
      'system.permissions.manage', 'system.features.manage',
      'system.automation.manage', 'system.migration.manage',
      'reports.view',
      'vouchers.view', 'vouchers.create', 'vouchers.edit', 'vouchers.actions',
    ];

    allPermissions.push(...accountOwnerPermissions);
    
    // Add unique permissions from other roles
    const otherPermissions = [
      'inventory.alerts.view', 'inventory.requested.view',
      'inventory.map.view', 'inventory.transfers.view',
    ];
    
    otherPermissions.forEach(perm => {
      if (!allPermissions.includes(perm)) {
        allPermissions.push(perm);
      }
    });

    return allPermissions;
  }

  extractModules(permissions: string[]): string[] {
    const moduleSet = new Set<string>();
    
    permissions.forEach(permission => {
      const parts = permission.split('.');
      if (parts.length > 0) {
        // Handle nested modules like 'inventory.alerts' -> 'inventory'
        const moduleName = parts[0];
        moduleSet.add(moduleName);
      }
    });

    // Add known modules that might not have permissions yet
    const knownModules = [
      'dashboard', 'patients', 'staff', 'attendance', 'payroll', 
      'performance', 'training', 'drugs', 'bundles', 'inventory',
      'purchases', 'suppliers', 'invoices', 'audit', 'payments',
      'referrals', 'settings', 'system', 'reports', 'vouchers'
    ];

    knownModules.forEach(module => moduleSet.add(module));

    return Array.from(moduleSet).sort();
  }

  getModulePermissions(module: string, allPermissions: string[]): { view: boolean; create: boolean; edit: boolean; delete: boolean; actions: boolean } {
    const modulePermissions = allPermissions.filter(p => p.startsWith(module + '.'));
    
    return {
      view: modulePermissions.some(p => p.includes('.view')),
      create: modulePermissions.some(p => p.includes('.create')),
      edit: modulePermissions.some(p => p.includes('.edit')),
      delete: modulePermissions.some(p => p.includes('.delete')),
      actions: modulePermissions.some(p => p.includes('.actions'))
    };
  }

  addModuleFormGroup(module: string, permissions: { view: boolean; create: boolean; edit: boolean; delete: boolean; actions: boolean }): void {
    // Convert boolean to array format for checkbox component
    const moduleGroup = this.fb.group({
      module: [module],
      permissions: this.fb.group({
        view: [permissions.view ? [true] : []],
        create: [permissions.create ? [true] : []],
        edit: [permissions.edit ? [true] : []],
        delete: [permissions.delete ? [true] : []],
        actions: [permissions.actions ? [true] : []]
      })
    });

    this.modulesArray.push(moduleGroup);
  }

  getPermissionControl(moduleGroup: any, permission: string): FormControl {
    const group = moduleGroup as FormGroup;
    const permissionsGroup = group.get('permissions') as FormGroup;
    return permissionsGroup.get(permission) as FormControl;
  }

  addNewModule(): void {
    const moduleName = this.modulesForm.get('newModuleName')?.value?.trim().toLowerCase();
    
    if (!moduleName || moduleName.length < 2) {
      return;
    }

    // Check if module already exists
    const existingModules = this.modulesArray.controls.map(control => 
      control.get('module')?.value
    );

    if (existingModules.includes(moduleName)) {
      this.errorMessage = 'modulesPermissions.moduleExists';
      return;
    }

    // Add new module with all permissions unchecked (empty arrays)
    this.addModuleFormGroup(moduleName, {
      view: false,
      create: false,
      edit: false,
      delete: false,
      actions: false
    });

    // Reset form
    this.modulesForm.patchValue({ newModuleName: '' });
    this.errorMessage = '';
  }

  removeModule(index: number): void {
    this.modulesArray.removeAt(index);
  }

  getModuleName(module: string): string {
    return `modulesPermissions.modules.${module}`;
  }

  onSubmit(): void {
    if (this.modulesForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // Convert array format back to boolean for submission
    const modulesData = this.modulesForm.value.modules.map((m: any) => ({
      module: m.module,
      permissions: {
        view: Array.isArray(m.permissions.view) && m.permissions.view.includes(true),
        create: Array.isArray(m.permissions.create) && m.permissions.create.includes(true),
        edit: Array.isArray(m.permissions.edit) && m.permissions.edit.includes(true),
        delete: Array.isArray(m.permissions.delete) && m.permissions.delete.includes(true),
        actions: Array.isArray(m.permissions.actions) && m.permissions.actions.includes(true)
      }
    }));

    // TODO: Save to backend
    console.log('Modules and Permissions:', modulesData);

    // Simulate API call
    setTimeout(() => {
      this.loading = false;
      // Show success message or navigate
    }, 1000);
  }

  onCancel(): void {
    // Reset to original state - clear existing modules and reload
    while (this.modulesArray.length !== 0) {
      this.modulesArray.removeAt(0);
    }
    this.loadModules();
  }
}

