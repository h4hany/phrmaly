import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DrugsService } from '../../../core/services/drugs.service';
import { ModernFormWrapperComponent } from '../../../shared/components/modern-form-wrapper/modern-form-wrapper.component';
import { FormSectionComponent } from '../../../shared/components/form-section/form-section.component';
import { RadioInputComponent } from '../../../shared/components/input/radio-input.component';
import { TextInputComponent } from '../../../shared/components/input/text-input.component';
import { AutocompleteInputComponent, AutocompleteOption } from '../../../shared/components/input/autocomplete-input.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-drug-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ModernFormWrapperComponent,
    FormSectionComponent,
    RadioInputComponent,
    TextInputComponent,
    AutocompleteInputComponent,
    TranslatePipe
  ],
  template: `
    <app-modern-form-wrapper
      [title]="(isEdit ? 'form.editDrug' : 'form.addDrug')"
      [description]="(isEdit ? 'form.editDrugDescription' : 'form.addDrugDescription')"
      [errorMessage]="errorMessage"
    >
      <form [formGroup]="drugForm" (ngSubmit)="onSubmit()" class="p-8">
        <!-- General Information Section -->
        <app-form-section [title]="'drug.generalInfo'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <app-autocomplete-input
                formControlName="generalDrugId"
                label="form.drug.generalDrug"
                [required]="true"
                [options]="generalDrugOptions"
                [placeholder]="'form.selectGeneralDrug'"
                prefixIcon="medicine"
                [hasError]="!!(drugForm.get('generalDrugId')?.invalid && drugForm.get('generalDrugId')?.touched)"
                [errorMessage]="(drugForm.get('generalDrugId')?.invalid && drugForm.get('generalDrugId')?.touched) ? 'validation.generalDrugRequired' : undefined"
              ></app-autocomplete-input>
            </div>

            <div>
              <app-text-input
                type="text"
                formControlName="internalBarcode"
                [label]="'form.drug.internalBarcode'"
                [placeholder]="'placeholder.barcode'"
                [maxlength]="8"
                [required]="true"
                [hasError]="!!(drugForm.get('internalBarcode')?.invalid && drugForm.get('internalBarcode')?.touched)"
                [errorMessage]="(drugForm.get('internalBarcode')?.invalid && drugForm.get('internalBarcode')?.touched) ? 'validation.barcodeRequired' : undefined"
                prefixIcon="barcode"
              ></app-text-input>
            </div>

            <div>
              <app-text-input
                type="number"
                formControlName="price"
                [label]="'drug.price'"
                [step]="0.01"
                [min]="0"
                [required]="true"
                prefixIcon="currency-dollar"
              ></app-text-input>
            </div>

            <div>
              <app-text-input
                type="number"
                formControlName="priceAfterDiscount"
                [label]="'form.drug.priceAfterDiscount'"
                [step]="0.01"
                [min]="0"
                prefixIcon="currency-dollar"
              ></app-text-input>
            </div>

            <div>
              <app-text-input
                type="date"
                formControlName="expiryDate"
                [label]="'drug.expiryDate'"
                prefixIcon="calendar"
              ></app-text-input>
            </div>

            <div>
              <app-autocomplete-input
                formControlName="status"
                [label]="'form.drug.status'"
                [options]="statusOptions"
                [placeholder]="'form.selectStatus'"
                prefixIcon="check-circle"
              ></app-autocomplete-input>
            </div>
          </div>
        </app-form-section>

        <!-- Stock Information Section -->
        <app-form-section [title]="'drug.stockInfo'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <app-text-input
                type="number"
                formControlName="stockQuantity"
                [label]="'form.drug.stockQuantity'"
                [min]="0"
                [required]="true"
                prefixIcon="package"
              ></app-text-input>
            </div>

            <div>
              <app-text-input
                type="number"
                formControlName="minimumStock"
                [label]="'form.drug.minimumStock'"
                [min]="0"
                [required]="true"
                prefixIcon="package"
              ></app-text-input>
            </div>
          </div>
        </app-form-section>

        <!-- Classification & Origin Section -->
        <app-form-section [title]="'drug.classificationAndOrigin'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <app-radio-input
                formControlName="classification"
                [label]="'drug.classification'"
                [radioOptions]="classificationOptions"
              ></app-radio-input>
            </div>

            <div>
              <app-radio-input
                formControlName="origin"
                [label]="'drug.origin'"
                [radioOptions]="originOptions"
              ></app-radio-input>
            </div>
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
            [disabled]="drugForm.invalid || loading"
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
            {{ (isEdit ? 'form.updateDrug' : 'form.createDrug') | translate }}
          </button>
        </div>
      </form>
    </app-modern-form-wrapper>
  `,
  styles: []
})
export class DrugFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private drugsService = inject(DrugsService);

  drugForm!: FormGroup;
  loading = false;
  errorMessage = '';
  isEdit = false;
  drugId: string | null = null;
  generalDrugs: any[] = [];
  generalDrugOptions: AutocompleteOption[] = [];
  statusOptions: AutocompleteOption[] = [
    { value: 'active', label: 'common.active' },
    { value: 'inactive', label: 'common.inactive' },
    { value: 'out_of_stock', label: 'form.drug.outOfStock' }
  ];
  classificationOptions: Array<{ value: any; label: string }> = [
    { value: 'medicinal', label: 'drug.classification.medicinal' },
    { value: 'cosmetic', label: 'drug.classification.cosmetic' }
  ];
  originOptions: Array<{ value: any; label: string }> = [
    { value: 'local', label: 'drug.origin.local' },
    { value: 'imported', label: 'drug.origin.imported' }
  ];

  ngOnInit(): void {
    this.drugId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.drugId;

    this.drugForm = this.fb.group({
      generalDrugId: ['', [Validators.required]],
      internalBarcode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(8)]],
      price: [0, [Validators.required, Validators.min(0)]],
      priceAfterDiscount: [0, [Validators.min(0)]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      minimumStock: [0, [Validators.required, Validators.min(0)]],
      expiryDate: [''],
      status: ['active'],
      classification: ['medicinal'],
      origin: ['local']
    });

    this.loadGeneralDrugs();

    if (this.isEdit && this.drugId) {
      this.loadDrug();
    }
  }

  private loadGeneralDrugs(): void {
    this.drugsService.getAllGeneralDrugs().subscribe({
      next: (drugs) => {
        this.generalDrugs = drugs;
        this.generalDrugOptions = drugs.map(drug => ({
          value: drug.id,
          label: `${drug.name} - ${drug.manufacturer}`
        }));
      }
    });
  }

  private loadDrug(): void {
    this.drugsService.getPharmacyDrugById(this.drugId!).subscribe({
      next: (drug) => {
        if (drug) {
          this.drugForm.patchValue({
            generalDrugId: drug.generalDrugId,
            internalBarcode: drug.internalBarcode,
            price: drug.price,
            priceAfterDiscount: drug.priceAfterDiscount,
            stockQuantity: drug.stockQuantity,
            minimumStock: drug.minimumStock,
            expiryDate: drug.expiryDate ? this.formatDateForInput(drug.expiryDate) : '',
            status: drug.status,
            classification: drug.classification || 'medicinal',
            origin: drug.origin || 'local'
          });
        }
      },
      error: () => {
        this.errorMessage = 'error.loadDrug';
      }
    });
  }

  onSubmit(): void {
    if (this.drugForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const formValue = this.drugForm.value;
      const drugData = {
        generalDrugId: formValue.generalDrugId,
        pharmacyId: 'ph1',
        internalBarcode: formValue.internalBarcode,
        price: formValue.price,
        priceAfterDiscount: formValue.priceAfterDiscount || formValue.price,
        stockQuantity: formValue.stockQuantity,
        minimumStock: formValue.minimumStock,
        expiryDate: formValue.expiryDate ? new Date(formValue.expiryDate) : undefined,
        status: formValue.status,
        classification: formValue.classification,
        origin: formValue.origin
      };

      const operation = this.isEdit
        ? this.drugsService.updatePharmacyDrug(this.drugId!, drugData)
        : this.drugsService.createPharmacyDrug(drugData);

      operation.subscribe({
        next: () => {
          this.router.navigate(['/drugs']);
        },
        error: (error) => {
          this.errorMessage = error.message || 'error.saveDrug';
          this.loading = false;
        }
      });
    } else {
      Object.keys(this.drugForm.controls).forEach(key => {
        this.drugForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/drugs']);
  }

  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
