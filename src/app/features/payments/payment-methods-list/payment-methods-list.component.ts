import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { PaymentMethodsService } from '../../../core/services/payment-methods.service';
import { PaymentMethod } from '../../../core/models/payment-method.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-payment-methods-list',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    TableComponent,
    ModalComponent,
    AlertComponent,
    TranslatePipe,
    ReactiveFormsModule
  ],
  template: `
    <div class="space-y-6">
      @if (errorMessage) {
        <app-alert type="error" [title]="errorMessage" />
      }

      <!-- Header Actions -->
      <div class="flex items-center justify-between gap-4">
        <div class="flex-1 max-w-lg">
          <div class="relative">
            <input
              type="text"
              [placeholder]="'common.search' | translate"
              [value]="searchQuery"
              (input)="searchQuery = $any($event.target).value; onSearch()"
              class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-[#166534]"
            />
            <svg class="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div class="flex gap-3">
          <app-button variant="outline">{{ 'common.export' | translate }}</app-button>
          <app-button variant="primary" (onClick)="openCreateModal()">
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ 'button.createPaymentMethod' | translate }}
          </app-button>
        </div>
      </div>

      <!-- Table -->
      <app-table
        [columns]="columns"
        [data]="paymentMethods"
        [pagination]="pagination"
        [emptyMessage]="'empty.noPaymentMethods'"
        [loading]="loading"
        rowIdKey="id"
      >
        <ng-template #actionTemplate let-row>
          <div class="flex items-center gap-2">
            <button class="p-1 text-gray-600 hover:text-gray-900" [title]="'common.edit' | translate" (click)="editPaymentMethod(row)">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button class="p-1 text-gray-600 hover:text-red-600" [title]="'common.delete' | translate" (click)="confirmDelete(row)">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </ng-template>
      </app-table>

      <!-- Create/Edit Modal -->
      <app-modal
        #paymentMethodModal
        [title]="(isEdit ? 'form.editPaymentMethod' : 'form.addPaymentMethod') | translate"
        [showFooter]="true"
        [confirmText]="(isEdit ? 'common.update' : 'common.create') | translate"
        [confirmLoading]="saving"
        (confirmed)="onSubmit()"
        (closed)="closeModal()"
      >
        <form [formGroup]="paymentMethodForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ 'form.paymentMethod.name' | translate }} <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              formControlName="name"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
              [class.border-red-500]="paymentMethodForm.get('name')?.invalid && paymentMethodForm.get('name')?.touched"
            />
            @if (paymentMethodForm.get('name')?.invalid && paymentMethodForm.get('name')?.touched) {
              <p class="mt-1 text-sm text-red-600">{{ 'form.paymentMethod.nameRequired' | translate }}</p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ 'form.paymentMethod.deductionRate' | translate }} <span class="text-red-500">*</span>
            </label>
            <input
              type="number"
              formControlName="deductionRate"
              step="0.01"
              min="0"
              max="100"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
              [class.border-red-500]="paymentMethodForm.get('deductionRate')?.invalid && paymentMethodForm.get('deductionRate')?.touched"
            />
            @if (paymentMethodForm.get('deductionRate')?.invalid && paymentMethodForm.get('deductionRate')?.touched) {
              <p class="mt-1 text-sm text-red-600">{{ 'form.paymentMethod.deductionRateRequired' | translate }}</p>
            }
            <p class="mt-1 text-xs text-gray-500">{{ 'form.paymentMethod.deductionRateHint' | translate }}</p>
          </div>
        </form>
      </app-modal>

      <!-- Delete Modal -->
      <app-modal
        #deleteModal
        [title]="'button.deletePaymentMethod' | translate"
        [showFooter]="true"
        [confirmText]="'common.delete' | translate"
        [confirmLoading]="deleting"
        (confirmed)="deletePaymentMethod()"
      >
        <p>{{ 'modal.deletePaymentMethodConfirm' | translate }} <strong>{{ selectedPaymentMethodName }}</strong>{{ 'modal.cannotUndo' | translate }}</p>
      </app-modal>
    </div>
  `,
  styles: []
})
export class PaymentMethodsListComponent implements OnInit {
  private paymentMethodsService = inject(PaymentMethodsService);
  private fb = inject(FormBuilder);

  paymentMethods: PaymentMethod[] = [];
  searchQuery = '';
  errorMessage = '';
  loading = false;
  saving = false;
  deleting = false;
  isEdit = false;
  selectedPaymentMethodId: string | null = null;
  selectedPaymentMethodName = '';
  paymentMethodForm!: FormGroup;

