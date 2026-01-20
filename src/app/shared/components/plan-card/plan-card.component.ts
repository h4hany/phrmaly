import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionPlan } from '../../../core/models/platform.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { ButtonComponent } from '../button/button.component';
import { BadgeComponent } from '../badge/badge.component';

@Component({
  selector: 'app-plan-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe, ButtonComponent, BadgeComponent],
  template: `
    <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6 border-2"
         [class.border-[var(--primary-color)]]="highlighted"
         [class.border-transparent]="!highlighted">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-[var(--text-primary)]">{{ plan.name }}</h3>
        @if (plan.tier === 'enterprise') {
          <app-badge variant="warning">{{ 'platform.plan.enterprise' | translate }}</app-badge>
        }
      </div>
      <p class="text-sm text-[var(--card-text)] mb-4">{{ plan.description }}</p>
      <div class="mb-6">
        <span class="text-3xl font-bold text-[var(--text-primary)]">{{ formatPrice(plan.price) }}</span>
        <span class="text-sm text-[var(--card-text)]">/{{ plan.billingCycle === 'monthly' ? ('platform.plan.month' | translate) : ('platform.plan.year' | translate) }}</span>
      </div>
      <div class="space-y-3 mb-6">
        <div class="flex items-center gap-2 text-sm">
          <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span class="text-[var(--text-primary)]">{{ plan.maxPharmacies === -1 ? ('platform.plan.unlimitedPharmacies' | translate) : (plan.maxPharmacies + ' ' + ('platform.plan.pharmacies' | translate)) }}</span>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span class="text-[var(--text-primary)]">{{ plan.maxStaff === -1 ? ('platform.plan.unlimitedStaff' | translate) : (plan.maxStaff + ' ' + ('platform.plan.staff' | translate)) }}</span>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span class="text-[var(--text-primary)]">{{ plan.enabledModules.length }} {{ 'platform.plan.modules' | translate }}</span>
        </div>
      </div>
      @if (showActions) {
        <div class="flex gap-2">
          <app-button variant="primary" size="sm" class="flex-1" (onClick)="onSelect.emit(plan)">
            {{ 'platform.plan.select' | translate }}
          </app-button>
          <app-button variant="outline" size="sm" (onClick)="onEdit.emit(plan)">
            {{ 'common.edit' | translate }}
          </app-button>
        </div>
      }
    </div>
  `,
  styles: []
})
export class PlanCardComponent {
  @Input() plan!: SubscriptionPlan;
  @Input() highlighted = false;
  @Input() showActions = true;
  @Output() onSelect = new EventEmitter<SubscriptionPlan>();
  @Output() onEdit = new EventEmitter<SubscriptionPlan>();

  formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  }
}



