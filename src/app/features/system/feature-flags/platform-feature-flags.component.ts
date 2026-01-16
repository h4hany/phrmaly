/**
 * Platform Feature Flags Component
 * 
 * Classification: SYSTEM EXTENSION
 * 
 * Business Purpose: Control feature rollout and subscription-based access
 */

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModuleToggleMatrixComponent } from '../../../shared/components/module-toggle-matrix/module-toggle-matrix.component';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { PlatformModule } from '../../../core/models/platform.model';

@Component({
  selector: 'app-platform-feature-flags',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModuleToggleMatrixComponent,
    TableComponent,
    TranslatePipe,
    StatCardComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-[var(--text-primary)]">{{ 'platform.featureFlags.title' | translate }}</h1>
        <p class="text-sm text-[var(--card-text)] mt-1">{{ 'platform.featureFlags.subtitle' | translate }}</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <app-stat-card
          [label]="'platform.featureFlags.totalFeatures'"
          [value]="totalFeatures"
          [icon]="'toggle-sliders'"
        />
        <app-stat-card
          [label]="'platform.featureFlags.enabledFeatures'"
          [value]="enabledFeatures"
          [icon]="'check-circle'"
        />
        <app-stat-card
          [label]="'platform.featureFlags.betaFeatures'"
          [value]="betaFeatures"
          [icon]="'alert'"
        />
        <app-stat-card
          [label]="'platform.featureFlags.accountsUsing'"
          [value]="accountsUsing"
          [icon]="'users'"
        />
      </div>

      <!-- Global Feature Toggles -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'platform.featureFlags.globalFeatures' | translate }}</h2>
        <app-module-toggle-matrix
          [enabledModules]="globalEnabledModules"
          (modulesChange)="updateGlobalFeatures($event)"
        />
      </div>

      <!-- Per-Plan Features -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'platform.featureFlags.planFeatures' | translate }}</h2>
        <app-table
          [columns]="planColumns"
          [data]="planFeatures"
          [loading]="loading"
          [emptyMessage]="'platform.featureFlags.noPlans' | translate"
        />
      </div>

      <!-- Feature Usage -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'platform.featureFlags.featureUsage' | translate }}</h2>
        <app-table
          [columns]="usageColumns"
          [data]="featureUsage"
          [loading]="loading"
          [emptyMessage]="'platform.featureFlags.noUsage' | translate"
        />
      </div>
    </div>
  `,
  styles: []
})
export class PlatformFeatureFlagsComponent implements OnInit {
  loading = false;

  globalEnabledModules: PlatformModule[] = [
    'inventory',
    'hr',
    'finance',
    'automation',
    'analytics'
  ];

  totalFeatures = 10;
  enabledFeatures = 7;
  betaFeatures = 2;
  accountsUsing = 140;

  planFeatures: any[] = [
    {
      plan: 'Starter',
      modules: ['inventory', 'finance'],
      accounts: 80
    },
    {
      plan: 'Professional',
      modules: ['inventory', 'hr', 'finance', 'automation', 'analytics'],
      accounts: 50
    },
    {
      plan: 'Enterprise',
      modules: ['inventory', 'hr', 'finance', 'automation', 'loyalty', 'api_access', 'ai_features', 'analytics'],
      accounts: 10
    }
  ];

  featureUsage: any[] = [
    {
      feature: 'Inventory',
      accounts: 140,
      usage: '100%',
      trend: 'up'
    },
    {
      feature: 'HR & People',
      accounts: 80,
      usage: '57%',
      trend: 'up'
    },
    {
      feature: 'Finance',
      accounts: 140,
      usage: '100%',
      trend: 'stable'
    },
    {
      feature: 'Automation',
      accounts: 60,
      usage: '43%',
      trend: 'up'
    }
  ];

  planColumns: TableColumn[] = [
    { key: 'plan', label: 'platform.featureFlags.plan', sortable: true },
    { key: 'modules', label: 'platform.featureFlags.modules', sortable: false },
    { key: 'accounts', label: 'platform.featureFlags.accounts', sortable: true }
  ];

  usageColumns: TableColumn[] = [
    { key: 'feature', label: 'platform.featureFlags.feature', sortable: true },
    { key: 'accounts', label: 'platform.featureFlags.accounts', sortable: true },
    { key: 'usage', label: 'platform.featureFlags.usage', sortable: true },
    { key: 'trend', label: 'platform.featureFlags.trend', sortable: true }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    // Mock data loading
    setTimeout(() => {
      this.loading = false;
    }, 500);
  }

  updateGlobalFeatures(modules: PlatformModule[]): void {
    this.globalEnabledModules = modules;
    // TODO: Save to backend
    console.log('Updated global features:', modules);
  }
}
