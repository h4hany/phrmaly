import { Component, inject, OnInit, signal, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { PlatformAccountsService, TenantAccountDetail, TenantStaff, TenantPharmacy } from '../../../../core/services/platform-accounts.service';
import { PlatformModulesService, PlatformModule } from '../../../../core/services/platform-modules.service';
import { ModernFormWrapperComponent } from '../../../../shared/components/modern-form-wrapper/modern-form-wrapper.component';
import { FormSectionComponent } from '../../../../shared/components/form-section/form-section.component';
import { TextInputComponent } from '../../../../shared/components/input/text-input.component';
import { CheckboxInputComponent } from '../../../../shared/components/input/checkbox-input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { TableComponent, TableColumn } from '../../../../shared/components/table/table.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { PaginatedResponse } from '../../../../core/models/common.model';

@Component({
  selector: 'app-edit-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModernFormWrapperComponent,
    FormSectionComponent,
    TextInputComponent,
    CheckboxInputComponent,
    ButtonComponent,
    TableComponent,
    ModalComponent,
    TranslatePipe
  ],
  template: `
    <app-modern-form-wrapper
      [title]="'platform.accounts.editAccount'"
      [description]="'platform.accounts.editAccountDescription'"
      [errorMessage]="errorMessage() || undefined"
    >
      <div class="p-8 space-y-8">
        @if (loading()) {
          <div class="text-center py-12">
            <p class="text-gray-500">{{ 'common.loading' | translate }}</p>
          </div>
        } @else if (account()) {
          <!-- Account Information -->
          <app-form-section [title]="'platform.accounts.accountInformation'">
            <form [formGroup]="accountForm" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <app-text-input
                formControlName="name"
                [label]="'platform.accounts.name'"
                [required]="true"
                prefixIcon="building"
              />
              <app-text-input
                formControlName="email"
                [label]="'platform.accounts.email'"
                type="email"
                [required]="true"
                prefixIcon="mail"
              />
              <app-text-input
                formControlName="phone"
                [label]="'platform.accounts.phone'"
                type="tel"
                prefixIcon="phone"
              />
              <app-text-input
                formControlName="website"
                [label]="'platform.accounts.website'"
                type="text"
                prefixIcon="globe"
              />
              <app-text-input
                formControlName="slug"
                [label]="'platform.accounts.slug'"
                [readonly]="true"
                prefixIcon="tag"
              />
              <app-text-input
                formControlName="subdomain"
                [label]="'platform.accounts.subdomain'"
                [readonly]="true"
                prefixIcon="link"
              />
            </form>
          </app-form-section>

          <!-- Enabled Modules -->
          <app-form-section [title]="'platform.accounts.enabledModules'">
            <form [formGroup]="accountForm">
              @if (allModules().length > 0) {
                <app-checkbox-input
                  [checkboxOptions]="moduleOptions()"
                  formControlName="enabledModules"
                  [label]="'platform.accounts.selectModules'"
                />
              } @else {
                <p class="text-gray-500">{{ 'platform.accounts.loadingModules' | translate }}</p>
              }
            </form>
          </app-form-section>

          <!-- Staff Table -->
          <app-form-section [title]="'platform.accounts.staff'">
            <app-table
              [columns]="staffColumns"
              [data]="staff()"
              [pagination]="staffPagination()"
              [loading]="staffLoading()"
              [emptyMessage]="'platform.accounts.noStaff' | translate"
              (onPageChange)="onStaffPageChange($event)"
            >
              <ng-template #actionTemplate let-row>
                <div class="flex items-center gap-2">
                  <button
                    (click)="editStaff(row); $event.stopPropagation()"
                    class="px-3 py-1.5 text-sm text-[var(--text-primary)] hover:opacity-80 rounded-md transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </ng-template>
            </app-table>
          </app-form-section>

          <!-- Pharmacies Table -->
          <app-form-section [title]="'platform.accounts.pharmacies'">
            <app-table
              [columns]="pharmacyColumns"
              [data]="pharmacies()"
              [pagination]="pharmacyPagination()"
              [loading]="pharmacyLoading()"
              [emptyMessage]="'platform.accounts.noPharmacies' | translate"
              (onPageChange)="onPharmacyPageChange($event)"
            >
              <ng-template #actionTemplate let-row>
                <div class="flex items-center gap-2">
                  <button
                    (click)="editPharmacy(row); $event.stopPropagation()"
                    class="px-3 py-1.5 text-sm text-[var(--text-primary)] hover:opacity-80 rounded-md transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </ng-template>
            </app-table>
          </app-form-section>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <app-button
              variant="outline"
              (onClick)="goBack()"
            >
              {{ 'common.back' | translate }}
            </app-button>
            <app-button
              variant="primary"
              [loading]="saving()"
              (onClick)="save()"
            >
              {{ 'common.save' | translate }}
            </app-button>
          </div>
        }
      </div>
    </app-modern-form-wrapper>

    <!-- Staff Edit Modal -->
    <app-modal
      #staffModal
      [title]="'platform.accounts.editStaff'"
      [size]="'large'"
              (confirmed)="saveStaff()"
    >
      @if (selectedStaff()) {
        <form [formGroup]="staffForm" class="space-y-4">
          <app-text-input
            formControlName="fullName"
            [label]="'platform.accounts.fullName'"
            [required]="true"
          />
          <app-text-input
            formControlName="email"
            [label]="'platform.accounts.email'"
            type="email"
            [required]="true"
          />
          <app-text-input
            formControlName="phone"
            [label]="'platform.accounts.phone'"
            type="tel"
          />
        </form>
      }
    </app-modal>

    <!-- Pharmacy Edit Modal -->
    <app-modal
      #pharmacyModal
      [title]="'platform.accounts.editPharmacy'"
      [size]="'large'"
              (confirmed)="savePharmacy()"
    >
      @if (selectedPharmacy()) {
        <form [formGroup]="pharmacyForm" class="space-y-4">
          <app-text-input
            formControlName="name"
            [label]="'platform.accounts.pharmacyName'"
            [required]="true"
          />
          <app-text-input
            formControlName="address"
            [label]="'platform.accounts.address'"
          />
        </form>
      }
    </app-modal>

  `,
  styles: []
})
export class EditAccountComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private accountsService = inject(PlatformAccountsService);
  private modulesService = inject(PlatformModulesService);
  private fb = inject(FormBuilder);

  accountId = signal<string>('');
  account = signal<TenantAccountDetail | null>(null);
  loading = signal(true);
  saving = signal(false);
  errorMessage = signal<string | null>(null);
  allModules = signal<PlatformModule[]>([]);
  moduleOptions = signal<Array<{ value: string; label: string }>>([]);

  accountForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    website: [''],
    slug: [''],
    subdomain: [''],
    enabledModules: [[]]
  });

  staff = signal<TenantStaff[]>([]);
  staffLoading = signal(false);
  staffPagination = signal({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });
  staffColumns: TableColumn[] = [
    { key: 'fullName', label: 'platform.accounts.fullName', sortable: true },
    { key: 'email', label: 'platform.accounts.email', sortable: true },
    { key: 'username', label: 'platform.accounts.username', sortable: true },
    { key: 'status', label: 'platform.accounts.status', sortable: true },
    { key: 'actions', label: 'common.actions', sortable: false }
  ];
  selectedStaff = signal<TenantStaff | null>(null);
  staffForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['']
  });

  pharmacies = signal<TenantPharmacy[]>([]);
  pharmacyLoading = signal(false);
  pharmacyPagination = signal({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });
  pharmacyColumns: TableColumn[] = [
    { key: 'name', label: 'platform.accounts.pharmacyName', sortable: true },
    { key: 'address', label: 'platform.accounts.address', sortable: true },
    { key: 'areaName', label: 'platform.accounts.area', sortable: true },
    { key: 'actions', label: 'common.actions', sortable: false }
  ];
  selectedPharmacy = signal<TenantPharmacy | null>(null);
  pharmacyForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    address: ['']
  });

  @ViewChild('staffModal') staffModal!: ModalComponent;
  @ViewChild('pharmacyModal') pharmacyModal!: ModalComponent;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.accountId.set(id);
      this.loadModules();
      this.loadAccount();
      this.loadStaff();
      this.loadPharmacies();
    } else {
      this.errorMessage.set('Account ID is required');
      this.loading.set(false);
    }
  }

  loadModules(): void {
    this.modulesService.getAll({ page: 1, pageSize: 100 }).subscribe({
      next: (response) => {
        this.allModules.set(response.data);
        this.moduleOptions.set(
          response.data.map(m => ({
            value: m.code,
            label: m.name
          }))
        );
      },
      error: (error) => {
        console.error('Error loading modules:', error);
      }
    });
  }

  loadAccount(): void {
    this.loading.set(true);
    this.accountsService.getAccountDetail(this.accountId()).subscribe({
      next: (account) => {
        if (account) {
          this.account.set({
            id: account.id,
            name: account.name || '',
            slug: account.slug || '',
            subdomain: account.subdomain || '',
            email: account.email || '',
            phone: account.phone,
            website: account.website,
            logoUrl: account.logoUrl,
            contractUrl: account.contractUrl,
            status: account.status || '',
            enabledModules: account.enabledModules || [],
            latestSubscription: account.latestSubscription,
            createdAt: account.createdAt?.toString() || '',
            updatedAt: account.updatedAt?.toString() || ''
          } as TenantAccountDetail);
          this.accountForm.patchValue({
            name: account.name,
            email: account.email,
            phone: account.phone || '',
            website: account.website || '',
            slug: account.slug || '',
            subdomain: account.subdomain || '',
            enabledModules: account.enabledModules || []
          });
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Failed to load account');
        this.loading.set(false);
      }
    });
  }

  loadStaff(): void {
    this.staffLoading.set(true);
    this.accountsService.getAccountStaff(this.accountId(), {
      page: this.staffPagination().page,
      pageSize: this.staffPagination().pageSize
    }).subscribe({
      next: (response: PaginatedResponse<TenantStaff>) => {
        this.staff.set(response.data);
        this.staffPagination.set({
          page: response.page,
          pageSize: response.pageSize,
          total: response.total,
          totalPages: response.totalPages
        });
        this.staffLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading staff:', error);
        this.staffLoading.set(false);
      }
    });
  }

  loadPharmacies(): void {
    this.pharmacyLoading.set(true);
    this.accountsService.getAccountPharmacies(this.accountId(), {
      page: this.pharmacyPagination().page,
      pageSize: this.pharmacyPagination().pageSize
    }).subscribe({
      next: (response: PaginatedResponse<TenantPharmacy>) => {
        this.pharmacies.set(response.data);
        this.pharmacyPagination.set({
          page: response.page,
          pageSize: response.pageSize,
          total: response.total,
          totalPages: response.totalPages
        });
        this.pharmacyLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading pharmacies:', error);
        this.pharmacyLoading.set(false);
      }
    });
  }

  onStaffPageChange(page: number): void {
    this.staffPagination.update(p => ({ ...p, page }));
    this.loadStaff();
  }

  onPharmacyPageChange(page: number): void {
    this.pharmacyPagination.update(p => ({ ...p, page }));
    this.loadPharmacies();
  }

  editStaff(staff: TenantStaff): void {
    this.selectedStaff.set(staff);
    this.staffForm.patchValue({
      fullName: staff.fullName,
      email: staff.email,
      phone: staff.phone || ''
    });
    this.staffModal.open();
  }

  editPharmacy(pharmacy: TenantPharmacy): void {
    this.selectedPharmacy.set(pharmacy);
    this.pharmacyForm.patchValue({
      name: pharmacy.name,
      address: pharmacy.address || ''
    });
    this.pharmacyModal.open();
  }

  saveStaff(): void {
    if (this.staffForm.valid && this.selectedStaff()) {
      // TODO: Implement staff update API call
      console.log('Save staff:', this.staffForm.value);
      this.staffModal.close();
      this.loadStaff(); // Reload staff list
    }
  }

  savePharmacy(): void {
    if (this.pharmacyForm.valid && this.selectedPharmacy()) {
      // TODO: Implement pharmacy update API call
      console.log('Save pharmacy:', this.pharmacyForm.value);
      this.pharmacyModal.close();
      this.loadPharmacies(); // Reload pharmacies list
    }
  }

  save(): void {
    if (this.accountForm.invalid) {
      this.errorMessage.set('Please fill in all required fields');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const enabledModules = this.accountForm.get('enabledModules')?.value || [];
    
    this.accountsService.updateAccountModules(this.accountId(), enabledModules).subscribe({
      next: (updatedAccount) => {
        this.account.set(updatedAccount);
        this.saving.set(false);
        // Optionally show success message
        this.loadAccount(); // Reload to get latest data
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Failed to update account modules');
        this.saving.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/super-admin/accounts']);
  }
}

