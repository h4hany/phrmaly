import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { PurchasesService } from '../../../core/services/purchases.service';
import { PurchaseInvoice } from '../../../core/models/purchase.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-purchases-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent, TableComponent, ModalComponent, AlertComponent, TranslatePipe],
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
          <app-button variant="primary" (onClick)="navigateToNew()">
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ 'button.addNewPurchase' | translate }}
          </app-button>
        </div>
      </div>

      <!-- Table -->
      <app-table
        [columns]="columns"
        [data]="purchases"
        [pagination]="pagination"
        [emptyMessage]="'empty.noPurchases'"
        [loading]="loading"
        rowIdKey="id"
      >
        <ng-template #actionTemplate let-row>
          <div class="flex items-center gap-2">
            <button class="p-1 text-gray-600 hover:text-gray-900" [title]="'common.view' | translate" (click)="viewPurchase(row.id)">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button class="p-1 text-gray-600 hover:text-gray-900" [title]="'common.edit' | translate" (click)="editPurchase(row.id)">
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

      <!-- Delete Modal -->
      <app-modal
        #deleteModal
        [title]="'button.deletePurchase' | translate"
        [showFooter]="true"
        [confirmText]="'common.delete' | translate"
        [confirmLoading]="deleting"
        (confirmed)="deletePurchase()"
      >
        <p>{{ 'modal.deletePurchaseConfirm' | translate }} <strong>{{ selectedInvoiceNumber }}</strong>{{ 'modal.cannotUndo' | translate }}</p>
      </app-modal>
    </div>
  `,
  styles: []
})
export class PurchasesListComponent implements OnInit {
  private router = inject(Router);
  private purchasesService = inject(PurchasesService);

  purchases: any[] = [];
  searchQuery = '';
  errorMessage = '';
  loading = false;
  deleting = false;
  selectedPurchaseId: string | null = null;
  selectedInvoiceNumber = '';
  @ViewChild('deleteModal') deleteModal!: ModalComponent;

  columns: TableColumn[] = [
    { key: 'invoiceNumber', label: 'table.invoiceNumber', sortable: true },
    { key: 'supplierName', label: 'table.supplier', sortable: true },
    { key: 'purchaseDate', label: 'table.purchaseDate', sortable: true },
    { key: 'dueDate', label: 'table.dueDate', sortable: true },
    { key: 'totalAmount', label: 'table.totalAmount', sortable: true },
    { key: 'paidAmount', label: 'table.paidAmount', sortable: true },
    { key: 'remainingAmount', label: 'table.remainingAmount', sortable: true },
    { key: 'paymentStatus', label: 'table.status', sortable: true },
    { key: 'actions', label: 'table.action' }
  ];

  pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  };

  ngOnInit(): void {
    this.loadPurchases();
  }

  loadPurchases(): void {
    this.loading = true;
    this.purchasesService.getAll({
      page: this.pagination.page,
      pageSize: this.pagination.pageSize
    }).subscribe({
      next: (response) => {
        this.purchases = response.data.map(p => ({
          ...p,
          supplierName: 'Supplier ' + p.supplierId,
          purchaseDate: this.formatDate(p.purchaseDate),
          dueDate: p.dueDate ? this.formatDate(p.dueDate) : 'N/A',
          totalAmount: p.totalAmount.toFixed(2),
          paidAmount: p.paidAmount.toFixed(2),
          remainingAmount: p.remainingAmount.toFixed(2)
        }));
        this.pagination = {
          page: response.page,
          pageSize: response.pageSize,
          total: response.total,
          totalPages: response.totalPages
        };
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load purchase invoices';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.loading = true;
      this.purchasesService.search(this.searchQuery).subscribe({
        next: (results) => {
          this.purchases = results.map(p => ({
            ...p,
            supplierName: 'Supplier ' + p.supplierId,
            purchaseDate: this.formatDate(p.purchaseDate),
            dueDate: p.dueDate ? this.formatDate(p.dueDate) : 'N/A',
            totalAmount: p.totalAmount.toFixed(2),
            paidAmount: p.paidAmount.toFixed(2),
            remainingAmount: p.remainingAmount.toFixed(2)
          }));
          this.pagination = {
            page: 1,
            pageSize: 10,
            total: results.length,
            totalPages: Math.ceil(results.length / 10)
          };
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Search failed';
          this.loading = false;
        }
      });
    } else {
      this.loadPurchases();
    }
  }

  navigateToNew(): void {
    this.router.navigate(['/purchases/new']);
  }

  viewPurchase(id: string): void {
    this.router.navigate(['/purchases', id]);
  }

  editPurchase(id: string): void {
    this.router.navigate(['/purchases', id, 'edit']);
  }

  confirmDelete(row: PurchaseInvoice): void {
    this.selectedPurchaseId = row.id;
    this.selectedInvoiceNumber = row.invoiceNumber;
    this.deleteModal.open();
  }

  deletePurchase(): void {
    if (!this.selectedPurchaseId) return;

    this.deleting = true;
    this.purchasesService.delete(this.selectedPurchaseId).subscribe({
      next: (success) => {
        if (success) {
          this.loadPurchases();
          this.deleteModal.close();
          this.selectedPurchaseId = null;
          this.selectedInvoiceNumber = '';
        }
        this.deleting = false;
      },
      error: () => {
        this.errorMessage = 'Failed to delete purchase invoice';
        this.deleting = false;
      }
    });
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }
}
