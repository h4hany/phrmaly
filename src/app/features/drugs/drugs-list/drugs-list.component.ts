import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { DrugsService } from '../../../core/services/drugs.service';
import { InvoiceCartService } from '../../../core/services/invoice-cart.service';
import { PharmacyDrug } from '../../../core/models/drug.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { DrugCardComponent } from '../drug-card/drug-card.component';
import type { DrugBadge } from '../drug-card/drug-card.component';

@Component({
  selector: 'app-drugs-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent, ModalComponent, AlertComponent, TranslatePipe, DrugCardComponent],
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
          <app-button 
            [variant]="selectionMode ? 'primary' : 'outline'" 
            (onClick)="toggleSelectionMode()"
          >
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ selectionMode ? ('button.cancelSelection' | translate) : ('button.selectForInvoice' | translate) }}
          </app-button>
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

      <!-- Selection Mode Bar -->
      @if (selectionMode && selectedDrugIds.size > 0) {
        <div class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white shadow-lg rounded-lg px-6 py-4 border-2 border-[#166534] flex items-center gap-4">
          <span class="text-gray-700 font-medium">
            {{ selectedDrugIds.size }} {{ 'invoice.drugsSelected' | translate }}
          </span>
          <app-button variant="primary" (onClick)="createInvoiceFromSelection()">
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {{ 'invoice.createInvoice' | translate }} ({{ selectedDrugIds.size }})
          </app-button>
          <button
            type="button"
            (click)="clearSelection()"
            class="text-gray-500 hover:text-gray-700"
            [title]="'common.clear' | translate"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }

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

      <!-- Cards Grid -->
      @if (loading) {
        <div class="flex items-center justify-center py-12">
          <div class="text-gray-500">{{ 'common.loading' | translate }}</div>
        </div>
      } @else if (drugs.length === 0) {
        <div class="flex flex-col items-center justify-center py-12 text-gray-500">
          <svg class="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p class="text-lg font-medium">{{ 'empty.noDrugs' | translate }}</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (drug of drugs; track drug.id) {
            <app-drug-card
              [drug]="drug"
              [badges]="getBadges(drug)"
              [selectionMode]="selectionMode"
              [selected]="selectedDrugIds.has(drug.id)"
              (view)="viewDrug(drug.id)"
              (edit)="editDrug(drug.id)"
              (delete)="confirmDelete(drug)"
              (selectionToggle)="onDrugSelectionToggle(drug.id, $event)"
            ></app-drug-card>
          }
        </div>
      }

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
  private invoiceCartService = inject(InvoiceCartService);

  drugs: PharmacyDrug[] = [];
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
  selectionMode = false;
  selectedDrugIds = new Set<string>();
  @ViewChild('deleteModal') deleteModal!: ModalComponent;
  @ViewChild('importModal') importModal!: ModalComponent;

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
        this.drugs = response.data;
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
          this.drugs = results;
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

  confirmDelete(drug: PharmacyDrug): void {
    this.selectedDrugId = drug.id;
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

  getBadges(drug: PharmacyDrug): DrugBadge[] {
    const badges: DrugBadge[] = [];
    
    // Low stock badge
    if (drug.stockQuantity <= drug.minimumStock) {
      badges.push({
        label: 'Low Stock',
        variant: 'warning'
      });
    }
    
    // Expiring soon badge
    if (drug.expiryDate) {
      const expiryDate = new Date(drug.expiryDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
        badges.push({
          label: 'Expiring Soon',
          variant: 'danger'
        });
      }
    }
    
    return badges;
  }

  toggleSelectionMode(): void {
    this.selectionMode = !this.selectionMode;
    if (!this.selectionMode) {
      this.selectedDrugIds.clear();
    }
  }

  onDrugSelectionToggle(drugId: string, selected: boolean): void {
    if (selected) {
      this.selectedDrugIds.add(drugId);
    } else {
      this.selectedDrugIds.delete(drugId);
    }
  }

  clearSelection(): void {
    this.selectedDrugIds.clear();
  }

  createInvoiceFromSelection(): void {
    if (this.selectedDrugIds.size === 0) return;

    // Get selected drugs
    const selectedDrugs = this.drugs.filter(drug => this.selectedDrugIds.has(drug.id));
    
    // Add all selected drugs to cart
    selectedDrugs.forEach(drug => {
      this.invoiceCartService.addDrug(drug);
    });

    // Clear selection and exit selection mode
    this.selectedDrugIds.clear();
    this.selectionMode = false;

    // Navigate to invoice form
    this.router.navigate(['/invoices/new']);
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }
}
