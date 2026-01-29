import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TextInputComponent } from '../../../../shared/components/input/text-input.component';
import { TextareaInputComponent } from '../../../../shared/components/input/textarea-input.component';
import { RadioInputComponent } from '../../../../shared/components/input/radio-input.component';
import { ModernFormWrapperComponent } from '../../../../shared/components/modern-form-wrapper/modern-form-wrapper.component';
import { FormSectionComponent } from '../../../../shared/components/form-section/form-section.component';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { PlatformSubscriptionsService, CreateSubscriptionPlanDto } from '../../../../core/services/platform-subscriptions.service';

@Component({
  selector: 'app-create-plan',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextInputComponent,
    TextareaInputComponent,
    RadioInputComponent,
    ModernFormWrapperComponent,
    FormSectionComponent,
    TranslatePipe
  ],
  template: `
    <app-modern-form-wrapper
      [title]="(isEdit ? 'platform.subscriptions.editPlan' : 'platform.subscriptions.createPlan')"
      [description]="(isEdit ? 'platform.subscriptions.editPlanSubtitle' : 'platform.subscriptions.createPlanSubtitle')"
      [errorMessage]="errorMessage"
    >
      <form [formGroup]="planForm" (ngSubmit)="createPlan()" class="p-8">
        <!-- Basic Information Section -->
        <app-form-section [title]="'platform.subscriptions.planBasicInfo'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <app-text-input
              formControlName="name"
              [label]="'platform.subscriptions.planName'"
              [required]="true"
              [placeholder]="'platform.subscriptions.planNamePlaceholder'"
            />

            <app-text-input
              formControlName="nameAr"
              [label]="'platform.subscriptions.planNameAr'"
              [required]="true"
              [placeholder]="'platform.subscriptions.planNameArPlaceholder'"
            />

            <app-text-input
              formControlName="price"
              type="number"
              [label]="'platform.subscriptions.planPrice'"
              [required]="true"
              [placeholder]="'platform.subscriptions.planPricePlaceholder'"
            />

            <app-text-input
              formControlName="maxPharmacies"
              type="number"
              [label]="'platform.subscriptions.maxPharmacies'"
              [required]="true"
              [placeholder]="'platform.subscriptions.maxPharmaciesPlaceholder'"
            />

            <app-text-input
              formControlName="maxUsers"
              type="number"
              [label]="'platform.subscriptions.maxUsers'"
              [required]="true"
              [placeholder]="'platform.subscriptions.maxUsersPlaceholder'"
            />
          </div>

          <div class="mt-6">
            <app-radio-input
              formControlName="billingCycle"
              [label]="'platform.subscriptions.billingCycle'"
              [required]="true"
              [radioOptions]="billingCycleOptions"
            />
          </div>

          <div class="mt-6">
            <app-radio-input
              formControlName="isActive"
              [label]="'platform.subscriptions.planStatus'"
              [required]="true"
              [radioOptions]="statusOptions"
            />
          </div>

          <div class="mt-6">
            <app-textarea-input
              formControlName="description"
              [label]="'platform.subscriptions.planDescription'"
              [required]="true"
              [placeholder]="'platform.subscriptions.planDescriptionPlaceholder'"
              [rows]="4"
            />
          </div>

          <div class="mt-6">
            <app-textarea-input
              formControlName="descriptionAr"
              [label]="'platform.subscriptions.planDescriptionAr'"
              [required]="true"
              [placeholder]="'platform.subscriptions.planDescriptionArPlaceholder'"
              [rows]="4"
            />
          </div>
        </app-form-section>

        <!-- Form Actions -->
        <div class="flex items-center justify-end gap-4 pt-8 border-t-2 border-gray-100">
          <button
            type="button"
            (click)="goBack()"
            class="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            {{ 'common.cancel' | translate }}
          </button>
          <button
            type="submit"
            [disabled]="planForm.invalid || loading"
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
            {{ (isEdit ? 'platform.subscriptions.updatePlan' : 'platform.subscriptions.createPlan') | translate }}
          </button>
        </div>
      </form>
    </app-modern-form-wrapper>
  `,
  styles: []
})
export class CreatePlanComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private subscriptionsService = inject(PlatformSubscriptionsService);

  planForm!: FormGroup;
  loading = false;
  errorMessage?: string;
  isEdit = false;
  planId: string | null = null;

  billingCycleOptions: Array<{ value: string; label: string }> = [
    { value: 'monthly', label: 'platform.plan.month' },
    { value: 'annual', label: 'platform.plan.year' }
  ];

  statusOptions: Array<{ value: boolean; label: string }> = [
    { value: true, label: 'common.active' },
    { value: false, label: 'common.inactive' }
  ];

  ngOnInit(): void {
    this.planId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.planId;
    
    this.initializeForm();
    
    if (this.isEdit && this.planId) {
      this.loadPlan();
    }
  }

  initializeForm(): void {
    this.planForm = this.fb.group({
      name: ['', [Validators.required]],
      nameAr: ['', [Validators.required]],
      description: ['', [Validators.required]],
      descriptionAr: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
      billingCycle: ['monthly', [Validators.required]],
      maxPharmacies: [1, [Validators.required, Validators.min(-1)]],
      maxUsers: [1, [Validators.required, Validators.min(-1)]],
      isActive: [true, [Validators.required]]
    });
  }

  loadPlan(): void {
    if (!this.planId) return;
    
    this.loading = true;
    this.subscriptionsService.getPlanById(this.planId).subscribe({
      next: (plan) => {
        this.planForm.patchValue({
          name: plan.name,
          nameAr: plan.nameAr || '',
          description: plan.description,
          descriptionAr: plan.descriptionAr || '',
          price: plan.price,
          billingCycle: plan.billingCycle,
          maxPharmacies: plan.maxPharmacies,
          maxUsers: plan.maxUsers || plan.maxStaff,
          isActive: plan.isActive
        });
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Failed to load subscription plan';
      }
    });
  }

  createPlan(): void {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = undefined;

    // Map form values to backend DTO
    const formValue = this.planForm.value;
    const planDto: CreateSubscriptionPlanDto = {
      name: formValue.name,
      nameAr: formValue.nameAr,
      description: formValue.description,
      descriptionAr: formValue.descriptionAr,
      price: Number(formValue.price),
      billingCycle: formValue.billingCycle === 'monthly' ? 1 : 2, // 1 for monthly, 2 for annual
      isActive: formValue.isActive === true || formValue.isActive === 'true' || formValue.isActive === true,
      maxPharmacies: Number(formValue.maxPharmacies),
      maxUsers: Number(formValue.maxUsers)
    };

    if (this.isEdit && this.planId) {
      // Update existing plan
      this.subscriptionsService.updatePlan(this.planId, planDto).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/super-admin/subscriptions']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.message || 'Failed to update subscription plan';
        }
      });
    } else {
      // Create new plan
      this.subscriptionsService.createPlan(planDto).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/super-admin/subscriptions']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.message || 'Failed to create subscription plan';
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/super-admin/subscriptions']);
  }
}
