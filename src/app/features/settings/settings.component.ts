import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsComponent, TabComponent } from '../../shared/components/tabs/tabs.component';
import { AccountInfoComponent } from './account-info/account-info.component';
import { ThemeSettingsComponent } from './theme-settings/theme-settings.component';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    TabsComponent,
    TabComponent,
    AccountInfoComponent,
    ThemeSettingsComponent,
    TranslatePipe
  ],
  template: `
    <div class="space-y-[var(--spacing-gap)]">
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-[var(--spacing-card)]">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold text-[var(--text-primary)]">{{ 'nav.settings' | translate }}</h1>
        </div>

        <!-- Tabs -->
        <app-tabs>
          <app-tab [title]="'settings.tabs.account' | translate" [active]="true">
            <app-account-info></app-account-info>
          </app-tab>
          <app-tab [title]="'settings.tabs.theme' | translate" [active]="false">
            <app-theme-settings></app-theme-settings>
          </app-tab>
        </app-tabs>
      </div>
    </div>
  `,
  styles: []
})
export class SettingsComponent {
}
