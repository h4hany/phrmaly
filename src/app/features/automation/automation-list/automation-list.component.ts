import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { ActionToolbarComponent } from '../../../shared/components/action-toolbar/action-toolbar.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AutomationEngineService } from '../../../core/engines/automation-engine.service';
import { AutomationRule } from '../../../core/models/automation.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-automation-list',
  standalone: true,
  imports: [CommonModule, TableComponent, ActionToolbarComponent, ButtonComponent, TranslatePipe],
  template: `
    <div class="space-y-6">
      <app-action-toolbar
        title="automation.title"
        [showSearch]="true"
        [primaryAction]="primaryAction"
        (onSearch)="handleSearch($event)"
      ></app-action-toolbar>

      <app-table
        [columns]="columns"
        [data]="rules"
        [pagination]="pagination"
        [loading]="loading"
        [emptyMessage]="'automation.empty'"
        (onPageChange)="handlePageChange($event)"
      >
        <ng-template #actionTemplate let-rule>
          <div class="flex gap-2">
            <app-button
              variant="outline"
              size="sm"
              (onClick)="toggleRule(rule)"
            >
              {{ rule.enabled ? ('automation.disable' | translate) : ('automation.enable' | translate) }}
            </app-button>
            <app-button
              variant="outline"
              size="sm"
              (onClick)="viewDetail(rule.id)"
            >
              {{ 'common.view' | translate }}
            </app-button>
          </div>
        </ng-template>
      </app-table>
    </div>
  `,
  styles: []
})
export class AutomationListComponent implements OnInit {
  private automationEngine = inject(AutomationEngineService);
  router = inject(Router);

  rules: AutomationRule[] = [];
  loading = false;
  pagination: any = null;

  columns: TableColumn[] = [
    { key: 'name', label: 'automation.name', sortable: true },
    { key: 'trigger', label: 'automation.trigger' },
    { key: 'action', label: 'automation.action' },
    { key: 'status', label: 'automation.status' },
    { key: 'enabled', label: 'automation.enabled' },
    { key: 'executionCount', label: 'automation.executions' }
  ];

  primaryAction = {
    label: 'automation.new',
    onClick: () => this.router.navigate(['/system/automation/new']),
    variant: 'primary' as const
  };

  ngOnInit(): void {
    this.loadRules();
  }

  loadRules(): void {
    this.loading = true;
    this.automationEngine.getRules({ page: 1, pageSize: 10 }).subscribe({
      next: (response) => {
        this.rules = response.data;
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
      this.loadRules();
    }
  }

  handleSearch(query: string): void {
    this.loadRules();
  }

  toggleRule(rule: AutomationRule): void {
    this.automationEngine.toggleRule(rule.id, !rule.enabled).subscribe({
      next: () => {
        this.loadRules();
      }
    });
  }

  viewDetail(id: string): void {
    // Navigate to detail or show modal
    console.log('View rule:', id);
  }
}
