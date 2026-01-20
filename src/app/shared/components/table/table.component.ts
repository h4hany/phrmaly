import { Component, Input, TemplateRef, ContentChild, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { BadgeComponent } from '../badge/badge.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { DateFormatPipe } from '../../../core/pipes/date-format.pipe';
import { LoadingComponent } from '../loading/loading.component';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, ButtonComponent, BadgeComponent, TranslatePipe, DateFormatPipe, LoadingComponent],
  template: `
    <div class="overflow-hidden relative mt-6" [style]="containerStyles">
      @if (loading) {
        <div class="absolute inset-0 flex items-center justify-center bg-transparent z-10 rounded-[var(--radius-lg)]">
          <app-loading></app-loading>
        </div>
      }
      <div class="overflow-x-auto" [class.opacity-50]="loading">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              @for (column of columns; track column.key) {
                <th
                  [class]="getHeaderClasses(column)"
                  (click)="column.sortable && handleSort(column.key)"
                >
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-medium text-gray-500 uppercase tracking-wider">{{ column.label | translate }}</span>
                    @if (column.sortable) {
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    }
                  </div>
                </th>
              }
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            @for (row of data; track getRowId(row); let i = $index) {
              <tr class="hover:bg-gray-50/50 transition-colors">
                @for (column of columns; track column.key) {
                  <td class="px-6 py-4 whitespace-nowrap text-sm" [style]="cellStyles">
                    @if (actionTemplate && column.key === 'actions') {
                      <ng-container *ngTemplateOutlet="actionTemplate; context: { $implicit: row, index: i }"></ng-container>
                    } @else if (column.key === 'status') {
                      <app-badge [variant]="getStatusVariant(getCellValue(row, column.key))">
                        {{ getCellValue(row, column.key) }}
                      </app-badge>
                    } @else if (isDate(getCellValue(row, column.key))) {
                      {{ getCellValue(row, column.key) | dateFormat }}
                    } @else {
                      {{ getCellValue(row, column.key) }}
                    }
                  </td>
                }
              </tr>
            } @empty {
              <tr>
                <td [attr.colspan]="columns.length" class="px-6 py-12 text-center text-gray-500">
                  {{ emptyMessage | translate }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      @if (pagination) {
        <div class="bg-white px-6 py-4 border-t border-gray-200" [class.opacity-50]="loading">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              {{ 'table.showing' | translate }} {{ pagination.page * pagination.pageSize - pagination.pageSize + 1 }}
              {{ 'table.to' | translate }} {{ Math.min(pagination.page * pagination.pageSize, pagination.total) }}
              {{ 'table.of' | translate }} {{ pagination.total }} {{ 'table.results' | translate }}
            </div>
            <div class="flex gap-2">
              <app-button
                variant="outline"
                size="sm"
                [disabled]="pagination.page === 1 || loading"
                (onClick)="handlePageChange(pagination.page - 1)"
              >
                {{ 'common.previous' | translate }}
              </app-button>
              @for (page of getPageNumbers(); track page) {
                @if (page === -1) {
                  <span class="px-3 py-1.5 text-sm text-gray-500">...</span>
                } @else {
                  <app-button
                    [variant]="page === pagination.page ? 'primary' : 'outline'"
                    size="sm"
                    [disabled]="loading"
                    (onClick)="handlePageChange(page)"
                  >
                    {{ page }}
                  </app-button>
                }
              }
              <app-button
                variant="outline"
                size="sm"
                [disabled]="pagination.page >= pagination.totalPages || loading"
                (onClick)="handlePageChange(pagination.page + 1)"
              >
                {{ 'common.next' | translate }}
              </app-button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class TableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() pagination?: any;
  @Input() emptyMessage = 'No data available';
  @Input() rowIdKey = 'id';
  @Input() loading = false;
  @ContentChild('actionTemplate') actionTemplate?: TemplateRef<any>;

  @Output() onSort = new EventEmitter<string>();
  @Output() onPageChange = new EventEmitter<number>();

  Math = Math; // Expose Math to template

  handleSort(key: string): void {
    this.onSort.emit(key);
  }

  handlePageChange(page: number): void {
    this.onPageChange.emit(page);
  }

  get containerStyles(): string {
    return 'background-color: var(--card-bg); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);';
  }

  get cellStyles(): string {
    return 'color: var(--card-text);';
  }

  getRowId(row: any): string {
    return row[this.rowIdKey] || '';
  }

  getCellValue(row: any, key: string): any {
    if (key.includes('.')) {
      const keys = key.split('.');
      let value = row;
      for (const k of keys) {
        value = value?.[k];
      }
      return value;
    }
    return row[key];
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'default' {
    const statusLower = String(status).toLowerCase();
    if (statusLower.includes('completed') || statusLower.includes('paid') || statusLower.includes('success')) {
      return 'success';
    }
    if (statusLower.includes('pending') || statusLower.includes('warning')) {
      return 'warning';
    }
    if (statusLower.includes('failed') || statusLower.includes('error') || statusLower.includes('danger')) {
      return 'danger';
    }
    return 'default';
  }

  getHeaderClasses(column: TableColumn): string {
    const base = 'px-6 py-4 text-left';
    return column.sortable ? `${base} cursor-pointer hover:bg-gray-100/50` : base;
  }

  getPageNumbers(): number[] {
    if (!this.pagination) return [];

    const current = this.pagination.page;
    const total = this.pagination.totalPages;
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (current > 3) pages.push(-1);
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < total - 2) pages.push(-1);
      pages.push(total);
    }

    return pages;
  }

  isDate(value: any): boolean {
    if (value instanceof Date) {
      return true;
    }
    if (typeof value === 'string') {
      // Check if it's a date string that looks like a full date (not just a short string)
      const dateRegex = /^\d{4}-\d{2}-\d{2}/; // ISO date format
      const dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:/; // ISO datetime format
      if (dateRegex.test(value) || dateTimeRegex.test(value)) {
        const parsed = Date.parse(value);
        return !isNaN(parsed);
      }
    }
    return false;
  }
}
