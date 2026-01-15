import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsComponent, TabComponent } from '../../shared/components/tabs/tabs.component';
import { AccountInfoComponent } from './account-info/account-info.component';
import { ThemeSettingsComponent } from './theme-settings/theme-settings.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    TabsComponent,
    TabComponent,
    AccountInfoComponent,
    ThemeSettingsComponent
  ],
  template: `
    <div class="space-y-6">
      <app-tabs>
        <app-tab title="Account Information" [active]="true">
          <app-account-info></app-account-info>
        </app-tab>
        <app-tab title="Theme Settings">
          <app-theme-settings></app-theme-settings>
        </app-tab>
      </app-tabs>
    </div>
  `,
  styles: []
})
export class SettingsComponent {
}
