import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { ActionToolbarComponent } from '../../../shared/components/action-toolbar/action-toolbar.component';
import { TransferEngineService } from '../../../core/engines/transfer-engine.service';
import { TransferRequest } from '../../../core/models/transfer.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-transfers-list',
  standalone: true,
  imports: [CommonModule, TableComponent, ActionToolbarComponent, TranslatePipe],
  template: `
    <div class="space-y-6">
      <app-action-toolbar
        title="transfers.title"
        [showSearch]="true"
        [showFilter]="true"
        [primaryAction]="primaryAction"
        (onSearch)="handleSearch($event)"
        (onFilter)="showFilters = !showFilters"
      ></app-action-toolbar>

      <app-table
        [columns]="columns"
        [data]="transfers"
        [pagination]="pagination"
        [loading]="loading"
        [emptyMessage]="'transfers.empty'"
        (onPageChange)="handlePageChange($event)"
      >
        <ng-template #actionTemplate let-transfer>
          <div class="flex gap-2">
            <button
              (click)="viewDetail(transfer.id)"
              class="text-sm px-3 py-1 rounded text-blue-600 hover:bg-blue-50"
            >
              {{ 'common.view' | translate }}
            </button>
          </div>
        </ng-template>
      </app-table>
    </div>
  `,
  styles: []
})
export class TransfersListComponent implements OnInit {
  private transferEngine = inject(TransferEngineService);
  router = inject(Router);

  transfers: TransferRequest[] = [];
  loading = false;
  showFilters = false;
  pagination: any = null;

  columns: TableColumn[] = [
    { key: 'id', label: 'table.id', sortable: true },
    { key: 'fromBranchName', label: 'transfers.fromBranch' },
    { key: 'toBranchName', label: 'transfers.toBranch' },
    { key: 'status', label: 'transfers.status' },
    { key: 'requestedByName', label: 'transfers.requestedBy' },
    { key: 'createdAt', label: 'transfers.createdAt', sortable: true }
  ];

  primaryAction = {
    label: 'transfers.new',
    onClick: () => this.router.navigate(['/inventory/transfers/new']),
    variant: 'primary' as const
  };

  ngOnInit(): void {
    this.loadTransfers();
  }

  loadTransfers(): void {
    this.loading = true;
    this.transferEngine.getTransfers({ page: this.pagination?.page || 1, pageSize: 10 }).subscribe({
      next: (response) => {
        this.transfers = response.data;
        this.pagination = {
          page: response.page,
          pageSize: response.pageSize,
          total: response.total,
          totalPages: response.totalPages
        };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  handlePageChange(page: number): void {
    if (this.pagination) {
      this.pagination.page = page;
      this.loadTransfers();
    }
  }

  handleSearch(query: string): void {
    this.loadTransfers();
  }

  viewDetail(id: string): void {
    this.router.navigate(['/inventory/transfers', id]);
  }
}
