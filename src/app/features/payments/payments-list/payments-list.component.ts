import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-payments-list',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    TableComponent,
    StatCardComponent,
    DropdownComponent,
    TranslatePipe
  ],
  template: `
    <div class="space-y-6">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <app-stat-card
          label="Completed Payment"
          value="120"
          trend="Since last week"
          status="success"
        >
          <div icon class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </app-stat-card>

        <app-stat-card
          label="Pending Payments"
          value="45"
          trend="Since last week"
          status="warning"
        >
          <div icon class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </app-stat-card>

        <app-stat-card
          label="Failed Payments"
          value="5"
          trend="Since last week"
          status="danger"
        >
          <div icon class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </app-stat-card>
      </div>

      <!-- Action Bar -->
      <div class="flex items-center justify-between gap-4">
        <div class="flex-1 max-w-md">
          <div class="relative">
            <input
              type="text"
              [placeholder]="'common.search' | translate"
              class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
            />
            <svg class="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div class="flex gap-3">
          <app-button variant="outline">
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {{ 'common.filters' | translate }}
          </app-button>
          <app-button variant="outline">
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {{ 'common.export' | translate }}
          </app-button>
          <app-button variant="primary">
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ 'button.addNewPayment' | translate }}
          </app-button>
          <app-dropdown
            [options]="timeOptions"
            [value]="selectedTime"
            placeholder="This Month"
          />
        </div>
      </div>

      <!-- Table -->
      <app-table
        [columns]="columns"
        [data]="payments"
        [pagination]="pagination"
        [emptyMessage]="'empty.noPayments'"
        [loading]="loading"
        rowIdKey="id"
      >
        <ng-template #actionTemplate let-row>
          <div class="flex items-center gap-2">
            <button class="p-1 text-gray-600 hover:text-gray-900" [title]="'common.view' | translate">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button class="p-1 text-gray-600 hover:text-red-600" [title]="'common.delete' | translate">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button class="p-1 text-gray-600 hover:text-gray-900" [title]="'common.edit' | translate">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </ng-template>
      </app-table>
    </div>
  `,
  styles: []
})
export class PaymentsListComponent {
  private router = inject(Router);

  loading = false;
  selectedTime = 'this-month';
  timeOptions = [
    { label: 'This Month', value: 'this-month' },
    { label: 'Last Month', value: 'last-month' },
    { label: 'This Year', value: 'this-year' },
    { label: 'All Time', value: 'all-time' }
  ];

  columns: TableColumn[] = [
    { key: 'transactionId', label: 'table.transactionId', sortable: true },
    { key: 'customerName', label: 'table.customerName', sortable: true },
    { key: 'paymentDate', label: 'table.paymentDate', sortable: true },
    { key: 'amount', label: 'table.amount', sortable: true },
    { key: 'status', label: 'table.status', sortable: true },
    { key: 'paymentMethod', label: 'table.paymentMethod', sortable: true },
    { key: 'orderId', label: 'table.orderId', sortable: true },
    { key: 'actions', label: 'table.action' }
  ];

  payments = [
    {
      id: '1',
      transactionId: '#TXN001',
      customerName: 'John Smith',
      paymentDate: '27-11-2024',
      amount: '500',
      status: 'Completed',
      paymentMethod: 'Credit Card',
      orderId: '#ORD001'
    },
    {
      id: '2',
      transactionId: '#TXN002',
      customerName: 'Emily Davis',
      paymentDate: '26-11-2024',
      amount: '300',
      status: 'Pending',
      paymentMethod: 'Paypal',
      orderId: '#ORD002'
    },
    {
      id: '3',
      transactionId: '#TXN003',
      customerName: 'Michael Johnson',
      paymentDate: '25-11-2024',
      amount: '450',
      status: 'Failed',
      paymentMethod: 'Bank Transfer',
      orderId: '#ORD003'
    },
    {
      id: '4',
      transactionId: '#TXN004',
      customerName: 'Sarah Lee',
      paymentDate: '24-11-2024',
      amount: '1,200',
      status: 'Completed',
      paymentMethod: 'Credit Card',
      orderId: '#ORD004'
    },
    {
      id: '5',
      transactionId: '#TXN005',
      customerName: 'Andrew Miller',
      paymentDate: '23-11-2024',
      amount: '1,000',
      status: 'Completed',
      paymentMethod: 'Paypal',
      orderId: '#ORD005'
    },
    {
      id: '6',
      transactionId: '#TXN006',
      customerName: 'Sophia Wilson',
      paymentDate: '27-11-2024',
      amount: '500',
      status: 'Completed',
      paymentMethod: 'Credit Card',
      orderId: '#ORD005'
    },
    {
      id: '7',
      transactionId: '#TXN007',
      customerName: 'Olivia Taylor',
      paymentDate: '22-11-2024',
      amount: '650',
      status: 'Pending',
      paymentMethod: 'Credit Card',
      orderId: '#ORD006'
    },
    {
      id: '8',
      transactionId: '#TXN008',
      customerName: 'Ethan White',
      paymentDate: '21-11-2024',
      amount: '700',
      status: 'Completed',
      paymentMethod: 'Bank Transfer',
      orderId: '#ORD007'
    },
    {
      id: '9',
      transactionId: '#TXN009',
      customerName: 'Mia Harris',
      paymentDate: '20-11-2024',
      amount: '2,300',
      status: 'Completed',
      paymentMethod: 'Credit Card',
      orderId: '#ORD008'
    }
  ];

  pagination = {
    page: 1,
    pageSize: 12,
    total: 59,
    totalPages: 5
  };
}
