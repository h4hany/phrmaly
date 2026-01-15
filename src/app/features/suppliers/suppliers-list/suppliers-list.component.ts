import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { SuppliersService } from '../../../core/services/suppliers.service';
import { Supplier } from '../../../core/models/supplier.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-suppliers-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, TableComponent, ModalComponent, AlertComponent, TranslatePipe],
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
          <select
            [(ngModel)]="selectedType"
            (change)="onFilterChange()"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
          >
            <option value="">{{ 'button.allTypes' | translate }}</option>
            <option value="manufacturer">{{ 'button.manufacturer' | translate }}</option>
            <option value="warehouse">{{ 'button.warehouse' | translate }}</option>
          </select>
          <select
            [(ngModel)]="selectedStatus"
            (change)="onFilterChange()"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534]"
          >
            <option value="">{{ 'button.allStatus' | translate }}</option>
            <option value="active">{{ 'button.active' | translate }}</option>
            <option value="inactive">{{ 'button.inactive' | translate }}</option>
          </select>
          <app-button variant="outline">{{ 'common.export' | translate }}</app-button>
          <app-button variant="primary" (onClick)="navigateToNew()">
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ 'button.addNewSupplier' | translate }}
          </app-button>
        </div>
      </div>

      <!-- Table -->
      <app-table
        [columns]="columns"
        [data]="suppliers"
        [pagination]="pagination"
        [emptyMessage]="'empty.noSuppliers'"
        [loading]="loading"
        rowIdKey="id"
      >
        <ng-template #actionTemplate let-row>
          <div class="flex items-center gap-2">
            <button class="p-1 text-gray-600 hover:text-gray-900" [title]="'common.edit' | translate" (click)="editSupplier(row.id)">
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
        [title]="'button.deleteSupplier' | translate"
        [showFooter]="true"
        [confirmText]="'common.delete' | translate"
        [confirmLoading]="deleting"
        (confirmed)="deleteSupplier()"
      >
        <p>{{ 'modal.deleteSupplierConfirm' | translate }} <strong>{{ selectedSupplierName }}</strong>{{ 'modal.cannotUndo' | translate }}</p>
      </app-modal>
    </div>
  `,
  styles: []
})
export class SuppliersListComponent implements OnInit {
  private router = inject(Router);
  private suppliersService = inject(SuppliersService);

  suppliers: Supplier[] = [];
  searchQuery = '';
  selectedType = '';
  selectedStatus = '';
  errorMessage = '';
  loading = false;
  deleting = false;
  selectedSupplierId: string | null = null;
  selectedSupplierName = '';
  @ViewChild('deleteModal') deleteModal!: ModalComponent;

  columns: TableColumn[] = [
    { key: 'id', label: 'table.supplierId', sortable: true },
    { key: 'name', label: 'table.name', sortable: true },
    { key: 'type', label: 'table.type', sortable: true },
    { key: 'phone', label: 'table.phone' },
    { key: 'email', label: 'table.email' },
    { key: 'status', label: 'table.status' },
    { key: 'actions', label: 'table.action' }
  ];

  pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  };

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.loading = true;
    this.suppliersService.getAll({
      page: this.pagination.page,
      pageSize: this.pagination.pageSize
    }).subscribe({
      next: (response) => {
        let filtered = response.data;
        
        if (this.selectedType) {
          filtered = filtered.filter(s => s.type === this.selectedType);
        }
        if (this.selectedStatus) {
          filtered = filtered.filter(s => s.status === this.selectedStatus);
        }

        this.suppliers = filtered;
        this.pagination = {
          page: response.page,
          pageSize: response.pageSize,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / response.pageSize)
        };
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load suppliers';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.loading = true;
      this.suppliersService.search(this.searchQuery).subscribe({
        next: (results) => {
          this.suppliers = results;
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
      this.loadSuppliers();
    }
  }

  onFilterChange(): void {
    this.loadSuppliers();
  }

  navigateToNew(): void {
    this.router.navigate(['/suppliers/new']);
  }

  editSupplier(id: string): void {
    this.router.navigate(['/suppliers', id, 'edit']);
  }

  confirmDelete(row: Supplier): void {
    this.selectedSupplierId = row.id;
    this.selectedSupplierName = row.name;
    this.deleteModal.open();
  }

  deleteSupplier(): void {
    if (!this.selectedSupplierId) return;

    this.deleting = true;
    this.suppliersService.delete(this.selectedSupplierId).subscribe({
      next: (success) => {
        if (success) {
          this.loadSuppliers();
          this.deleteModal.close();
          this.selectedSupplierId = null;
          this.selectedSupplierName = '';
        }
        this.deleting = false;
      },
      error: () => {
        this.errorMessage = 'Failed to delete supplier';
        this.deleting = false;
      }
    });
  }
}
