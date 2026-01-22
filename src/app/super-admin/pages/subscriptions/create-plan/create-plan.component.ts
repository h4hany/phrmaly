import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TextInputComponent } from '../../../../shared/components/input/text-input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { SelectableCardComponent } from '../../../../shared/components/selectable-card/selectable-card.component';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { PlatformSubscriptionsService } from '../../../../core/services/platform-subscriptions.service';
import { PlatformModule } from '../../../../core/models/platform.model';

interface PlanCapability {
  id: string;
  nameKey: string;
}

@Component({
  selector: 'app-create-plan',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextInputComponent,
    ButtonComponent,
    SelectableCardComponent,
    TranslatePipe
  ],
  template: `
    <div class="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-6">
        <button
          (click)="goBack()"
          class="flex items-center text-sm text-[var(--card-text)] hover:text-[var(--text-primary)] mb-4"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          {{ 'common.back' | translate }}
        </button>
        <h1 class="text-2xl font-bold text-[var(--text-primary)]">{{ 'platform.subscriptions.createPlan' | translate }}</h1>
        <p class="text-sm text-[var(--card-text)] mt-1">{{ 'platform.subscriptions.createPlanSubtitle' | translate }}</p>
      </div>

      <form [formGroup]="planForm" class="space-y-6">
        <!-- Basic Information -->
        <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
          <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'platform.subscriptions.planBasicInfo' | translate }}</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <app-text-input
              formControlName="name"
              [label]="'platform.subscriptions.planName'"
              [required]="true"
              [placeholder]="'platform.subscriptions.planNamePlaceholder'"
            />

            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.subscriptions.planTier' | translate }}</label>
              <select
                formControlName="tier"
                class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
              >
                <option value="starter">{{ 'platform.subscriptions.tierStarter' | translate }}</option>
                <option value="professional">{{ 'platform.subscriptions.tierProfessional' | translate }}</option>
                <option value="enterprise">{{ 'platform.subscriptions.tierEnterprise' | translate }}</option>
                <option value="custom">{{ 'platform.subscriptions.tierCustom' | translate }}</option>
              </select>
            </div>

            <app-text-input
              formControlName="price"
              type="number"
              [label]="'platform.subscriptions.planPrice'"
              [required]="true"
              [placeholder]="'platform.subscriptions.planPricePlaceholder'"
            />

            <div>
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'platform.subscriptions.billingCycle' | translate }}</label>
              <select
                formControlName="billingCycle"
                class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
              >
                <option value="monthly">{{ 'platform.plan.month' | translate }}</option>
                <option value="annual">{{ 'platform.plan.year' | translate }}</option>
              </select>
            </div>

            <app-text-input
              formControlName="maxPharmacies"
              type="number"
              [label]="'platform.subscriptions.maxPharmacies'"
              [required]="true"
              [placeholder]="'platform.subscriptions.maxPharmaciesPlaceholder'"
            />

            <app-text-input
              formControlName="maxStaff"
              type="number"
              [label]="'platform.subscriptions.maxStaff'"
              [required]="true"
              [placeholder]="'platform.subscriptions.maxStaffPlaceholder'"
            />
          </div>

          <div class="mt-6">
            <label class="block text-sm font-medium text-[var(--card-text)] mb-2">{{ 'platform.subscriptions.planDescription' | translate }}</label>
            <textarea
              formControlName="description"
              rows="4"
              class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
              [placeholder]="'platform.subscriptions.planDescriptionPlaceholder' | translate"
            ></textarea>
          </div>
        </div>

        <!-- Capabilities -->
        <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
          <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'platform.subscriptions.planCapabilities' | translate }}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (capability of capabilities; track capability.id) {
              <div class="flex items-center">
                <input
                  type="checkbox"
                  [id]="'capability-' + capability.id"
                  [value]="capability.id"
                  (change)="toggleCapability(capability.id, $event)"
                  [checked]="isCapabilitySelected(capability.id)"
                  class="w-4 h-4 text-[var(--primary-color)] border-[var(--border-color)] rounded focus:ring-[var(--primary-color)]"
                />
                <label [for]="'capability-' + capability.id" class="ml-2 text-sm text-[var(--text-primary)] cursor-pointer">
                  {{ capability.nameKey | translate }}
                </label>
              </div>
            }
          </div>
        </div>

        <!-- Modules Selection -->
        <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
          <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'platform.subscriptions.planModules' | translate }}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (module of availableModules; track module.id) {
              <app-selectable-card
                [selected]="isModuleSelected(module.id)"
                (cardClick)="toggleModule(module.id)"
              >
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-lg font-bold text-gray-900">{{ module.nameKey | translate }}</h3>
                </div>
                <p class="text-sm text-gray-600">{{ module.descriptionKey | translate }}</p>
              </app-selectable-card>
            }
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-4 pt-6 border-t border-[var(--border-color)]">
          <app-button variant="outline" (onClick)="goBack()">
            {{ 'common.cancel' | translate }}
          </app-button>
          <app-button 
            variant="primary" 
            (onClick)="createPlan()"
            [disabled]="planForm.invalid"
            [loading]="loading"
          >
            {{ 'platform.subscriptions.createPlan' | translate }}
          </app-button>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class CreatePlanComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private subscriptionsService = inject(PlatformSubscriptionsService);

  planForm!: FormGroup;
  loading = false;
  selectedCapabilities: string[] = [];
  selectedModules: PlatformModule[] = [];

  capabilities: PlanCapability[] = [
    { id: 'unlimited_pharmacies', nameKey: 'platform.subscriptions.capabilityUnlimitedPharmacies' },
    { id: 'unlimited_staff', nameKey: 'platform.subscriptions.capabilityUnlimitedStaff' },
    { id: 'priority_support', nameKey: 'platform.subscriptions.capabilityPrioritySupport' },
    { id: 'advanced_analytics', nameKey: 'platform.subscriptions.capabilityAdvancedAnalytics' },
    { id: 'api_access', nameKey: 'platform.subscriptions.capabilityApiAccess' },
    { id: 'custom_integrations', nameKey: 'platform.subscriptions.capabilityCustomIntegrations' },
    { id: 'white_label', nameKey: 'platform.subscriptions.capabilityWhiteLabel' },
    { id: 'dedicated_account_manager', nameKey: 'platform.subscriptions.capabilityDedicatedManager' }
  ];

  availableModules: Array<{ id: PlatformModule; nameKey: string; descriptionKey: string }> = [
    { id: 'inventory', nameKey: 'platform.modules.inventory', descriptionKey: 'account.create.modules.inventory.description' },
    { id: 'hr', nameKey: 'platform.modules.hr', descriptionKey: 'account.create.modules.hr.description' },
    { id: 'finance', nameKey: 'platform.modules.finance', descriptionKey: 'account.create.modules.finance.description' },
    { id: 'automation', nameKey: 'platform.modules.automation', descriptionKey: 'account.create.modules.automation.description' },
    { id: 'loyalty', nameKey: 'platform.modules.loyalty', descriptionKey: 'account.create.modules.loyalty.description' },
    { id: 'api_access', nameKey: 'platform.modules.api_access', descriptionKey: 'account.create.modules.apiAccess.description' },
    { id: 'ai_features', nameKey: 'platform.modules.ai_features', descriptionKey: 'account.create.modules.aiFeatures.description' },
    { id: 'analytics', nameKey: 'platform.modules.analytics', descriptionKey: 'account.create.modules.analytics.description' },
    { id: 'reports', nameKey: 'platform.modules.reports', descriptionKey: 'account.create.modules.reports.description' },
    { id: 'multi_branch', nameKey: 'platform.modules.multi_branch', descriptionKey: 'account.create.modules.multiBranch.description' }
  ];

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.planForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      tier: ['starter', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
      billingCycle: ['monthly', [Validators.required]],
      maxPharmacies: [1, [Validators.required, Validators.min(-1)]],
      maxStaff: [1, [Validators.required, Validators.min(-1)]]
    });
  }

  toggleCapability(capabilityId: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.selectedCapabilities.includes(capabilityId)) {
        this.selectedCapabilities.push(capabilityId);
      }
    } else {
      this.selectedCapabilities = this.selectedCapabilities.filter(id => id !== capabilityId);
    }
  }

  isCapabilitySelected(capabilityId: string): boolean {
    return this.selectedCapabilities.includes(capabilityId);
  }

  toggleModule(moduleId: PlatformModule): void {
    const index = this.selectedModules.indexOf(moduleId);
    if (index >= 0) {
      this.selectedModules.splice(index, 1);
    } else {
      this.selectedModules.push(moduleId);
    }
  }

  isModuleSelected(moduleId: PlatformModule): boolean {
    return this.selectedModules.includes(moduleId);
  }

  createPlan(): void {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const planData = {
      ...this.planForm.value,
      enabledModules: this.selectedModules,
      features: {
        capabilities: this.selectedCapabilities
      },
      isActive: true,
      isArchived: false
    };

    // TODO: Replace with actual API call
    console.log('Creating plan:', planData);
    
    // Simulate API call
    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['/super-admin/subscriptions']);
    }, 2000);
  }

  goBack(): void {
    this.router.navigate(['/super-admin/subscriptions']);
  }
}
