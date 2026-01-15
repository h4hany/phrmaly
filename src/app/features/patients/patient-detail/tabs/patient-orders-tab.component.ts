import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoicesService } from '../../../../core/services/invoices.service';
import { TableComponent, TableColumn } from '../../../../shared/components/table/table.component';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { Invoice } from '../../../../core/models/invoice.model';

@Component({
  selector: 'patient-orders-tab',
  standalone: true,
  imports: [CommonModule, TableComponent, TranslatePipe],
  template: `
    <div class="space-y-6">
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'patient.orders.title' | translate }}</h2>
        <app-table
          [columns]="columns"
          [data]="invoices"
          [pagination]="pagination"
          [loading]="loading"
          [emptyMessage]="'patient.orders.noOrders' | translate"
          (onPageChange)="onPageChange($event)"
        />
      </div>
    </div>
  `,
  styles: []
})
export class PatientOrdersTabComponent implements OnInit {
  @Input() patientId!: string;
  private invoicesService = inject(InvoicesService);

  invoices: Invoice[] = [];
  loading = false;
  pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  };

  columns: TableColumn[] = [
    { key: 'invoiceNumber', label: 'invoice.invoiceNumber', sortable: true },
    { key: 'createdAt', label: 'invoice.createdAt', sortable: true },
    { key: 'itemsCount', label: 'invoice.items', sortable: false },
    { key: 'total', label: 'invoice.total', sortable: true },
    { key: 'paymentStatus', label: 'invoice.paymentStatus', sortable: true }
  ];

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading = true;
    this.invoicesService.getAll({ page: this.pagination.page, pageSize: this.pagination.pageSize }).subscribe({
      next: (response) => {
        // Filter invoices by patientId
        const filtered = response.data.filter(inv => inv.patientId === this.patientId);
        // Add itemsCount property for display
        this.invoices = filtered.map(inv => ({
          ...inv,
          itemsCount: `${inv.items.length} items`
        } as any));
        this.pagination = {
          ...this.pagination,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / this.pagination.pageSize)
        };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.pagination.page = page;
    this.loadInvoices();
  }
}

