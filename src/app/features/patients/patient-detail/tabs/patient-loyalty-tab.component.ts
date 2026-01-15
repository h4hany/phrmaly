import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { TableComponent, TableColumn } from '../../../../shared/components/table/table.component';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

interface LoyaltyTransaction {
  id: string;
  date: Date;
  type: 'earned' | 'redeemed' | 'expired';
  points: number;
  description: string;
}

@Component({
  selector: 'patient-loyalty-tab',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, StatCardComponent, TableComponent, TranslatePipe],
  template: `
    <div class="space-y-6">
      <!-- Wallet and Loyalty Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-stat-card
          [label]="'patient.loyalty.walletBalance' | translate"
          [value]="(walletBalance | currency:'USD':'symbol':'1.2-2') ?? '0.00'"
          [icon]="walletIcon"
        />
        <app-stat-card
          [label]="'patient.loyalty.loyaltyPoints' | translate"
          [value]="loyaltyPoints"
          [icon]="starIcon"
        />
        <app-stat-card
          [label]="'patient.loyalty.currentTier' | translate"
          [value]="currentTier"
          [icon]="badgeIcon"
        />
        <app-stat-card
          [label]="'patient.loyalty.pointsToNextTier' | translate"
          [value]="pointsToNextTier"
          [icon]="trendIcon"
        />
      </div>

      <!-- Tier Progress -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
        <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'patient.loyalty.tierProgress' | translate }}</h3>
        <div class="space-y-2">
          <div class="flex justify-between text-sm text-[var(--card-text)]">
            <span>{{ currentTier }}</span>
            <span>{{ loyaltyPoints }} / {{ nextTierPoints }} {{ 'patient.loyalty.points' | translate }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-4">
            <div
              class="bg-[var(--primary-bg)] h-4 rounded-full transition-all duration-300"
              [style.width.%]="tierProgress"
            ></div>
          </div>
          <div class="text-sm text-[var(--card-text)]">
            {{ pointsToNextTier }} {{ 'patient.loyalty.pointsUntil' | translate }} {{ nextTier }}
          </div>
        </div>
      </div>

      <!-- Transaction History -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
        <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'patient.loyalty.history' | translate }}</h3>
        <app-table
          [columns]="columns"
          [data]="transactions"
          [pagination]="pagination"
          [emptyMessage]="'patient.loyalty.noTransactions' | translate"
        />
      </div>
    </div>
  `,
  styles: []
})
export class PatientLoyaltyTabComponent {
  @Input() patientId!: string;

  // Mock data
  walletBalance = 150.50;
  loyaltyPoints = 245;
  currentTier = 'Silver';
  nextTier = 'Gold';
  nextTierPoints = 500;
  pointsToNextTier = 255;

  // Icons
  walletIcon = '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>';
  starIcon = '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>';
  badgeIcon = '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>';
  trendIcon = '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>';

  get tierProgress(): number {
    return Math.min(100, (this.loyaltyPoints / this.nextTierPoints) * 100);
  }

  transactions: LoyaltyTransaction[] = [
    {
      id: '1',
      date: new Date('2024-11-27'),
      type: 'earned',
      points: 50,
      description: 'Purchase reward'
    },
    {
      id: '2',
      date: new Date('2024-11-20'),
      type: 'redeemed',
      points: -25,
      description: 'Points redemption'
    },
    {
      id: '3',
      date: new Date('2024-11-15'),
      type: 'earned',
      points: 30,
      description: 'Purchase reward'
    }
  ];

  columns: TableColumn[] = [
    { key: 'date', label: 'table.date', sortable: true },
    { key: 'type', label: 'patient.loyalty.type', sortable: true },
    { key: 'points', label: 'patient.loyalty.points', sortable: true },
    { key: 'description', label: 'patient.loyalty.description', sortable: false }
  ];

  pagination = {
    page: 1,
    pageSize: 10,
    total: 3,
    totalPages: 1
  };
}

