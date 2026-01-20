import { Component, Input, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { Patient } from '../../../../core/models/patient.model';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { DateFormatPipe } from '../../../../core/pipes/date-format.pipe';
import { PharmacyContextService } from '../../../../core/services/pharmacy-context.service';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { CanAccessDirective } from '../../../../shared/directives/can-access.directive';

@Component({
  selector: 'patient-overview-tab',
  standalone: true,
  imports: [CommonModule, DatePipe, DateFormatPipe, StatCardComponent, TranslatePipe, CurrencyPipe, CanAccessDirective],
  template: `
    <div class="space-y-6">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" *appCanAccess="'patient.overview.kpi-cards'">
        <app-stat-card
          [label]="'patient.overview.totalOrders' | translate"
          [value]="totalOrders"
          [icon]="ordersIcon"
        />
        <app-stat-card
          [label]="'patient.overview.totalSpent' | translate"
          [value]="(totalSpent | currency:'USD':'':'1.2-2') ?? '0.00'"
          [icon]="moneyIcon"
        />
        <app-stat-card
          [label]="'patient.overview.loyaltyPoints' | translate"
          [value]="loyaltyPoints"
          [icon]="starIcon"
        />
        <app-stat-card
          [label]="'patient.overview.walletBalance' | translate"
          [value]="(walletBalance | currency:'USD':'':'1.2-2') ?? '0.00'"
          [icon]="walletIcon"
        />
      </div>

      <!-- Patient Card and Personal Information -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'patient.personalInfo' | translate }}</h2>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Personal Information - 2 columns -->
          <div class="lg:col-span-2">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'patient.fullName' | translate }}</label>
                <p class="text-[var(--text-primary)] font-medium">{{ patient.fullName }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'patient.dateOfBirth' | translate }}</label>
                <p class="text-[var(--text-primary)]">{{ patient.dateOfBirth | dateFormat }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'patient.gender' | translate }}</label>
                <p class="text-[var(--text-primary)] capitalize">{{ patient.gender }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'patient.phone' | translate }}</label>
                <p class="text-[var(--text-primary)]">{{ patient.phone }}</p>
              </div>
              @if (patient.email) {
                <div>
                  <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'patient.email' | translate }}</label>
                  <p class="text-[var(--text-primary)]">{{ patient.email }}</p>
                </div>
              }
              @if (patient.occupation) {
                <div>
                  <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'patient.occupation' | translate }}</label>
                  <p class="text-[var(--text-primary)]">{{ patient.occupation }}</p>
                </div>
              }
            </div>
          </div>
          
          <!-- Patient Card -->
          @if (patient.cardId) {
            <div class="lg:col-span-1">
              <div class="relative rounded-2xl p-8 shadow-xl overflow-hidden" style="background-color: var(--sidebar-bg); min-height: 220px;">
                <!-- Circle Pattern Background -->
                <div class="absolute inset-0 opacity-[0.15] pointer-events-none" style="color: var(--sidebar-text);">
                  <div class="absolute rounded-full" style="top: -10%; left: -5%; width: 120px; height: 120px; background-color: currentColor;"></div>
                  <div class="absolute rounded-full" style="top: 10%; right: -8%; width: 80px; height: 80px; background-color: currentColor;"></div>
                  <div class="absolute rounded-full" style="bottom: -5%; right: 10%; width: 100px; height: 100px; background-color: currentColor;"></div>
                  <div class="absolute rounded-full" style="bottom: 15%; left: -5%; width: 60px; height: 60px; background-color: currentColor;"></div>
                  <div class="absolute rounded-full" style="top: 50%; left: -8%; width: 70px; height: 70px; background-color: currentColor; transform: translateY(-50%);"></div>
                </div>
                
                <div class="relative z-10 flex flex-col justify-between h-full" style="color: var(--sidebar-text);">
                  <div>
                    <div class="text-lg font-semibold mb-6">{{ patient.fullName }}</div>
                    <div class="text-sm opacity-90 mb-3">CARD NUMBER</div>
                    <div class="text-xl font-mono tracking-wider mb-8">
                      {{ patient.cardId }}
                    </div>
                  </div>
                  
                  <div class="flex items-end justify-between">
                    <div class="flex gap-6">
                      <div>
                        <div class="text-xs opacity-80 mb-1">VALID</div>
                        <div class="text-sm font-semibold">
                          @if (patient.validUntil) {
                            {{ patient.validUntil | date:'MM/yy' }}
                          } @else {
                            -
                          }
                        </div>
                      </div>
                      <div>
                        <div class="text-xs opacity-80 mb-1">{{ 'patient.issuedDate' | translate }}</div>
                        <div class="text-sm font-semibold">
                          @if (patient.issuedDate) {
                            {{ patient.issuedDate | date:'MM/yy' }}
                          } @else {
                            -
                          }
                        </div>
                      </div>
                    </div>
                    
                    <div class="flex items-center justify-center">
                      @if (getPharmacyLogo()) {
                        <img [src]="getPharmacyLogo()" alt="Pharmacy Logo" class="h-10 w-auto object-contain" />
                      } @else {
                        <div class="w-16 h-10 rounded-lg flex items-center justify-center" style="background-color: rgba(227, 244, 245, 0.2);">
                          <span class="font-bold text-lg" style="color: var(--sidebar-text);">{{ getPharmacyInitials() }}</span>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Address Information -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'patient.addressInfo' | translate }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'patient.city' | translate }}</label>
            <p class="text-[var(--text-primary)]">{{ patient.address.city }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'patient.area' | translate }}</label>
            <p class="text-[var(--text-primary)]">{{ patient.address.area }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'patient.street' | translate }}</label>
            <p class="text-[var(--text-primary)]">{{ patient.address.street }}</p>
          </div>
          @if (patient.address.notes) {
            <div class="md:col-span-2 lg:col-span-3">
              <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'patient.notes' | translate }}</label>
              <p class="text-[var(--text-primary)]">{{ patient.address.notes }}</p>
            </div>
          }
        </div>
      </div>

      <!-- Metadata -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'invoice.createdAt' | translate }}</label>
            <p class="text-[var(--text-primary)]">{{ patient.createdAt | dateFormat }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'common.lastUpdated' | translate }}</label>
            <p class="text-[var(--text-primary)]">{{ patient.updatedAt | dateFormat }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PatientOverviewTabComponent {
  @Input() patient!: Patient;
  private pharmacyContext = inject(PharmacyContextService);

  // Mock data - will be replaced with actual service calls
  totalOrders = 12;
  totalSpent = 2450.75;
  loyaltyPoints = 245;
  walletBalance = 150.50;

  // Icons
  ordersIcon = '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>';
  moneyIcon = '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
  starIcon = '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>';
  walletIcon = '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>';

  getPharmacyLogo(): string | null {
    const pharmacy = this.pharmacyContext.getCurrentPharmacy();
    return pharmacy?.logoUrl || null;
  }

  getPharmacyInitials(): string {
    const pharmacy = this.pharmacyContext.getCurrentPharmacy();
    if (pharmacy?.name) {
      return pharmacy.name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'PH';
  }
}

