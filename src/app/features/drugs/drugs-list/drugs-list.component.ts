import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { DrugsService } from '../../../core/services/drugs.service';
import { PharmacyDrug } from '../../../core/models/drug.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-drugs-list',
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
              [placeholder]="'button.searchByNameBarcode' | translate"
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
          <app-button variant="outline">{{ 'common.filters' | translate }}</app-button>
          <app-button variant="outline" (onClick)="openImportModal()">
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {{ 'button.import' | translate }}
          </app-button>
          <app-button variant="outline">{{ 'common.export' | translate }}</app-button>
          <app-button variant="primary" (onClick)="navigateToNew()">
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ 'button.addNewDrug' | translate }}
          </app-button>
        </div>
      </div>

      <!-- Alerts for Low Stock and Expiring Drugs -->
      @if (lowStockCount > 0) {
        <app-alert type="warning" [title]="'alert.lowStockTitle' | translate">
          {{ lowStockCount }} {{ 'alert.lowStockMessage' | translate }}
        </app-alert>
      }
      @if (expiringCount > 0) {
        <app-alert type="warning" [title]="'alert.expiryTitle' | translate">
          {{ expiringCount }} {{ 'alert.expiryMessage' | translate }}
        </app-alert>
      }

      <!-- Table -->
      <app-table
        [columns]="columns"
        [data]="drugs"
        [pagination]="pagination"
        [emptyMessage]="'empty.noDrugs'"
        [loading]="loading"
        rowIdKey="id"
      >
        <ng-template #actionTemplate let-row>
          <div class="flex items-center gap-2">
            <button class="p-1 text-gray-600 hover:text-gray-900" [title]="'common.view' | translate" (click)="viewDrug(row.id)">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button class="p-1 text-gray-600 hover:text-gray-900" [title]="'common.edit' | translate" (click)="editDrug(row.id)">
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
        [title]="'button.deleteDrug' | translate"
        [showFooter]="true"
        [confirmText]="'common.delete' | translate"
        [confirmLoading]="deleting"
        (confirmed)="deleteDrug()"
      >
        <p>{{ 'modal.deleteDrugConfirm' | translate }}</p>
      </app-modal>

      <!-- Import Modal -->
      <app-modal
        #importModal
        [title]="'button.importDrugs' | translate"
        [showFooter]="true"
        [confirmText]="'button.upload' | translate"
        [confirmLoading]="importing"
        (confirmed)="handleImport()"
      >
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ 'button.selectFile' | translate }}
            </label>
            <input
              type="file"
              #fileInput
              (change)="onFileSelected($event)"
              accept=".csv,.xlsx,.xls"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-[#166534] text-sm"
            />
            <p class="mt-2 text-xs text-gray-500">
              {{ 'button.importFileFormat' | translate }}
            </p>
            @if (selectedFile) {
              <p class="mt-2 text-sm text-gray-700">
                <span class="font-medium">{{ 'button.selectedFile' | translate }}:</span> {{ selectedFile.name }}
              </p>
            }
          </div>
          @if (importError) {
            <app-alert type="error" [title]="importError"></app-alert>
          }
          @if (importSuccess) {
            <app-alert type="success" [title]="importSuccess"></app-alert>
          }
        </div>
      </app-modal>
    </div>
  `,
  styles: []
})
export class DrugsListComponent implements OnInit {
  private router = inject(Router);
  private drugsService = inject(DrugsService);

  drugs: any[] = [];
  searchQuery = '';
  errorMessage = '';
  loading = false;
  deleting = false;
  selectedDrugId: string | null = null;
  lowStockCount = 0;
  expiringCount = 0;
  importing = false;
  selectedFile: File | null = null;
  importError = '';
  importSuccess = '';
  @ViewChild('deleteModal') deleteModal!: ModalComponent;
  @ViewChild('importModal') importModal!: ModalComponent;

  columns: TableColumn[] = [
    { key: 'internalBarcode', label: 'table.barcode', sortable: true },
    { key: 'drugName', label: 'table.drugName', sortable: true },
    { key: 'price', label: 'table.price', sortable: true },
    { key: 'stockQuantity', label: 'table.stock', sortable: true },
    { key: 'expiryDate', label: 'table.expiryDate', sortable: true },
    { key: 'status', label: 'table.status', sortable: true },
    { key: 'actions', label: 'table.action' }
  ];

  pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  };

  ngOnInit(): void {
    this.loadDrugs();
    this.checkAlerts();
  }

  loadDrugs(): void {
    this.loading = true;
    this.drugsService.getPharmacyDrugs({
      page: this.pagination.page,
      pageSize: this.pagination.pageSize
    }).subscribe({
      next: (response) => {
        this.drugs = response.data.map(drug => ({
          ...drug,
          drugName: drug.generalDrug?.name || 'N/A',
          price: drug.price.toFixed(2),
          expiryDate: drug.expiryDate ? this.formatDate(drug.expiryDate) : 'N/A'
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
        this.errorMessage = 'Failed to load drugs';
        this.loading = false;
      }
    });
  }

  checkAlerts(): void {
    this.drugsService.getLowStockDrugs().subscribe({
      next: (drugs) => {
        this.lowStockCount = drugs.length;
      }
    });

    this.drugsService.getExpiringDrugs(30).subscribe({
      next: (drugs) => {
        this.expiringCount = drugs.length;
      }
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.loading = true;
      this.drugsService.searchPharmacyDrugs(this.searchQuery).subscribe({
        next: (results) => {
          this.drugs = results.map(drug => ({
            ...drug,
            drugName: drug.generalDrug?.name || 'N/A',
            price: drug.price.toFixed(2),
            expiryDate: drug.expiryDate ? this.formatDate(drug.expiryDate) : 'N/A'
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
      this.loadDrugs();
    }
  }

  navigateToNew(): void {
    this.router.navigate(['/drugs/new']);
  }

  viewDrug(id: string): void {
    this.router.navigate(['/drugs', id]);
  }

  editDrug(id: string): void {
    this.router.navigate(['/drugs', id, 'edit']);
  }

  confirmDelete(row: any): void {
    this.selectedDrugId = row.id;
    this.deleteModal.open();
  }

  deleteDrug(): void {
    if (!this.selectedDrugId) return;

    this.deleting = true;
    this.drugsService.deletePharmacyDrug(this.selectedDrugId).subscribe({
      next: (success) => {
        if (success) {
          this.loadDrugs();
          this.checkAlerts();
          this.deleteModal.close();
          this.selectedDrugId = null;
        }
        this.deleting = false;
      },
      error: () => {
        this.errorMessage = 'Failed to delete drug';
        this.deleting = false;
      }
    });
  }

  openImportModal(): void {
    this.selectedFile = null;
    this.importError = '';
    this.importSuccess = '';
    this.importModal.open();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension && ['csv', 'xlsx', 'xls'].includes(fileExtension)) {
        this.selectedFile = file;
        this.importError = '';
      } else {
        this.importError = 'Please select a valid CSV or Excel file';
        this.selectedFile = null;
      }
    }
  }

  handleImport(): void {
    if (!this.selectedFile) {
      this.importError = 'Please select a file to import';
      return;
    }

    this.importing = true;
    this.importError = '';
    this.importSuccess = '';

    // TODO: Implement actual CSV/Excel parsing and import logic
    // For now, this is a placeholder that simulates import
    setTimeout(() => {
      this.importing = false;
      this.importSuccess = `File "${this.selectedFile!.name}" uploaded successfully. Import functionality will process the file.`;
      
      // Clear file after a delay
      setTimeout(() => {
        this.selectedFile = null;
        this.importModal.close();
        this.loadDrugs(); // Refresh the list
      }, 2000);
    }, 1500);
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }
}
