import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { DrugsService } from '../../../core/services/drugs.service';
import { PharmacyDrug } from '../../../core/models/drug.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import { AuthService } from '../../../core/services/auth.service';
import { Pharmacy } from '../../../core/models/user.model';

interface DrugWithExpiry extends PharmacyDrug {
  daysToExpiry?: number;
  expiryDateDisplay?: string;
  pharmacyName?: string;
}

interface PharmacyAlerts {
  pharmacy: Pharmacy;
  lowStockDrugs: DrugWithExpiry[];
  nearExpiryDrugs: DrugWithExpiry[];
}

@Component({
  selector: 'app-pharmacies-inventory-alerts',
  standalone: true,
  imports: [CommonModule, DatePipe, TranslatePipe],
  template: `
    <div class="alerts-container">
      @for (pharmacyAlert of pharmacyAlerts; track pharmacyAlert.pharmacy.id) {
        <div class="pharmacy-card">
          <!-- Pharmacy Header with Gradient -->
          <div class="pharmacy-header">
            <div class="header-content">
              <div class="pharmacy-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 21h18M5 21V7l8-4v18M19 21V10l-6-3"/>
                  <circle cx="9" cy="14" r="1" fill="currentColor"/>
                </svg>
              </div>
              <div class="pharmacy-info">
                <h2 class="pharmacy-name">{{ pharmacyAlert.pharmacy.name }}</h2>
                <p class="pharmacy-address">{{ pharmacyAlert.pharmacy.address || pharmacyAlert.pharmacy.email || '' }}</p>
              </div>
            </div>

            <div class="stats-overview">
              <div class="stat-pill stat-warning">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span>{{ pharmacyAlert.lowStockDrugs.length }}</span>
              </div>
              <div class="stat-pill stat-danger">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>{{ pharmacyAlert.nearExpiryDrugs.length }}</span>
              </div>
            </div>
          </div>

          <!-- Alert Sections Grid -->
          <div class="alerts-grid">
            <!-- Low Stock Alert -->
            <div class="alert-section low-stock-section">
              <div class="section-header">
                <div class="section-title-wrapper">
                  <div class="alert-icon warning-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="section-title">{{ 'inventory.lowStock' | translate }}</h3>
                    <p class="section-subtitle">{{ 'inventory.belowMinimum' | translate }}</p>
                  </div>
                </div>
                <div class="count-badge warning-badge">{{ pharmacyAlert.lowStockDrugs.length }}</div>
              </div>

              @if (pharmacyAlert.lowStockDrugs.length > 0) {
                <div class="drug-cards">
                  @for (drug of pharmacyAlert.lowStockDrugs; track drug.id) {
                    <div class="drug-card" (click)="viewDrug(drug.id)">
                      <div class="drug-card-header">
                        <h4 class="drug-name">{{ drug.generalDrug?.name || 'N/A' }}</h4>
                        <button class="view-btn" [title]="'common.view' | translate">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                      </div>
                      <div class="drug-barcode">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <rect x="1" y="4" width="4" height="16"/>
                          <rect x="7" y="4" width="2" height="16"/>
                          <rect x="11" y="4" width="4" height="16"/>
                          <rect x="17" y="4" width="6" height="16"/>
                        </svg>
                        <span>{{ drug.internalBarcode }}</span>
                      </div>
                      <div class="drug-metrics">
                        <div class="metric">
                          <span class="metric-label">{{ 'inventory.currentStock' | translate }}</span>
                          <span class="metric-value critical">{{ drug.stockQuantity }}</span>
                        </div>
                        <div class="metric">
                          <span class="metric-label">{{ 'inventory.minimumStock' | translate }}</span>
                          <span class="metric-value">{{ drug.minimumStock }}</span>
                        </div>
                        <div class="metric">
                          <span class="metric-label">{{ 'drug.price' | translate }}</span>
                          <span class="metric-value">{{ drug.price }}</span>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="empty-state">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p>{{ 'inventory.adequateStock' | translate }}</p>
                </div>
              }
            </div>

            <!-- Near Expiry Alert -->
            <div class="alert-section expiry-section">
              <div class="section-header">
                <div class="section-title-wrapper">
                  <div class="alert-icon danger-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="section-title">{{ 'inventory.nearExpiry' | translate }}</h3>
                    <p class="section-subtitle">{{ 'inventory.expiringWithin30Days' | translate }}</p>
                  </div>
                </div>
                <div class="count-badge danger-badge">{{ pharmacyAlert.nearExpiryDrugs.length }}</div>
              </div>

              @if (pharmacyAlert.nearExpiryDrugs.length > 0) {
                <div class="drug-cards">
                  @for (drug of pharmacyAlert.nearExpiryDrugs; track drug.id) {
                    <div class="drug-card" (click)="viewDrug(drug.id)">
                      <div class="drug-card-header">
                        <h4 class="drug-name">{{ drug.generalDrug?.name || 'N/A' }}</h4>
                        <button class="view-btn" [title]="'common.view' | translate">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                      </div>
                      <div class="drug-barcode">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <rect x="1" y="4" width="4" height="16"/>
                          <rect x="7" y="4" width="2" height="16"/>
                          <rect x="11" y="4" width="4" height="16"/>
                          <rect x="17" y="4" width="6" height="16"/>
                        </svg>
                        <span>{{ drug.internalBarcode }}</span>
                      </div>
                      <div class="expiry-info">
                        <div class="expiry-date">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          <span>{{ drug.expiryDate | date:'mediumDate' }}</span>
                        </div>
                        @if (drug.daysToExpiry !== undefined) {
                          <div [class]="'days-badge ' + getExpiryBadgeClass(drug.daysToExpiry)">
                            {{ formatDaysToExpiry(drug.daysToExpiry) }}
                          </div>
                        }
                      </div>
                      <div class="drug-stock">
                        <span class="stock-label">{{ 'drug.stock' | translate }}:</span>
                        <span class="stock-value">{{ drug.stockQuantity }} {{ 'inventory.items' | translate }}</span>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="empty-state">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p>{{ 'inventory.noExpiring' | translate }}</p>
                </div>
              }
            </div>
          </div>
        </div>
      } @empty {
        <div class="no-pharmacies">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M3 21h18M5 21V7l8-4v18M19 21V10l-6-3"/>
            <circle cx="9" cy="14" r="1" fill="currentColor"/>
          </svg>
          <p>{{ 'inventory.noPharmacies' | translate }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .alerts-container {
      padding: 1.5rem;
      max-width: 1600px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .pharmacy-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      border: 1px solid rgba(226, 232, 240, 0.8);
      animation: slideIn 0.4s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .pharmacy-header {
      background: linear-gradient(135deg, var(--sidebar-bg) 0%, var(--sidebar-bg) 100%);
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }

    .pharmacy-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, var(--sidebar-bg) 0%, transparent 70%);
      border-radius: 50%;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      position: relative;
      z-index: 1;
      margin-bottom: 1.5rem;
    }

    .pharmacy-icon {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, var(--sidebar-active-bg) 0%, var(--sidebar-active-bg) 100%);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: black;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .pharmacy-info {
      flex: 1;
    }

    .pharmacy-name {
      font-size: 1.75rem;
      font-weight: 700;
      color: white;
      margin: 0 0 0.25rem 0;
      letter-spacing: -0.02em;
    }

    .pharmacy-address {
      font-size: 0.9rem;
      color: #cbd5e1;
      margin: 0;
    }

    .stats-overview {
      display: flex;
      gap: 1rem;
      position: relative;
      z-index: 1;
    }

    .stat-pill {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.125rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.95rem;
      backdrop-filter: blur(10px);
    }

    .stat-warning {
      background: rgba(234, 179, 8, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(234, 179, 8, 0.3);
    }

    .stat-danger {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .alerts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 1.5rem;
      padding: 2rem;
    }

    .alert-section {
      background: white;
      border-radius: 16px;
      padding: 1.75rem;
      border: 2px solid transparent;
      transition: all 0.3s ease;
    }

    .low-stock-section {
      border-color: rgba(234, 179, 8, 0.2);
      background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
    }

    .expiry-section {
      border-color: rgba(239, 68, 68, 0.2);
      background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      padding-bottom: 1.25rem;
      border-bottom: 2px solid rgba(0, 0, 0, 0.05);
    }

    .section-title-wrapper {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .alert-icon {
      width: 42px;
      height: 42px;
      border-radius: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .warning-icon {
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
    }

    .danger-icon {
      background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(248, 113, 113, 0.3);
    }

    .section-title {
      font-size: 1.35rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.25rem 0;
      letter-spacing: -0.01em;
    }

    .section-subtitle {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0;
    }

    .count-badge {
      font-size: 1.125rem;
      font-weight: 700;
      padding: 0.5rem 1rem;
      border-radius: 10px;
      min-width: 50px;
      text-align: center;
    }

    .warning-badge {
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      color: white;
      box-shadow: 0 3px 10px rgba(251, 191, 36, 0.25);
    }

    .danger-badge {
      background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
      color: white;
      box-shadow: 0 3px 10px rgba(248, 113, 113, 0.25);
    }

    .drug-cards {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .drug-card {
      background: white;
      border: 1.5px solid rgba(226, 232, 240, 0.8);
      border-radius: 14px;
      padding: 1.25rem;
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
    }

    .drug-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 14px;
      padding: 1.5px;
      background: linear-gradient(135deg, transparent, transparent);
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .drug-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      border-color: #3b82f6;
    }

    .drug-card:hover::before {
      opacity: 1;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    }

    .drug-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .drug-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: #0f172a;
      margin: 0;
      flex: 1;
      line-height: 1.4;
    }

    .view-btn {
      background: #f1f5f9;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .view-btn:hover {
      background: #3b82f6;
      color: white;
      transform: scale(1.05);
    }

    .drug-barcode {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
      color: #475569;
      background: #f8fafc;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      width: fit-content;
      margin-bottom: 1rem;
    }

    .drug-barcode svg {
      color: #94a3b8;
    }

    .drug-metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #f1f5f9;
    }

    .metric {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .metric-label {
      font-size: 0.75rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 500;
    }

    .metric-value {
      font-size: 1.125rem;
      font-weight: 700;
      color: #0f172a;
    }

    .metric-value.critical {
      color: #ef4444;
      font-size: 1.25rem;
    }

    .expiry-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding: 0.875rem;
      background: #f8fafc;
      border-radius: 10px;
    }

    .expiry-date {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: #475569;
    }

    .expiry-date svg {
      color: #94a3b8;
    }

    .days-badge {
      font-size: 0.85rem;
      font-weight: 700;
      padding: 0.4rem 0.875rem;
      border-radius: 8px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .days-badge.critical {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
    }

    .days-badge.urgent {
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
    }

    .days-badge.warning {
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
    }

    .drug-stock {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: #f1f5f9;
      border-radius: 8px;
    }

    .stock-label {
      font-size: 0.85rem;
      color: #64748b;
      font-weight: 500;
    }

    .stock-value {
      font-size: 0.95rem;
      font-weight: 600;
      color: #0f172a;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1rem;
      color: #94a3b8;
    }

    .empty-state svg {
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state p {
      font-size: 0.95rem;
      margin: 0;
    }

    .no-pharmacies {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 20px;
      color: #94a3b8;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    }

    .no-pharmacies svg {
      margin-bottom: 1.5rem;
      opacity: 0.5;
    }

    .no-pharmacies p {
      font-size: 1.1rem;
      margin: 0;
    }

    @media (max-width: 1200px) {
      .alerts-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .alerts-container {
        padding: 1rem;
      }

      .pharmacy-header {
        padding: 1.5rem;
      }

      .pharmacy-name {
        font-size: 1.5rem;
      }

      .stats-overview {
        flex-wrap: wrap;
      }

      .alerts-grid {
        padding: 1.5rem;
        gap: 1.25rem;
      }

      .drug-metrics {
        grid-template-columns: 1fr;
      }

      .expiry-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }
    }
  `]
})
export class PharmaciesInventoryAlertsComponent implements OnInit {
  private drugsService = inject(DrugsService);
  private router = inject(Router);
  private translationService = inject(TranslationService);
  private authService = inject(AuthService);

