import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BundlesService } from '../../../core/services/bundles.service';
import { DrugsService } from '../../../core/services/drugs.service';
import { ModernFormWrapperComponent } from '../../../shared/components/modern-form-wrapper/modern-form-wrapper.component';
import { FormSectionComponent } from '../../../shared/components/form-section/form-section.component';
import { TextInputComponent } from '../../../shared/components/input/text-input.component';
import { RadioInputComponent } from '../../../shared/components/input/radio-input.component';
import { AutocompleteInputComponent, AutocompleteOption } from '../../../shared/components/input/autocomplete-input.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-bundle-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ModernFormWrapperComponent,
    FormSectionComponent,
    TextInputComponent,
    RadioInputComponent,
    AutocompleteInputComponent,
    TranslatePipe
  ],
  template: `
    <app-modern-form-wrapper
      [title]="(isEdit ? 'form.editBundle' : 'form.addBundle')"
      [description]="(isEdit ? 'form.editBundleDescription' : 'form.addBundleDescription')"
      [errorMessage]="errorMessage"
    >
      <form [formGroup]="bundleForm" (ngSubmit)="onSubmit()" class="p-8">
        <!-- Basic Information Section -->
        <app-form-section [title]="'bundle.basicInfo'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <app-text-input
                type="text"
                formControlName="name"
                [label]="'form.bundle.name'"
                [required]="true"
                [hasError]="!!(bundleForm.get('name')?.invalid && bundleForm.get('name')?.touched)"
                [errorMessage]="(bundleForm.get('name')?.invalid && bundleForm.get('name')?.touched) ? 'validation.nameRequired' : undefined"
                prefixIcon="tag"
              ></app-text-input>
            </div>

            <div>
              <app-text-input
                type="number"
                formControlName="fixedPrice"
                [label]="'form.bundle.fixedPrice'"
                [step]="0.01"
                [min]="0"
                [required]="true"
                prefixIcon="currency-dollar"
              ></app-text-input>
            </div>

            <div class="md:col-span-2">
              <app-radio-input
                formControlName="status"
                [label]="'bundle.status'"
                [radioOptions]="statusOptions"
              ></app-radio-input>
            </div>
          </div>
        </app-form-section>

        <!-- Bundle Items Section -->
        <app-form-section [title]="'bundle.items'">
          <div class="flex items-center justify-between mb-6">
            <h4 class="text-lg font-semibold text-gray-700">{{ 'form.bundle.addItems' | translate }}</h4>
            <button
              type="button"
              (click)="addItem()"
              class="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ 'form.bundle.addItem' | translate }}
            </button>
          </div>

          <div formArrayName="items" class="space-y-4">
            @for (item of itemsArray.controls; track $index; let i = $index) {
              <div [formGroupName]="i" class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div class="md:col-span-2">
                  <app-autocomplete-input
                    formControlName="drugId"
                    [label]="'form.bundle.drug'"
                    [options]="drugOptions"
                    [placeholder]="'form.selectDrug'"
                    prefixIcon="medicine"
                  ></app-autocomplete-input>
                </div>
                <div>
                  <app-text-input
                    type="number"
                    formControlName="quantity"
                    [label]="'form.bundle.quantity'"
                    [min]="1"
                    prefixIcon="package"
                  ></app-text-input>
                </div>
                <div class="flex items-end">
                  <button
                    type="button"
                    (click)="removeItem(i)"
                    class="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            }
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
            [disabled]="bundleForm.invalid || itemsArray.length === 0 || loading"
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
            {{ (isEdit ? 'form.updateBundle' : 'form.createBundle') | translate }}
          </button>
        </div>
      </form>
    </app-modern-form-wrapper>
  `,
  styles: []
})
export class BundleFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private bundlesService = inject(BundlesService);
  private drugsService = inject(DrugsService);

  bundleForm!: FormGroup;
  loading = false;
  errorMessage = '';
  isEdit = false;
  bundleId: string | null = null;
  pharmacyDrugs: any[] = [];
  statusOptions: Array<{ value: any; label: string }> = [
    { value: 'active', label: 'common.active' },
    { value: 'inactive', label: 'common.inactive' }
  ];
  drugOptions: AutocompleteOption[] = [];

  get itemsArray(): FormArray {
    return this.bundleForm.get('items') as FormArray;
  }

  ngOnInit(): void {
    this.bundleId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.bundleId;

    this.bundleForm = this.fb.group({
      name: ['', [Validators.required]],
      fixedPrice: [0, [Validators.required, Validators.min(0)]],
      status: ['active'],
      items: this.fb.array([])
    });

    this.loadDrugs();

    if (this.isEdit && this.bundleId) {
      this.loadBundle();
    }
  }

  private loadDrugs(): void {
    this.drugsService.getPharmacyDrugs({ page: 1, pageSize: 100 }).subscribe({
      next: (response) => {
        this.pharmacyDrugs = response.data;
        this.drugOptions = this.pharmacyDrugs.map(drug => ({
          value: drug.id,
          label: drug.generalDrug?.name || 'Drug ' + drug.id
        }));
      }
    });
  }

  private loadBundle(): void {
    this.bundlesService.getById(this.bundleId!).subscribe({
      next: (bundle) => {
        if (bundle) {
          this.bundleForm.patchValue({
            name: bundle.name,
            fixedPrice: bundle.fixedPrice,
            status: bundle.status
          });

          bundle.items.forEach(item => {
            this.addItemWithData(item);
          });
        }
      },
      error: () => {
        this.errorMessage = 'error.loadBundle';
      }
    });
  }

  addItem(): void {
    const itemForm = this.fb.group({
      drugId: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
    this.itemsArray.push(itemForm);
  }

  addItemWithData(item: any): void {
    const itemForm = this.fb.group({
      drugId: [item.drugId, [Validators.required]],
      quantity: [item.quantity, [Validators.required, Validators.min(1)]]
    });
    this.itemsArray.push(itemForm);
  }

  removeItem(index: number): void {
    this.itemsArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.bundleForm.valid && this.itemsArray.length > 0) {
      this.loading = true;
      this.errorMessage = '';

      const formValue = this.bundleForm.value;
      const bundleData = {
        name: formValue.name,
        fixedPrice: formValue.fixedPrice,
        status: formValue.status,
        items: formValue.items,
        pharmacyId: 'ph1'
      };

      const operation = this.isEdit
        ? this.bundlesService.update(this.bundleId!, bundleData)
        : this.bundlesService.create(bundleData);

      operation.subscribe({
        next: () => {
          this.router.navigate(['/bundles']);
        },
        error: (error) => {
          this.errorMessage = error.message || 'error.saveBundle';
          this.loading = false;
        }
      });
    } else {
      Object.keys(this.bundleForm.controls).forEach(key => {
        this.bundleForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/bundles']);
  }
}