  @ViewChild('paymentMethodModal') paymentMethodModal!: ModalComponent;
  @ViewChild('deleteModal') deleteModal!: ModalComponent;

  columns: TableColumn[] = [
    { key: 'id', label: 'table.id', sortable: true },
    { key: 'name', label: 'table.name', sortable: true },
    { key: 'deductionRateDisplay', label: 'table.deductionRate', sortable: true },
    { key: 'createdAtDisplay', label: 'table.createdAt', sortable: true },
    { key: 'actions', label: 'table.action' }
  ];

  pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  };

  ngOnInit(): void {
    this.initForm();
    this.loadPaymentMethods();
  }

  initForm(): void {
    this.paymentMethodForm = this.fb.group({
      name: ['', [Validators.required]],
      deductionRate: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  loadPaymentMethods(): void {
    this.loading = true;
    this.errorMessage = '';

    this.paymentMethodsService.getAll({
      page: this.pagination.page,
      pageSize: this.pagination.pageSize
    }).subscribe({
      next: (response) => {
        // Format deductionRate and createdAt for display
        this.paymentMethods = response.data.map(pm => ({
          ...pm,
          deductionRateDisplay: `${pm.deductionRate}%`,
          createdAtDisplay: new Date(pm.createdAt).toLocaleDateString()
        }));
        this.pagination = {
          page: response.page,
          pageSize: response.pageSize,
          total: response.total,
          totalPages: response.totalPages
        };
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load payment methods';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.paymentMethodsService.search(this.searchQuery).subscribe({
        next: (results) => {
          this.paymentMethods = results.map(pm => ({
            ...pm,
            deductionRateDisplay: `${pm.deductionRate}%`,
            createdAtDisplay: new Date(pm.createdAt).toLocaleDateString()
          }));
        },
        error: (error) => {
          this.errorMessage = error.message || 'Search failed';
        }
      });
    } else {
      this.loadPaymentMethods();
    }
  }

  openCreateModal(): void {
    this.isEdit = false;
    this.selectedPaymentMethodId = null;
    this.paymentMethodForm.reset({
      name: '',
      deductionRate: 0
    });
    this.paymentMethodModal.open();
  }

  editPaymentMethod(paymentMethod: PaymentMethod): void {
    this.isEdit = true;
    this.selectedPaymentMethodId = paymentMethod.id;
    this.paymentMethodForm.patchValue({
      name: paymentMethod.name,
      deductionRate: paymentMethod.deductionRate
    });
    this.paymentMethodModal.open();
  }

  closeModal(): void {
    this.paymentMethodForm.reset({
      name: '',
      deductionRate: 0
    });
    this.isEdit = false;
    this.selectedPaymentMethodId = null;
  }

  onSubmit(): void {
    if (this.paymentMethodForm.valid) {
      this.saving = true;
      this.errorMessage = '';

      const formValue = this.paymentMethodForm.value;
      const paymentMethodData = {
        name: formValue.name,
        deductionRate: formValue.deductionRate
      };

      const operation = this.isEdit && this.selectedPaymentMethodId
        ? this.paymentMethodsService.update(this.selectedPaymentMethodId, paymentMethodData)
        : this.paymentMethodsService.create(paymentMethodData);

      operation.subscribe({
        next: () => {
          this.saving = false;
          this.paymentMethodModal.close();
          this.loadPaymentMethods();
        },
        error: (error) => {
          this.errorMessage = error.message || 'An error occurred while saving the payment method';
          this.saving = false;
        }
      });
    } else {
      Object.keys(this.paymentMethodForm.controls).forEach(key => {
        this.paymentMethodForm.get(key)?.markAsTouched();
      });
    }
  }

  confirmDelete(paymentMethod: PaymentMethod): void {
    this.selectedPaymentMethodId = paymentMethod.id;
    this.selectedPaymentMethodName = paymentMethod.name;
    this.deleteModal.open();
  }

  deletePaymentMethod(): void {
    if (!this.selectedPaymentMethodId) return;

    this.deleting = true;
    this.paymentMethodsService.delete(this.selectedPaymentMethodId).subscribe({
      next: (success) => {
        if (success) {
          this.deleteModal.close();
          this.loadPaymentMethods();
        } else {
          this.errorMessage = 'Failed to delete payment method';
        }
        this.deleting = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to delete payment method';
        this.deleting = false;
      }
    });
  }
}

