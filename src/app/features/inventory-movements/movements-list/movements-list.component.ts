import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { ActionToolbarComponent } from '../../../shared/components/action-toolbar/action-toolbar.component';
import { RiskBadgeComponent } from '../../../shared/components/risk-badge/risk-badge.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { MovementEngineService } from '../../../core/engines/movement-engine.service';
import { DrugMovement, MovementType } from '../../../core/models/movement.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-movements-list',
  standalone: true,
  imports: [CommonModule, TableComponent, ActionToolbarComponent, TranslatePipe],
  template: `
    <div class="space-y-6">
      <app-action-toolbar
        title="movements.title"
        [showSearch]="true"
        [showFilter]="true"
        [primaryAction]="primaryAction"
        (onSearch)="handleSearch($event)"
        (onFilter)="showFilters = !showFilters"
      ></app-action-toolbar>

      @if (showFilters) {
        <div class="p-4 rounded-lg" style="background-color: var(--card-bg);">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select [value]="filters.movementType" (change)="handleFilterChange('movementType', $event)" class="px-3 py-2 border rounded-md text-sm">
              <option value="">{{ 'movements.allTypes' | translate }}</option>
              <option value="sale">{{ 'movements.type.sale' | translate }}</option>
              <option value="purchase">{{ 'movements.type.purchase' | translate }}</option>
              <option value="adjustment">{{ 'movements.type.adjustment' | translate }}</option>
              <option value="theft">{{ 'movements.type.theft' | translate }}</option>
            </select>
            <select [value]="filters.riskLevel" (change)="handleFilterChange('riskLevel', $event)" class="px-3 py-2 border rounded-md text-sm">
              <option value="">{{ 'movements.allRisks' | translate }}</option>
              <option value="low">{{ 'risk.low' | translate }}</option>
              <option value="medium">{{ 'risk.medium' | translate }}</option>
              <option value="high">{{ 'risk.high' | translate }}</option>
              <option value="critical">{{ 'risk.critical' | translate }}</option>
            </select>
            <input type="date" [value]="filters.startDate" (change)="handleFilterChange('startDate', $event)" class="px-3 py-2 border rounded-md text-sm" />
            <input type="date" [value]="filters.endDate" (change)="handleFilterChange('endDate', $event)" class="px-3 py-2 border rounded-md text-sm" />
          </div>
        </div>
      }

      <app-table
        [columns]="columns"
        [data]="movements"
        [pagination]="pagination"
        [loading]="loading"
        [emptyMessage]="'movements.empty'"
        (onPageChange)="handlePageChange($event)"
      >
        <ng-template #actionTemplate let-movement>
          <div class="flex gap-2">
            <button
              (click)="viewDetail(movement.id)"
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
export class MovementsListComponent implements OnInit {
  private movementEngine = inject(MovementEngineService);
  router = inject(Router);

  movements: DrugMovement[] = [];
  loading = false;
  showFilters = false;
  pagination: any = null;

  filters = {
    movementType: '',
    riskLevel: '',
    startDate: '',
    endDate: ''
  };

  columns: TableColumn[] = [
    { key: 'timestamp', label: 'movements.date', sortable: true },
    { key: 'drugName', label: 'movements.drug' },
    { key: 'movementType', label: 'movements.type' },
    { key: 'quantity', label: 'movements.quantity', sortable: true },
    { key: 'staffName', label: 'movements.staff' },
    { key: 'riskLevel', label: 'movements.risk' }
  ];

  primaryAction = {
    label: 'movements.new',
    onClick: () => this.router.navigate(['/inventory/movements/new']),
    variant: 'primary' as const
  };

  ngOnInit(): void {
    this.loadMovements();
  }

  loadMovements(): void {
    this.loading = true;
    const params = {
      page: this.pagination?.page || 1,
      pageSize: 10,
      ...(this.filters.movementType && { movementType: this.filters.movementType as MovementType }),
      ...(this.filters.riskLevel && { riskLevel: this.filters.riskLevel as any }),
      ...(this.filters.startDate && { startDate: new Date(this.filters.startDate) }),
      ...(this.filters.endDate && { endDate: new Date(this.filters.endDate) })
    };

    this.movementEngine.getMovements(params).subscribe({
      next: (response) => {
        this.movements = response.data;
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
      this.loadMovements();
    }
  }

  handleSearch(query: string): void {
    // Implement search logic
    this.loadMovements();
  }

  handleFilterChange(key: string, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    (this.filters as any)[key] = target.value;
    this.loadMovements();
  }

  viewDetail(id: string): void {
    this.router.navigate(['/inventory/movements', id]);
  }
}