  pharmacyAlerts: PharmacyAlerts[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    this.loading = true;
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.loading = false;
      return;
    }

    // Get all pharmacies for the account
    const pharmacies: Pharmacy[] = [];
    if (user.pharmacies && user.pharmacies.length > 0) {
      // User has multiple pharmacies (account_owner or pharmacy_inventory_manager with multiple pharmacies)
      pharmacies.push(...user.pharmacies);
    } else if (user.pharmacyId) {
      // User has single pharmacy (pharmacy_inventory_manager or other roles)
      const pharmacy: Pharmacy = {
        id: user.pharmacyId,
        name: 'Pharmacy',
        primaryColor: '#166534',
        secondaryColor: '#22c55e',
        sidebarColor: '#14532d'
      };
      pharmacies.push(pharmacy);
    }

    if (pharmacies.length === 0) {
      this.loading = false;
      return;
    }

    // Get pharmacy IDs
    const pharmacyIds = pharmacies.map(p => p.id);

    // Load low stock drugs
    this.drugsService.getLowStockDrugs().subscribe({
      next: (allDrugs) => {
        // Filter drugs by pharmacy IDs
        const filteredLowStock = allDrugs.filter(drug => pharmacyIds.includes(drug.pharmacyId));

        // Group by pharmacy
        const lowStockByPharmacy = this.groupDrugsByPharmacy(filteredLowStock, pharmacies);

        // Load expiring drugs
        this.drugsService.getExpiringDrugs(30).subscribe({
          next: (allExpiringDrugs) => {
            // Filter drugs by pharmacy IDs
            const filteredExpiring = allExpiringDrugs.filter(drug => pharmacyIds.includes(drug.pharmacyId));

            // Add days to expiry
            const expiringWithDays = filteredExpiring.map(drug => ({
              ...drug,
              daysToExpiry: this.calculateDaysToExpiry(drug.expiryDate)
            })).sort((a, b) => (a.daysToExpiry || 999) - (b.daysToExpiry || 999));

            // Group by pharmacy
            const expiringByPharmacy = this.groupDrugsByPharmacy(expiringWithDays, pharmacies);

            // Combine into pharmacy alerts
            this.pharmacyAlerts = pharmacies.map(pharmacy => ({
              pharmacy,
              lowStockDrugs: lowStockByPharmacy[pharmacy.id] || [],
              nearExpiryDrugs: expiringByPharmacy[pharmacy.id] || []
            }));

            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading expiring drugs:', error);
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading low stock drugs:', error);
        this.loading = false;
      }
    });
  }

  groupDrugsByPharmacy(drugs: DrugWithExpiry[], pharmacies: Pharmacy[]): Record<string, DrugWithExpiry[]> {
    const grouped: Record<string, DrugWithExpiry[]> = {};

    pharmacies.forEach(pharmacy => {
      grouped[pharmacy.id] = drugs.filter(drug => drug.pharmacyId === pharmacy.id);
    });

    return grouped;
  }

  calculateDaysToExpiry(expiryDate?: Date): number {
    if (!expiryDate) return 999;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  formatDaysToExpiry(days: number): string {
    if (days < 0) return this.translationService.translate('inventory.expired');
    if (days === 0) return this.translationService.translate('inventory.expiresToday');
    return `${days} ${this.translationService.translate('common.days')}`;
  }

  getExpiryBadgeClass(days: number): string {
    if (days < 0 || days <= 7) return 'critical';
    if (days <= 14) return 'urgent';
    return 'warning';
  }

  getDaysToExpiryClass(days: number): string {
    if (days < 0) return 'text-red-600 font-semibold';
    if (days <= 7) return 'text-red-600 font-medium';
    if (days <= 14) return 'text-orange-600 font-medium';
    return 'text-yellow-600';
  }

  viewDrug(id: string): void {
    this.router.navigate(['/drugs', id]);
  }
}
