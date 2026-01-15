import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsComponent, TabComponent } from '../../shared/components/tabs/tabs.component';
import { TicketsComponent } from './tickets/tickets.component';
import { FAQComponent } from './faq/faq.component';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    TabsComponent,
    TabComponent,
    TicketsComponent,
    FAQComponent,
    TranslatePipe
  ],
  template: `
    <div class="space-y-[var(--spacing-gap)]">
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-[var(--spacing-card)]">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold text-[var(--text-primary)]">{{ 'nav.helpSupport' | translate }}</h1>
        </div>

        <!-- Tabs -->
        <app-tabs>
          <app-tab [title]="'reports.tabs.tickets' | translate" [active]="true">
            <app-tickets></app-tickets>
          </app-tab>
          <app-tab [title]="'reports.tabs.faq' | translate" [active]="false">
            <app-faq></app-faq>
          </app-tab>
        </app-tabs>
      </div>
    </div>
  `,
  styles: []
})
export class ReportsComponent {
}
