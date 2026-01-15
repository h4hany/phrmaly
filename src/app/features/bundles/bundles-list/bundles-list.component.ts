import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { BundlesService } from '../../../core/services/bundles.service';
import { Bundle } from '../../../core/models/bundle.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-bundles-list',
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
          <app-button variant="outline">{{ 'common.export' | translate }}</app-button>
          <app-button variant="primary" (onClick)="navigateToNew()">
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ 'button.addNewBundle' | translate }}
          </app-button>
        </div>
      </div>

      <!-- Table -->
      <app-table
        [columns]="columns"
        [data]="bundles"
        [emptyMessage]="'empty.noBundles'"
        [loading]="loading"
        rowIdKey="id"
      >
        <ng-template #actionTemplate let-row>
          <div class="flex items-center gap-2">
            <button class="p-1 text-gray-600 hover:text-gray-900" [title]="'common.edit' | translate" (click)="editBundle(row.id)">
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
        [title]="'button.deleteBundle' | translate"
        [showFooter]="true"
        [confirmText]="'common.delete' | translate"
        [confirmLoading]="deleting"
        (confirmed)="deleteBundle()"
      >
        <p>{{ 'modal.deleteBundleConfirm' | translate }} <strong>{{ selectedBundleName }}</strong>{{ 'modal.cannotUndo' | translate }}</p>
      </app-modal>
    </div>
  `,
  styles: []
})
export class BundlesListComponent implements OnInit {
  private router = inject(Router);
  private bundlesService = inject(BundlesService);

  bundles: any[] = [];
  searchQuery = '';
  errorMessage = '';
  loading = false;
  deleting = false;
  selectedBundleId: string | null = null;
  selectedBundleName = '';
  @ViewChild('deleteModal') deleteModal!: ModalComponent;

  columns: TableColumn[] = [
    { key: 'id', label: 'table.bundleId', sortable: true },
    { key: 'name', label: 'table.name', sortable: true },
    { key: 'fixedPrice', label: 'table.fixedPrice', sortable: true },
    { key: 'itemsCount', label: 'table.items', sortable: true },
    { key: 'status', label: 'table.status', sortable: true },
    { key: 'actions', label: 'table.action' }
  ];

  ngOnInit(): void {
    this.loadBundles();
  }

  loadBundles(): void {
    this.loading = true;
    this.bundlesService.getAll().subscribe({
      next: (bundles) => {
        this.bundles = bundles.map(b => ({
          ...b,
          fixedPrice: b.fixedPrice.toFixed(2),
          itemsCount: b.items.length
        }));
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load bundles';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      this.bundles = this.bundles.filter(b =>
        b.name.toLowerCase().includes(query) ||
        b.id.toLowerCase().includes(query)
      );
    } else {
      this.loadBundles();
    }
  }

  navigateToNew(): void {
    this.router.navigate(['/bundles/new']);
  }

  editBundle(id: string): void {
    this.router.navigate(['/bundles', id, 'edit']);
  }

  confirmDelete(row: Bundle): void {
    this.selectedBundleId = row.id;
    this.selectedBundleName = row.name;
    this.deleteModal.open();
  }

  deleteBundle(): void {
    if (!this.selectedBundleId) return;

    this.deleting = true;
    this.bundlesService.delete(this.selectedBundleId).subscribe({
      next: (success) => {
        if (success) {
          this.loadBundles();
          this.deleteModal.close();
          this.selectedBundleId = null;
          this.selectedBundleName = '';
        }
        this.deleting = false;
      },
      error: () => {
        this.errorMessage = 'Failed to delete bundle';
        this.deleting = false;
      }
    });
  }
}

