import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { WizardComponent, WizardStep } from '../../../../shared/components/wizard/wizard.component';
import { TextInputComponent } from '../../../../shared/components/input/text-input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { SelectableCardComponent } from '../../../../shared/components/selectable-card/selectable-card.component';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { FileUploadComponent } from '../../../../shared/components/file-input/file-upload.component';
import { PlatformSubscriptionsService } from '../../../../core/services/platform-subscriptions.service';
import { PlatformAccountsService } from '../../../../core/services/platform-accounts.service';
import { SubscriptionPlan } from '../../../../core/models/platform.model';

interface PharmacyFormData {
  name: string;
  address: string;
  city: string;
  area: string;
  country: string;
  lat: number;
  long: number;
  manager: {
    fullName: string;
    email: string;
    password: string;
  };
}

interface Module {
  id: string;
  name: string;
  nameKey: string;
  description: string;
  descriptionKey: string;
  capabilities: string[];
  capabilitiesKey: string;
  pricePerMonth: number;
}

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    WizardComponent,
    TextInputComponent,
    ButtonComponent,
    TranslatePipe,
    SelectableCardComponent,
    FileUploadComponent
  ],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <app-wizard
        [steps]="wizardSteps"
        [currentStep]="currentStep"
        [errorMessage]="errorMessage"
        (stepChange)="onStepChange($event)"
      >
        <!-- Step 1: Select Plan -->
        @if (currentStep === 1) {
          <div class="p-8">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              @for (plan of plans; track plan.id) {
                <app-selectable-card
                  [selected]="selectedPlan?.id === plan.id"
                  (cardClick)="selectPlan(plan)"
                >
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-gray-900">{{ plan.name }}</h3>
                  </div>
                  <p class="text-gray-600 mb-4">{{ plan.description }}</p>
                  <div class="space-y-2 mb-4">
                    <div class="flex items-center text-sm text-gray-700">
                      <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {{ plan.maxPharmacies === -1 ? ('account.create.unlimitedPharmacies' | translate) : (plan.maxPharmacies + ' ' + ('account.create.pharmacies' | translate)) }}
                    </div>
                    <div class="flex items-center text-sm text-gray-700">
                      <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {{ plan.maxStaff === -1 ? ('account.create.unlimitedStaff' | translate) : (plan.maxStaff + ' ' + ('account.create.staff' | translate)) }}
                    </div>
                  </div>
                  <div class="text-2xl font-bold text-gray-900">
                    {{ plan.price }}<span class="text-sm font-normal text-gray-600">/{{ plan.billingCycle }}</span>
                  </div>
                </app-selectable-card>
              }
            </div>

            <div class="flex items-center justify-end gap-4 pt-8 border-t-2 border-gray-100">
              <app-button variant="outline" (onClick)="onCancel()">
                {{ 'common.cancel' | translate }}
              </app-button>
              <app-button 
                variant="primary" 
                (onClick)="nextStep()"
                [disabled]="!selectedPlan"
              >
                {{ 'common.next' | translate }}
              </app-button>
            </div>
          </div>
        }

        <!-- Step 2: Select Modules -->
        @if (currentStep === 2) {
          <div class="p-8">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              @for (module of modules; track module.id) {
                <app-selectable-card
                  [selected]="isModuleSelected(module)"
                  (cardClick)="toggleModule(module)"
                >
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-gray-900">{{ module.nameKey | translate }}</h3>
                  </div>
                  <p class="text-gray-600 mb-4">{{ module.descriptionKey | translate }}</p>
                  <div class="space-y-2 mb-4">
                    @for (capability of module.capabilities; track capability) {
                      <div class="flex items-center text-sm text-gray-700">
                        <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {{ capability }}
                      </div>
                    }
                  </div>
                  <div class="text-2xl font-bold text-gray-900">
                    {{ module.pricePerMonth }}<span class="text-sm font-normal text-gray-600">/{{ 'account.create.perMonth' | translate }}</span>
                  </div>
                </app-selectable-card>
              }
            </div>

            <div class="flex items-center justify-end gap-4 pt-8 border-t-2 border-gray-100">
              <app-button variant="outline" (onClick)="previousStep()">
                {{ 'common.back' | translate }}
              </app-button>
              <app-button 
                variant="primary" 
                (onClick)="nextStep()"
              >
                {{ 'common.next' | translate }}
              </app-button>
            </div>
          </div>
        }

        <!-- Step 3: Account Information -->
        @if (currentStep === 3) {
          <div class="p-8">
            <form [formGroup]="accountForm" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <app-text-input
                  formControlName="name"
                  [label]="'account.create.accountName'"
                  [required]="true"
                  [placeholder]="'account.create.accountNamePlaceholder'"
                />

                <app-text-input
                  formControlName="email"
                  type="email"
                  [label]="'account.create.email'"
                  [required]="true"
                  [placeholder]="'account.create.emailPlaceholder'"
                />

                <app-text-input
                  formControlName="username"
                  [label]="'account.create.username'"
                  [required]="true"
                  [placeholder]="'account.create.usernamePlaceholder'"
                />

                <app-text-input
                  formControlName="password"
                  type="password"
                  [label]="'account.create.password'"
                  [required]="true"
                  [placeholder]="'account.create.passwordPlaceholder'"
                  [showPasswordToggle]="true"
                />

                <app-text-input
                  formControlName="phone"
                  type="tel"
                  [label]="'account.create.phone'"
                  [required]="true"
                  [placeholder]="'account.create.phonePlaceholder'"
                />

                <app-text-input
                  formControlName="website"
                  type="text"
                  [label]="'account.create.website'"
                  [placeholder]="'account.create.websitePlaceholder'"
                />
              </div>

              <!-- File Uploads -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <app-file-upload
                  [label]="'account.create.contract'"
                  [accept]="'.pdf,.doc,.docx'"
                  (fileSelected)="onContractFileChange($event)"
                />

                <app-file-upload
                  [label]="'account.create.logo'"
                  [accept]="'image/*'"
                  (fileSelected)="onLogoFileChange($event)"
                />
              </div>

              <div class="flex items-center justify-end gap-4 pt-8 border-t-2 border-gray-100">
                <app-button variant="outline" (onClick)="previousStep()">
                  {{ 'common.back' | translate }}
                </app-button>
                <app-button 
                  variant="primary" 
                  (onClick)="nextStep()"
                  [disabled]="accountForm.invalid"
                >
                  {{ 'common.next' | translate }}
                </app-button>
              </div>
            </form>
          </div>
        }

        <!-- Step 4: Add Pharmacies -->
        @if (currentStep === 4) {
          <div class="p-8">
            <div class="mb-6 flex items-center justify-between">
              <h3 class="text-xl font-bold text-gray-900">{{ 'account.create.pharmacies' | translate }}</h3>
              <app-button variant="primary" size="sm" (onClick)="addPharmacy()">
                <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                {{ 'account.create.addPharmacy' | translate }}
              </app-button>
            </div>

            <form [formGroup]="pharmaciesForm">
              <div formArrayName="pharmacies" class="space-y-6">
                @for (pharmacy of pharmaciesArray.controls; track $index; let i = $index) {
                  <div [formGroupName]="i" class="border-2 border-gray-200 rounded-xl p-6">
                    <div class="flex items-center justify-between mb-6">
                      <h4 class="text-lg font-semibold text-gray-900">
                        {{ 'account.create.pharmacy' | translate }} {{ i + 1 }}
                      </h4>
                      @if (pharmaciesArray.length > 1) {
                        <button
                          type="button"
                          (click)="removePharmacy(i)"
                          class="text-red-500 hover:text-red-700"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      }
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <app-text-input
                        [formControl]="getPharmacyControl(i, 'name')"
                        [label]="'account.create.pharmacyName'"
                        [required]="true"
                        [placeholder]="'account.create.pharmacyNamePlaceholder'"
                      />

                      <app-text-input
                        [formControl]="getPharmacyControl(i, 'address')"
                        [label]="'account.create.address'"
                        [required]="true"
                        [placeholder]="'account.create.addressPlaceholder'"
                      />

                      <app-text-input
                        [formControl]="getPharmacyControl(i, 'city')"
                        [label]="'account.create.city'"
                        [required]="true"
                        [placeholder]="'account.create.cityPlaceholder'"
                      />

                      <app-text-input
                        [formControl]="getPharmacyControl(i, 'area')"
                        [label]="'account.create.area'"
                        [required]="true"
                        [placeholder]="'account.create.areaPlaceholder'"
                      />

                      <app-text-input
                        [formControl]="getPharmacyControl(i, 'country')"
                        [label]="'account.create.country'"
                        [required]="true"
                        [placeholder]="'account.create.countryPlaceholder'"
                      />

                      <app-text-input
                        [formControl]="getPharmacyControl(i, 'lat')"
                        type="number"
                        [label]="'account.create.latitude'"
                        [required]="true"
                        [placeholder]="'account.create.latitudePlaceholder'"
                        step="0.000001"
                      />

                      <app-text-input
                        [formControl]="getPharmacyControl(i, 'long')"
                        type="number"
                        [label]="'account.create.longitude'"
                        [required]="true"
                        [placeholder]="'account.create.longitudePlaceholder'"
                        step="0.000001"
                      />
                    </div>

                    <div class="border-t-2 border-gray-200 pt-6">
                      <h5 class="text-md font-semibold text-gray-900 mb-4">
                        {{ 'account.create.pharmacyManager' | translate }}
                      </h5>
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <app-text-input
                          [formControl]="getManagerControl(i, 'fullName')"
                          [label]="'account.create.managerFullName'"
                          [required]="true"
                          [placeholder]="'account.create.managerFullNamePlaceholder'"
                        />

                        <app-text-input
                          [formControl]="getManagerControl(i, 'email')"
                          type="email"
                          [label]="'account.create.managerEmail'"
                          [required]="true"
                          [placeholder]="'account.create.managerEmailPlaceholder'"
                        />

                        <app-text-input
                          [formControl]="getManagerControl(i, 'password')"
                          type="password"
                          [label]="'account.create.managerPassword'"
                          [required]="true"
                          [placeholder]="'account.create.managerPasswordPlaceholder'"
                          [showPasswordToggle]="true"
                        />
                      </div>
                    </div>
                  </div>
                }
              </div>
            </form>

            <div class="flex items-center justify-end gap-4 pt-8 border-t-2 border-gray-100 mt-8">
              <app-button variant="outline" (onClick)="previousStep()">
                {{ 'common.back' | translate }}
              </app-button>
              <app-button 
                variant="primary" 
                (onClick)="nextStep()"
                [disabled]="pharmaciesForm.invalid || pharmaciesArray.length === 0"
              >
                {{ 'common.next' | translate }}
              </app-button>
            </div>
          </div>
        }

        <!-- Step 5: Preview -->
        @if (currentStep === 5) {
          <div class="p-8">
            <div class="space-y-6">
              <!-- Plan Preview -->
              <div class="border-2 border-gray-200 rounded-xl p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ 'account.create.selectedPlan' | translate }}</h3>
                @if (selectedPlan) {
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="text-sm font-medium text-gray-600">{{ 'account.create.planName' | translate }}</label>
                      <p class="text-lg font-bold text-gray-900">{{ selectedPlan.name }}</p>
                    </div>
                    <div>
                      <label class="text-sm font-medium text-gray-600">{{ 'account.create.planPrice' | translate }}</label>
                      <p class="text-lg font-bold text-gray-900">{{ selectedPlan.price }}/{{ selectedPlan.billingCycle }}</p>
                    </div>
                  </div>
                }
              </div>

              <!-- Modules Preview -->
              <div class="border-2 border-gray-200 rounded-xl p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ 'account.create.selectedModules' | translate }} ({{ selectedModules.length }})</h3>
                @if (selectedModules.length > 0) {
                  <div class="space-y-3 mb-4">
                    @for (module of selectedModules; track module.id) {
                      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p class="font-semibold text-gray-900">{{ module.nameKey | translate }}</p>
                          <p class="text-sm text-gray-600">{{ module.descriptionKey | translate }}</p>
                        </div>
                        <p class="text-lg font-bold text-gray-900">{{ module.pricePerMonth }}/{{ 'account.create.perMonth' | translate }}</p>
                      </div>
                    }
                  </div>
                } @else {
                  <p class="text-gray-600">{{ 'account.create.noModulesSelected' | translate }}</p>
                }
              </div>

              <!-- Total Price -->
              <div class="border-2 border-gray-200 rounded-xl p-6 bg-gray-50">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-semibold text-gray-900">{{ 'account.create.totalMonthlyPrice' | translate }}</h3>
                  <p class="text-3xl font-bold text-gray-900">{{ getTotalMonthlyPrice() }}<span class="text-lg font-normal text-gray-600">/{{ 'account.create.perMonth' | translate }}</span></p>
                </div>
              </div>

              <!-- Account Info Preview -->
              <div class="border-2 border-gray-200 rounded-xl p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ 'account.create.accountInformation' | translate }}</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium text-gray-600">{{ 'account.create.accountName' | translate }}</label>
                    <p class="text-gray-900">{{ accountForm.get('name')?.value }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-600">{{ 'account.create.email' | translate }}</label>
                    <p class="text-gray-900">{{ accountForm.get('email')?.value }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-600">{{ 'account.create.username' | translate }}</label>
                    <p class="text-gray-900">{{ accountForm.get('username')?.value }}</p>
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-600">{{ 'account.create.website' | translate }}</label>
                    <p class="text-gray-900">{{ accountForm.get('website')?.value || '-' }}</p>
                  </div>
                </div>
              </div>

              <!-- Pharmacies Preview -->
              <div class="border-2 border-gray-200 rounded-xl p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">
                  {{ 'account.create.pharmacies' | translate }} ({{ pharmaciesArray.length }})
                </h3>
                <div class="space-y-4">
                  @for (pharmacy of pharmaciesArray.controls; track $index; let i = $index) {
                    <div class="border border-gray-200 rounded-lg p-4">
                      <h4 class="font-semibold text-gray-900 mb-2">
                        {{ 'account.create.pharmacy' | translate }} {{ i + 1 }}: {{ getPharmacyValue(i, 'name') }}
                      </h4>
                      <div class="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span class="text-gray-600">{{ 'account.create.address' | translate }}:</span>
                          <span class="text-gray-900 ml-2">{{ getPharmacyValue(i, 'address') }}</span>
                        </div>
                        <div>
                          <span class="text-gray-600">{{ 'account.create.city' | translate }}:</span>
                          <span class="text-gray-900 ml-2">{{ getPharmacyValue(i, 'city') }}</span>
                        </div>
                        <div>
                          <span class="text-gray-600">{{ 'account.create.managerFullName' | translate }}:</span>
                          <span class="text-gray-900 ml-2">{{ getManagerValue(i, 'fullName') }}</span>
                        </div>
                        <div>
                          <span class="text-gray-600">{{ 'account.create.managerEmail' | translate }}:</span>
                          <span class="text-gray-900 ml-2">{{ getManagerValue(i, 'email') }}</span>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-4 pt-8 border-t-2 border-gray-100 mt-8">
              <app-button variant="outline" (onClick)="previousStep()">
                {{ 'common.back' | translate }}
              </app-button>
              <app-button 
                variant="primary" 
                (onClick)="createAccount()"
                [loading]="loading"
              >
                {{ 'account.create.createAccount' | translate }}
              </app-button>
            </div>
          </div>
        }
      </app-wizard>
    </div>
  `,
  styles: []
})
export class CreateAccountComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private subscriptionsService = inject(PlatformSubscriptionsService);
  private accountsService = inject(PlatformAccountsService);

  currentStep = 1;
  selectedPlan: SubscriptionPlan | null = null;
  selectedModules: Module[] = [];
  plans: SubscriptionPlan[] = [];
  modules: Module[] = [];
  loading = false;
  errorMessage = '';
  contractFile: File | null = null;
  logoFile: File | null = null;

  accountForm!: FormGroup;
  pharmaciesForm!: FormGroup;

  wizardSteps: WizardStep[] = [
    {
      number: 1,
      title: 'account.create.wizard.step1',
      subtitle: 'account.create.wizard.step1Subtitle',
      completed: false
    },
    {
      number: 2,
      title: 'account.create.wizard.step2Modules',
      subtitle: 'account.create.wizard.step2ModulesSubtitle',
      completed: false
    },
    {
      number: 3,
      title: 'account.create.wizard.step3',
      subtitle: 'account.create.wizard.step3Subtitle',
      completed: false
    },
    {
      number: 4,
      title: 'account.create.wizard.step4',
      subtitle: 'account.create.wizard.step4Subtitle',
      completed: false
    },
    {
      number: 5,
      title: 'account.create.wizard.step5',
      subtitle: 'account.create.wizard.step5Subtitle',
      completed: false
    }
  ];

  ngOnInit(): void {
    this.initializeForms();
    this.loadPlans();
    this.initializeModules();
  }

  initializeForms(): void {
    this.accountForm = this.fb.group({
      name: ['PharmaCorp Inc.', [Validators.required]],
      email: ['admin@pharmacorp.com', [Validators.required, Validators.email]],
      username: ['pharmacorp_admin', [Validators.required]],
      password: ['SecurePass123!', [Validators.required, Validators.minLength(8)]],
      phone: ['+201234567890', [Validators.required]],
      website: ['https://pharmacorp.com', []]
    });

    this.pharmaciesForm = this.fb.group({
      pharmacies: this.fb.array([])
    });

    // Add initial pharmacy with mock data
    this.addPharmacy();
  }

  loadPlans(): void {
    this.subscriptionsService.getPlans({ page: 1, pageSize: 100, isActive: true }).subscribe({
      next: (response) => {
        this.plans = response.data;
      },
      error: (error) => {
        console.error('Error loading plans:', error);
      }
    });
  }

  initializeModules(): void {
    this.modules = [
      {
        id: 'inventory',
        name: 'Inventory',
        nameKey: 'account.create.modules.inventory.name',
        description: 'Comprehensive inventory management system with real-time tracking, stock alerts, and automated reordering.',
        descriptionKey: 'account.create.modules.inventory.description',
        capabilities: [
          'Real-time stock tracking',
          'Automated reorder points',
          'Batch and expiry management',
          'Multi-location inventory',
          'Stock movement history'
        ],
        capabilitiesKey: 'account.create.modules.inventory.capabilities',
        pricePerMonth: 150
      },
      {
        id: 'hr',
        name: 'HR & People',
        nameKey: 'account.create.modules.hr.name',
        description: 'Complete human resources management including employee records, scheduling, attendance, and payroll integration.',
        descriptionKey: 'account.create.modules.hr.description',
        capabilities: [
          'Employee management',
          'Shift scheduling',
          'Attendance tracking',
          'Payroll integration',
          'Performance reviews'
        ],
        capabilitiesKey: 'account.create.modules.hr.capabilities',
        pricePerMonth: 200
      },
      {
        id: 'finance',
        name: 'Finance',
        nameKey: 'account.create.modules.finance.name',
        description: 'Financial management tools for accounting, invoicing, payments, and comprehensive financial reporting.',
        descriptionKey: 'account.create.modules.finance.description',
        capabilities: [
          'Accounting & bookkeeping',
          'Invoice generation',
          'Payment processing',
          'Financial reports',
          'Tax management'
        ],
        capabilitiesKey: 'account.create.modules.finance.capabilities',
        pricePerMonth: 180
      },
      {
        id: 'automation',
        name: 'Automation',
        nameKey: 'account.create.modules.automation.name',
        description: 'Automate repetitive tasks, workflows, and business processes to increase efficiency and reduce manual work.',
        descriptionKey: 'account.create.modules.automation.description',
        capabilities: [
          'Workflow automation',
          'Task scheduling',
          'Rule-based actions',
          'Notification automation',
          'Integration automation'
        ],
        capabilitiesKey: 'account.create.modules.automation.capabilities',
        pricePerMonth: 120
      },
      {
        id: 'loyalty',
        name: 'Loyalty',
        nameKey: 'account.create.modules.loyalty.name',
        description: 'Customer loyalty program management with points, rewards, discounts, and customer engagement tools.',
        descriptionKey: 'account.create.modules.loyalty.description',
        capabilities: [
          'Points system',
          'Rewards management',
          'Customer segmentation',
          'Promotional campaigns',
          'Loyalty analytics'
        ],
        capabilitiesKey: 'account.create.modules.loyalty.capabilities',
        pricePerMonth: 100
      },
      {
        id: 'api_access',
        name: 'API Access',
        nameKey: 'account.create.modules.apiAccess.name',
        description: 'Full API access for custom integrations, third-party connections, and advanced system integrations.',
        descriptionKey: 'account.create.modules.apiAccess.description',
        capabilities: [
          'RESTful API access',
          'Webhook support',
          'API documentation',
          'Rate limiting',
          'Custom integrations'
        ],
        capabilitiesKey: 'account.create.modules.apiAccess.capabilities',
        pricePerMonth: 250
      },
      {
        id: 'ai_features',
        name: 'AI Features',
        nameKey: 'account.create.modules.aiFeatures.name',
        description: 'Artificial intelligence powered features including demand forecasting, smart recommendations, and predictive analytics.',
        descriptionKey: 'account.create.modules.aiFeatures.description',
        capabilities: [
          'Demand forecasting',
          'Smart recommendations',
          'Predictive analytics',
          'Fraud detection',
          'Chatbot support'
        ],
        capabilitiesKey: 'account.create.modules.aiFeatures.capabilities',
        pricePerMonth: 300
      },
      {
        id: 'analytics',
        name: 'Analytics',
        nameKey: 'account.create.modules.analytics.name',
        description: 'Advanced analytics and business intelligence with customizable dashboards, reports, and data visualization.',
        descriptionKey: 'account.create.modules.analytics.description',
        capabilities: [
          'Custom dashboards',
          'Data visualization',
          'Trend analysis',
          'KPI tracking',
          'Export capabilities'
        ],
        capabilitiesKey: 'account.create.modules.analytics.capabilities',
        pricePerMonth: 170
      },
      {
        id: 'reports',
        name: 'Reports',
        nameKey: 'account.create.modules.reports.name',
        description: 'Comprehensive reporting system with pre-built and custom reports for all aspects of your pharmacy operations.',
        descriptionKey: 'account.create.modules.reports.description',
        capabilities: [
          'Pre-built reports',
          'Custom report builder',
          'Scheduled reports',
          'Export to PDF/Excel',
          'Report templates'
        ],
        capabilitiesKey: 'account.create.modules.reports.capabilities',
        pricePerMonth: 90
      },
      {
        id: 'multi_branch',
        name: 'Multi-Branch',
        nameKey: 'account.create.modules.multiBranch.name',
        description: 'Manage multiple pharmacy branches from a single platform with centralized control and branch-specific settings.',
        descriptionKey: 'account.create.modules.multiBranch.description',
        capabilities: [
          'Multi-location management',
          'Centralized inventory',
          'Branch-specific settings',
          'Inter-branch transfers',
          'Unified reporting'
        ],
        capabilitiesKey: 'account.create.modules.multiBranch.capabilities',
        pricePerMonth: 220
      }
    ];
  }

  toggleModule(module: Module): void {
    const index = this.selectedModules.findIndex(m => m.id === module.id);
    if (index >= 0) {
      this.selectedModules.splice(index, 1);
    } else {
      this.selectedModules.push(module);
    }
  }

  isModuleSelected(module: Module): boolean {
    return this.selectedModules.some(m => m.id === module.id);
  }

  getTotalMonthlyPrice(): number {
    let planPrice = 0;
    if (this.selectedPlan) {
      // Convert annual price to monthly if needed
      if (this.selectedPlan.billingCycle === 'annual') {
        planPrice = this.selectedPlan.price / 12;
      } else {
        planPrice = this.selectedPlan.price;
      }
    }
    const modulesPrice = this.selectedModules.reduce((sum, module) => sum + module.pricePerMonth, 0);
    return planPrice + modulesPrice;
  }

  selectPlan(plan: SubscriptionPlan): void {
    this.selectedPlan = plan;
  }

  get pharmaciesArray(): FormArray {
    return this.pharmaciesForm.get('pharmacies') as FormArray;
  }

  addPharmacy(): void {
    const pharmacyGroup = this.fb.group({
      name: ['Main Pharmacy', [Validators.required]],
      address: ['123 Main Street', [Validators.required]],
      city: ['Cairo', [Validators.required]],
      area: ['Downtown', [Validators.required]],
      country: ['Egypt', [Validators.required]],
      lat: [30.0444, [Validators.required]],
      long: [31.2357, [Validators.required]],
      manager: this.fb.group({
        fullName: ['Ahmed Mohamed', [Validators.required]],
        email: ['ahmed@pharmacy.com', [Validators.required, Validators.email]],
        password: ['ManagerPass123!', [Validators.required, Validators.minLength(8)]]
      })
    });

    this.pharmaciesArray.push(pharmacyGroup);
  }

  removePharmacy(index: number): void {
    this.pharmaciesArray.removeAt(index);
  }

  getPharmacyControl(index: number, field: string): FormControl {
    return this.pharmaciesArray.at(index).get(field) as FormControl;
  }

  getManagerControl(index: number, field: string): FormControl {
    return this.pharmaciesArray.at(index).get('manager')?.get(field) as FormControl;
  }

  getPharmacyValue(index: number, field: string): string {
    return this.pharmaciesArray.at(index).get(field)?.value || '';
  }

  getManagerValue(index: number, field: string): string {
    return this.pharmaciesArray.at(index).get('manager')?.get(field)?.value || '';
  }

  onStepChange(step: number): void {
    if (this.canNavigateToStep(step)) {
      this.currentStep = step;
      this.updateWizardSteps();
    }
  }

  canNavigateToStep(step: number): boolean {
    if (step === 1) return true;
    if (step === 2) return !!this.selectedPlan;
    if (step === 3) return !!this.selectedPlan; // Modules step is optional
    if (step === 4) return this.accountForm.valid;
    if (step === 5) return this.pharmaciesForm.valid && this.pharmaciesArray.length > 0;
    return false;
  }

  updateWizardSteps(): void {
    this.wizardSteps.forEach(step => {
      if (step.number < this.currentStep) {
        step.completed = true;
      }
    });
  }

  nextStep(): void {
    // Validate current step before proceeding
    if (this.currentStep === 1 && !this.selectedPlan) {
      this.errorMessage = 'account.create.validationError';
      return;
    }
    // Step 2 (modules) is optional, no validation needed
    if (this.currentStep === 3 && this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      this.errorMessage = 'account.create.validationError';
      return;
    }
    if (this.currentStep === 4 && (this.pharmaciesForm.invalid || this.pharmaciesArray.length === 0)) {
      this.pharmaciesForm.markAllAsTouched();
      this.errorMessage = 'account.create.validationError';
      return;
    }

    this.errorMessage = '';
    if (this.currentStep < this.wizardSteps.length) {
      // Mark current step as completed
      const currentStepObj = this.wizardSteps.find(s => s.number === this.currentStep);
      if (currentStepObj) {
        currentStepObj.completed = true;
      }
      this.currentStep++;
      this.updateWizardSteps();
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.errorMessage = '';
      this.currentStep--;
    }
  }

  createAccount(): void {
    if (!this.selectedPlan || this.accountForm.invalid || this.pharmaciesForm.invalid) {
      this.errorMessage = 'account.create.validationError';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const accountData = {
      name: this.accountForm.get('name')?.value,
      email: this.accountForm.get('email')?.value,
      username: this.accountForm.get('username')?.value,
      password: this.accountForm.get('password')?.value,
      website: this.accountForm.get('website')?.value,
      planId: this.selectedPlan.id,
      moduleIds: this.selectedModules.map(m => m.id),
      pharmacies: this.pharmaciesArray.value.map((pharmacy: any) => ({
        name: pharmacy.name,
        address: pharmacy.address,
        city: pharmacy.city,
        area: pharmacy.area,
        country: pharmacy.country,
        lat: parseFloat(pharmacy.lat),
        long: parseFloat(pharmacy.long),
        manager: {
          fullName: pharmacy.manager.fullName,
          email: pharmacy.manager.email,
          password: pharmacy.manager.password,
          role: 'pharmacy_manager'
        }
      }))
    };

    // TODO: Replace with actual API call
    console.log('Creating account:', accountData);
    
    // Simulate API call
    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['/super-admin/accounts']);
    }, 2000);
  }

  onCancel(): void {
    this.router.navigate(['/super-admin/accounts']);
  }

  onContractFileChange(file: File): void {
    this.contractFile = file;
  }

  onLogoFileChange(file: File): void {
    this.logoFile = file;
  }
}

