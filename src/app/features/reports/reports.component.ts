import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsComponent, TabComponent } from '../../shared/components/tabs/tabs.component';
import { TicketsComponent } from './tickets/tickets.component';
import { FAQComponent } from './faq/faq.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    TabsComponent,
    TabComponent,
    TicketsComponent,
    FAQComponent
  ],
  template: `
    <div class="space-y-6">
      <app-tabs>
        <app-tab title="Tickets" [active]="true">
          <app-tickets></app-tickets>
        </app-tab>
        <app-tab title="Common Questions">
          <app-faq></app-faq>
        </app-tab>
      </app-tabs>
    </div>
  `,
  styles: []
})
export class ReportsComponent {
}
