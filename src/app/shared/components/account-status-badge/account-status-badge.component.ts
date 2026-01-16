import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../badge/badge.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

export type AccountStatus = 'active' | 'suspended' | 'trial' | 'closed' | 'restricted';

@Component({
  selector: 'app-account-status-badge',
  standalone: true,
  imports: [CommonModule, BadgeComponent, TranslatePipe],
  template: `
    <app-badge [variant]="badgeVariant">
      {{ label | translate }}
    </app-badge>
  `,
  styles: []
})
export class AccountStatusBadgeComponent {
  @Input() status: AccountStatus = 'active';

  get label(): string {
    const labels: { [key in AccountStatus]: string } = {
      active: 'platform.account.statusActive',
      suspended: 'platform.account.statusSuspended',
      trial: 'platform.account.statusTrial',
      closed: 'platform.account.statusClosed',
      restricted: 'platform.account.statusRestricted'
    };
    return labels[this.status];
  }

  get badgeVariant(): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    const variants: { [key in AccountStatus]: 'success' | 'warning' | 'danger' | 'info' | 'default' } = {
      active: 'success',
      suspended: 'danger',
      trial: 'info',
      closed: 'default',
      restricted: 'warning'
    };
    return variants[this.status];
  }
}

