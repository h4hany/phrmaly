import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { RequestedProductsService } from '../../../core/services/requested-products.service';
import { RequestedProduct } from '../../../core/models/requested-product.model';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-requested-products-list',
  standalone: true,
  imports: [CommonModule, TableComponent, TranslatePipe],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-[var(--text-primary)]">{{ 'requestedProduct.title' | translate }}</h1>
          <p class="text-sm text-[var(--card-text)] mt-1">{{ 'requestedProduct.subtitle' | translate }}</p>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-[var(--spacing-card)]">
        <app-table
          [columns]="columns"
          [data]="processedProducts"
          [pagination]="pagination"
          [emptyMessage]="'requestedProduct.empty'"
          [loading]="loading"
          rowIdKey="id"
        ></app-table>
      </div>
    </div>
  `,
  styles: []
})
export class RequestedProductsListComponent implements OnInit {
  private requestedProductsService = inject(RequestedProductsService);
  private router = inject(Router);

  requestedProducts: RequestedProduct[] = [];
  processedProducts: any[] = [];
  loading = false;
  
  pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  };

  columns: TableColumn[] = [
    {
      key: 'productName',
      label: 'requestedProduct.productName',
      sortable: true
    },
    {
      key: 'requestedBy',
      label: 'requestedProduct.requestedBy',
      sortable: true
    },
    {
      key: 'requestedAt',
      label: 'requestedProduct.requestedAt',
      sortable: true
    },
    {
      key: 'status',
      label: 'requestedProduct.status',
      sortable: true
    },
    {
      key: 'notes',
      label: 'requestedProduct.notes',
      sortable: false
    }
  ];

  ngOnInit(): void {
    this.loadRequestedProducts();
  }

  loadRequestedProducts(): void {
    this.loading = true;
    this.requestedProductsService.getAll().subscribe({
      next: (products) => {
        this.requestedProducts = products;
        // Process products to format status for table display
        this.processedProducts = products.map(product => ({
          ...product,
          status: `requestedProduct.status.${product.status}`,
          requestedAt: product.requestedAt instanceof Date ? product.requestedAt : new Date(product.requestedAt)
        }));
        this.pagination = {
          page: 1,
          pageSize: 10,
          total: products.length,
          totalPages: Math.ceil(products.length / 10)
        };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}

