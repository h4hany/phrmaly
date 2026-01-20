import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { VouchersService, VoucherListItem } from '../../../core/services/vouchers.service';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CanAccessDirective } from '../../../shared/directives/can-access.directive';
import { VoucherCardComponent } from '../../invoices/invoice-form/voucher-card.component';
import { Voucher } from '../../../core/models/voucher.model';

@Component({
  selector: 'app-vouchers-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent, TableComponent, ModalComponent, AlertComponent, TranslatePipe, DatePipe, CanAccessDirective, VoucherCardComponent],
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
              class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
            />
            <svg class="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div class="flex gap-3">
          <app-button variant="outline">{{ 'common.filters' | translate }}</app-button>
          <app-button variant="outline">{{ 'common.export' | translate }}</app-button>
          <app-button *appCanAccess="'voucher.create'" variant="primary" (onClick)="navigateToNew()">
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ 'button.createVoucher' | translate }}
          </app-button>
        </div>
      </div>

      <!-- Table -->
      <app-table
        [columns]="columns"
        [data]="vouchers"
        [pagination]="pagination"
        [emptyMessage]="'empty.noVouchers'"
        [loading]="loading"
        rowIdKey="id"
      >
        <ng-template #actionTemplate let-row>
          <div *appCanAccess="'voucher.actions'" class="flex items-center gap-2">
            <button class="p-1 text-gray-600 hover:text-gray-900" [title]="'common.view' | translate" (click)="viewVoucher(row)">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button class="p-1 text-gray-600 hover:text-gray-900" [title]="'common.edit' | translate" (click)="editVoucher(row.id)">
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

      <!-- View Voucher Modal -->
      <app-modal
        #viewModal
        [title]="'voucher.view' | translate"
        [showFooter]="false"
        [size]="'large'"
      >
        @if (selectedVoucher) {
          <div class="flex justify-center">
            <app-voucher-card
              [voucher]="selectedVoucher"
              [averageDiscountPercentage]="0"
            ></app-voucher-card>
          </div>
        }
      </app-modal>

      <!-- Delete Modal -->
      <app-modal
        #deleteModal
        [title]="'button.deleteVoucher' | translate"
        [showFooter]="true"
        [confirmText]="'common.delete' | translate"
        [confirmLoading]="deleting"
        (confirmed)="deleteVoucher()"
      >
        <p>{{ 'modal.deleteVoucherConfirm' | translate }} <strong>{{ selectedVoucherCode }}</strong>{{ 'modal.cannotUndo' | translate }}</p>
      </app-modal>
    </div>
  `,
  styles: []
})
export class VouchersListComponent implements OnInit {
  private router = inject(Router);
  private vouchersService = inject(VouchersService);

  vouchers: VoucherListItem[] = [];
  searchQuery = '';
  errorMessage = '';
  loading = false;
  deleting = false;
  selectedVoucherId: string | null = null;
  selectedVoucherCode = '';
  selectedVoucher: Voucher | null = null;
  @ViewChild('viewModal') viewModal!: ModalComponent;
  @ViewChild('deleteModal') deleteModal!: ModalComponent;

  columns: TableColumn[] = [
    { key: 'voucherCode', label: 'voucher.code', sortable: true },
    { key: 'voucherName', label: 'voucher.name', sortable: true },
    { key: 'patientName', label: 'voucher.patient', sortable: true },
    { key: 'amount', label: 'voucher.amount', sortable: true },
    { key: 'createdAt', label: 'voucher.createdAt', sortable: true },
    { key: 'validUntil', label: 'voucher.validUntil', sortable: true },
    { key: 'status', label: 'voucher.status', sortable: true },
    { key: 'actions', label: 'table.action' }
  ];

  pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  };

  ngOnInit(): void {
    this.loadVouchers();
  }

  loadVouchers(): void {
    this.loading = true;
    this.vouchersService.getAll({ page: this.pagination.page, pageSize: this.pagination.pageSize }).subscribe({
      next: (response) => {
        this.vouchers = response.data;
        this.pagination = {
          ...this.pagination,
          total: response.data.length,
          totalPages: Math.ceil(response.data.length / this.pagination.pageSize)
        };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load vouchers';
      }
    });
  }

  onSearch(): void {
    // Implement search logic
    this.loadVouchers();
  }

  viewVoucher(voucher: VoucherListItem): void {
    this.vouchersService.getById(voucher.id).subscribe({
      next: (voucher) => {
        this.selectedVoucher = voucher;
        if (voucher) {
          this.viewModal.open();
        }
      }
    });
  }

  editVoucher(id: string): void {
    this.router.navigate(['/vouchers', id, 'edit']);
  }

  navigateToNew(): void {
    this.router.navigate(['/vouchers/new']);
  }

  confirmDelete(voucher: VoucherListItem): void {
    this.selectedVoucherId = voucher.id;
    this.selectedVoucherCode = voucher.voucherCode;
    this.deleteModal.open();
  }

  deleteVoucher(): void {
    if (!this.selectedVoucherId) return;
    this.deleting = true;
    this.vouchersService.delete(this.selectedVoucherId).subscribe({
      next: () => {
        this.deleting = false;
        this.deleteModal.close();
        this.loadVouchers();
      },
      error: () => {
        this.deleting = false;
        this.errorMessage = 'Failed to delete voucher';
      }
    });
  }
}

