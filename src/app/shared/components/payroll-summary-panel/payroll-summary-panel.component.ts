import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { PayrollRecord } from '../../../core/models/hr.model';

@Component({
  selector: 'app-payroll-summary-panel',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
      <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'hr.payroll.summary' | translate }}</h3>
      
      <div class="space-y-4">
        <!-- Earnings -->
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-[var(--card-text)]">{{ 'hr.payroll.baseSalary' | translate }}</span>
            <span class="font-medium text-[var(--text-primary)]">{{ formatCurrency(payroll.baseSalary) }}</span>
          </div>
          @if (payroll.commission > 0) {
            <div class="flex justify-between text-sm">
              <span class="text-[var(--card-text)]">{{ 'hr.payroll.commission' | translate }}</span>
              <span class="font-medium text-green-600">+{{ formatCurrency(payroll.commission) }}</span>
            </div>
          }
          @if (payroll.bonuses > 0) {
            <div class="flex justify-between text-sm">
              <span class="text-[var(--card-text)]">{{ 'hr.payroll.bonuses' | translate }}</span>
              <span class="font-medium text-green-600">+{{ formatCurrency(payroll.bonuses) }}</span>
            </div>
          }
        </div>

        <div class="border-t border-[var(--border-color)] pt-4">
          <div class="flex justify-between text-sm font-medium mb-2">
            <span class="text-[var(--card-text)]">{{ 'hr.payroll.totalEarnings' | translate }}</span>
            <span class="text-[var(--text-primary)]">{{ formatCurrency(payroll.totalEarnings) }}</span>
          </div>
          @if (payroll.deductions > 0) {
            <div class="flex justify-between text-sm">
              <span class="text-[var(--card-text)]">{{ 'hr.payroll.deductions' | translate }}</span>
              <span class="font-medium text-red-600">-{{ formatCurrency(payroll.deductions) }}</span>
            </div>
          }
        </div>

        <div class="border-t border-[var(--border-color)] pt-4">
          <div class="flex justify-between items-center">
            <span class="text-base font-semibold text-[var(--text-primary)]">{{ 'hr.payroll.netPay' | translate }}</span>
            <span class="text-2xl font-bold text-[var(--primary-color)]">{{ formatCurrency(payroll.netPay) }}</span>
          </div>
        </div>

        @if (payroll.status) {
          <div class="mt-4 pt-4 border-t border-[var(--border-color)]">
            <div class="flex items-center justify-between">
              <span class="text-sm text-[var(--card-text)]">{{ 'hr.payroll.status' | translate }}</span>
              <span [class]="statusClass">{{ statusLabel | translate }}</span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class PayrollSummaryPanelComponent {
  @Input() payroll!: PayrollRecord;

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.payroll.currency || 'USD'
    }).format(amount);
  }

  get statusLabel(): string {
    const labels: { [key: string]: string } = {
      draft: 'hr.payroll.statusDraft',
      pending_approval: 'hr.payroll.statusPending',
      approved: 'hr.payroll.statusApproved',
      paid: 'hr.payroll.statusPaid',
      cancelled: 'hr.payroll.statusCancelled'
    };
    return labels[this.payroll.status] || 'hr.payroll.statusDraft';
  }

  get statusClass(): string {
    const classes: { [key: string]: string } = {
      draft: 'px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800',
      pending_approval: 'px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800',
      approved: 'px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800',
      paid: 'px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800',
      cancelled: 'px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800'
    };
    return classes[this.payroll.status] || classes['draft'];
  }
}

