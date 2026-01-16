import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableColumn } from '../../shared/components/table/table.component';
import { ActionToolbarComponent } from '../../shared/components/action-toolbar/action-toolbar.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { FeatureFlagService } from '../../core/engines/feature-flag.service';
import { FeatureFlag } from '../../core/models/permission.model';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-feature-flags',
  standalone: true,
  imports: [CommonModule, TableComponent, ActionToolbarComponent, BadgeComponent, TranslatePipe],
  template: `
    <div class="space-y-6">
      <app-action-toolbar
        title="featureFlags.title"
        [showSearch]="true"
        (onSearch)="handleSearch($event)"
      ></app-action-toolbar>

      <app-table
        [columns]="columns"
        [data]="flags"
        [loading]="loading"
        [emptyMessage]="'featureFlags.empty'"
      >
        <ng-template #actionTemplate let-flag>
          <app-badge [variant]="flag.enabled ? 'success' : 'default'">
            {{ flag.enabled ? ('featureFlags.enabled' | translate) : ('featureFlags.disabled' | translate) }}
          </app-badge>
        </ng-template>
      </app-table>
    </div>
  `,
  styles: []
})
export class FeatureFlagsComponent implements OnInit {
  private featureFlagService = inject(FeatureFlagService);
  private translationService = inject(TranslationService);

  flags: any[] = [];
  loading = false;

  columns: TableColumn[] = [
    { key: 'key', label: 'featureFlags.key' },
    { key: 'name', label: 'featureFlags.name' },
    { key: 'description', label: 'featureFlags.description' },
    { key: 'scope', label: 'featureFlags.scope' }
  ];

  ngOnInit(): void {
    this.loadFlags();
  }

  loadFlags(): void {
    this.loading = true;
    this.featureFlagService.getFlags().subscribe({
      next: (flags) => {
        this.flags = flags.map(flag => ({
          ...flag,
          scope: flag.pharmacyId 
            ? this.translationService.translate('featureFlags.pharmacy')
            : this.translationService.translate('featureFlags.global')
        }));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  handleSearch(query: string): void {
    this.loadFlags();
  }
}
