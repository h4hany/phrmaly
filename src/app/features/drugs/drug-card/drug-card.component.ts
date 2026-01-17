import { Component, inject, Input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../core/services/translation.service';
import { PharmacyDrug, InventoryCostingMethod } from '../../../core/models/drug.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

export interface DrugBadge {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
}

@Component({
  selector: 'app-drug-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div
      class="drug-card group relative rounded-xl p-6 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 flex flex-col"
      [style.color]="'var(--sidebar-text, #E3F4F5)'"
      [style.min-height]="'420px'"
      (click)="onCardClick($event)"
    >
      <!-- Selection Overlay (Semi-transparent with centered checkmark) -->
      @if (selectionMode) {
        <div
          class="selection-overlay absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none"
          [class.active]="selected"
        >
          <!-- Semi-transparent background with border -->
          <div class="absolute inset-0 rounded-xl bg-[var(--primary-bg,#D9F275)]/25 backdrop-blur-[2px] border-3"
               style="border-color: var(--primary-bg, #D9F275);"></div>

          <!-- Animated checkmark circle -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="checkmark-container">
              <div class="checkmark-circle">
                <!-- Checkmark SVG -->
                <svg class="checkmark-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="3"
                    d="M5 13l4 4L19 7"
                    class="checkmark-path"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Glow effect in corners -->
          <div class="corner-glow corner-glow-1"></div>
          <div class="corner-glow corner-glow-2"></div>
          <div class="corner-glow corner-glow-3"></div>
          <div class="corner-glow corner-glow-4"></div>
        </div>
      }

      <!-- Medicine Icon Pattern Background -->
      <div class="medicine-pattern absolute inset-0 pointer-events-none overflow-visible rounded-xl">
        <div
          class="absolute medicine-icon"
          [style.right]="isRTL ? 'auto' : '1rem'"
          [style.left]="isRTL ? '1rem' : 'auto'"
          [style.top]="'50%'"
          [style.transform]="'translateY(-50%)'"
        >
          <img src="icons/medicine.svg" alt="" class="w-40 h-40"
               style="filter: brightness(0) invert(1); opacity: 0.15;"/>
        </div>
      </div>

      <!-- Hover Glow Effect -->
      <div
        class="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        [style.background]="'radial-gradient(circle at center, var(--sidebar-active-bg, #D9F275)15, transparent 70%)'"
        [style.box-shadow]="'0 0 40px rgba(217, 242, 117, 0.3)'"
      ></div>

      <!-- View Button (Positioned outside cutout) -->
      <button
        type="button"
        class="view-button"
        [class.rtl-position]="isRTL"
        (click)="onViewClick($event)"
        [title]="'common.view' | translate"
      >
        <!-- LTR: Arrow pointing up-right -->
        <svg class="w-5 h-5 arrow-icon-ltr" [class.rotate-180]="isRTL"
             fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"
             [style.color]="'var(--primary-text, #003032)'">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
        </svg>
      </button>

      <!-- Content Container -->
      <div class="relative z-10 flex-1 flex flex-col">
        <!-- Top Section: Drug Icon/Initials -->
        <div class="flex items-start mb-5">
          <div class="relative flex-shrink-0">
            <div
              class="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ring-2 transition-all duration-200 shadow-lg"
              [style.background]="'var(--sidebar-active-bg, #D9F275)'"
              [style.color]="'var(--sidebar-active-text, #003032)'"
              [style.border-color]="'rgba(255, 255, 255, 0.2)'"
            >
              {{ getDrugInitials() }}
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="mb-4 flex-1">
          <h3
            class="text-lg font-bold mb-1.5 group-hover:opacity-90 transition-opacity duration-200 leading-tight"
            [style.color]="'var(--sidebar-text, #E3F4F5)'"
          >
            {{ getDrugName() }}
          </h3>
          @if (getManufacturer()) {
            <p
              class="text-sm mb-2 font-medium opacity-80"
              [style.color]="'var(--sidebar-text, #E3F4F5)'"
            >
              {{ getManufacturer() }}
            </p>
          }

          <!-- Identifiers -->
          <div class="space-y-1 mb-2">
            @if (drug.internalBarcode) {
              <p
                class="text-xs opacity-60"
                [style.color]="'var(--sidebar-text, #E3F4F5)'"
              >
                <span class="font-medium">{{ 'drugCard.barcode' | translate }}:</span> {{ drug.internalBarcode }}
              </p>
            }
            @if (drug.generalDrug?.internationalBarcode) {
              <p
                class="text-xs opacity-60"
                [style.color]="'var(--sidebar-text, #E3F4F5)'"
              >
                <span class="font-medium">{{ 'drugCard.plu' | translate }}:</span> {{ drug.generalDrug?.internationalBarcode }}
              </p>
            }
            <p
              class="text-xs opacity-60"
              [style.color]="'var(--sidebar-text, #E3F4F5)'"
            >
              <span class="font-medium">{{ 'drugCard.id' | translate }}:</span> #{{ drug.id }}
            </p>
          </div>

          <!-- Pricing -->
          <div class="mb-2">
            <div class="flex items-baseline gap-2 mb-1">
              <span
                class="text-2xl font-bold"
                [style.color]="'var(--sidebar-text, #E3F4F5)'"
              >
                {{ formatPrice(getCurrentPrice()) }}
              </span>
              @if (hasDiscount()) {
                <span
                  class="text-lg line-through opacity-60"
                  [style.color]="'var(--sidebar-text, #E3F4F5)'"
                >
                  {{ formatPrice(drug.price) }}
                </span>
              }
            </div>
            @if (hasDiscount()) {
              <span
                class="inline-block px-2 py-0.5 rounded text-xs font-medium"
                [style.background]="'rgba(34, 197, 94, 0.2)'"
                [style.color]="'#86efac'"
              >
                {{ 'drugCard.save' | translate }} {{ getDiscountPercentage() }}% • {{ formatPrice(getDiscountAmount()) }} {{ 'drugCard.off' | translate }}
              </span>
            }
          </div>

          <!-- Stock Level -->
          <div class="mb-2">
            <div class="flex items-center justify-between mb-1">
              <span
                class="text-xs font-semibold uppercase tracking-wide opacity-70"
                [style.color]="'var(--sidebar-text, #E3F4F5)'"
              >
                {{ 'drugCard.stockLevel' | translate }}
              </span>
              <span
                class="text-xs font-medium"
                [style.color]="'var(--sidebar-text, #E3F4F5)'"
              >
                {{ drug.stockQuantity }} / {{ getMaxStock() }}
              </span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-1.5 mb-1">
              <div
                class="h-1.5 rounded-full transition-all duration-300"
                [class.bg-yellow-400]="getStockPercentage() >= 50"
                [class.bg-amber-500]="getStockPercentage() >= 25 && getStockPercentage() < 50"
                [class.bg-red-400]="getStockPercentage() < 25"
                [style.width.%]="getStockPercentage()"
              ></div>
            </div>
            <div class="flex items-center justify-between text-xs opacity-60" [style.color]="'var(--sidebar-text, #E3F4F5)'">
              <span>{{ 'drugCard.min' | translate }}: {{ drug.minimumStock }} {{ 'drugCard.units' | translate }}</span>
              <span>{{ 'drugCard.method' | translate }}: {{ getCostingMethod() }}</span>
            </div>
          </div>

          <!-- Expiry -->
          @if (drug.expiryDate) {
            <div
              class="mb-2 p-2 rounded flex items-center gap-2"
              [style.background]="'rgba(234, 179, 8, 0.15)'"
              [style.border-left]="'3px solid #fbbf24'"
            >
              <svg class="w-4 h-4 flex-shrink-0" style="color: #fbbf24;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span
                class="text-xs font-medium"
                [style.color]="'var(--sidebar-text, #E3F4F5)'"
              >
                {{ 'drugCard.expires' | translate }}: {{ formatDate(drug.expiryDate) }} ({{ getMonthsUntilExpiry() }} {{ 'drugCard.months' | translate }})
              </span>
            </div>
          }

          <!-- Cost Layers -->
          @if (drug.costLayers && drug.costLayers.length > 0) {
            <div class="mb-2">
              <button
                type="button"
                class="w-full flex items-center justify-between p-1.5 rounded transition-colors hover:bg-white/5"
                (click)="toggleCostLayers()"
              >
                <span
                  class="text-xs font-semibold uppercase tracking-wide"
                  [style.color]="'var(--sidebar-text, #E3F4F5)'"
                >
                  {{ 'drugCard.costLayers' | translate }} ({{ drug.costLayers.length }})
                </span>
                <svg
                  class="w-4 h-4 transition-transform"
                  [class.rotate-180]="showCostLayers()"
                  [style.color]="'var(--sidebar-text, #E3F4F5)'"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              @if (showCostLayers()) {
                <div class="mt-1 space-y-1">
                  @for (layer of drug.costLayers; track $index) {
                    <div
                      class="p-1.5 rounded text-xs opacity-70"
                      [style.background]="'rgba(255, 255, 255, 0.05)'"
                      [style.color]="'var(--sidebar-text, #E3F4F5)'"
                    >
                      <div class="flex justify-between">
                        <span>{{ 'drugCard.quantity' | translate }}: {{ layer.quantity }}</span>
                        <span>{{ 'drugCard.cost' | translate }}: {{ formatPrice(layer.unitCost) }}</span>
                      </div>
                      <div class="text-xs opacity-60 mt-0.5">
                        {{ 'drugCard.purchased' | translate }}: {{ formatDate(layer.purchaseDate) }}
                        @if (layer.expiryDate) {
                          <span> • {{ 'drugCard.exp' | translate }}: {{ formatDate(layer.expiryDate) }}</span>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>

        <!-- Status and Badges (Same Row) -->
        <div class="flex items-center gap-2 flex-wrap mb-4">
          @if (badges && badges.length > 0) {
            @for (badge of badges; track $index) {
              <span [class]="getBadgeClasses(badge)">
                {{ badge.label }}
              </span>
            }
          }
          @if (drug.status) {
            <span [class]="getStatusBadgeClasses()">
              <span [class]="getStatusDotClasses()"></span>
              {{ getStatusLabel() }}
            </span>
          }
        </div>

        <!-- Action Buttons (Bottom Right, appear on hover) -->
        <div
          class="action-buttons absolute bottom-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0"
          [style.right]="isRTL ? 'auto' : '1rem'"
          [style.left]="isRTL ? '1rem' : 'auto'"
        >
          @if (showEdit) {
            <button
              type="button"
              class="p-2 rounded-lg backdrop-blur-sm transition-all duration-200 shadow-md opacity-80 hover:opacity-100"
              [style.background]="'rgba(255, 255, 255, 0.1)'"
              [style.color]="'var(--sidebar-text, #E3F4F5)'"
              (click)="onEditClick($event)"
              [title]="'common.edit' | translate"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
          }
          @if (showDelete) {
            <button
              type="button"
              class="p-2 rounded-lg backdrop-blur-sm transition-all duration-200 shadow-md opacity-80 hover:opacity-100 hover:bg-red-500/20 hover:text-red-400"
              [style.background]="'rgba(255, 255, 255, 0.1)'"
              [style.color]="'var(--sidebar-text, #E3F4F5)'"
              (click)="onDeleteClick($event)"
              [title]="'common.delete' | translate"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .drug-card {
      position: relative;
      overflow: visible;
      contain: layout;

      /* Geometry variables for cutout */
      --w: 50px;
      --h: 50px;
      --outline: 20px;
      --radius: 20px;

      /* Derived values */
      --offset: calc(-1 * var(--outline));
      --size: calc(var(--radius) + var(--outline));

      /* 🔥 TOP-RIGHT CONCAVE NOTCH 🔥 */
      background:
        /* horizontal carve */
        calc(100% - var(--offset)) var(--h)
        radial-gradient(
          circle at left bottom,
          transparent var(--radius),
          #F7F7F7 var(--radius)
        ),
          /* vertical carve */
        calc(100% - var(--w)) var(--offset)
        radial-gradient(
          circle at left bottom,
          transparent var(--radius),
          #F7F7F7 var(--radius)
        ),
          /* Card background */
        var(--sidebar-bg, #003032);

      background-repeat: no-repeat;
      background-size: var(--size) var(--size),
      var(--size) var(--size),
      cover;
    }

    /* RTL: Flip cutout to top-left */
    [dir="rtl"] .drug-card,
    :host-context([dir="rtl"]) .drug-card,
    :host-context(html[dir="rtl"]) .drug-card {
      background:
        /* horizontal carve (top-left for RTL) */
        var(--offset) var(--h)
        radial-gradient(
          circle at right bottom,
          transparent var(--radius),
          #F7F7F7 var(--radius)
        ),
          /* vertical carve */
        var(--w) var(--offset)
        radial-gradient(
          circle at right bottom,
          transparent var(--radius),
          #F7F7F7 var(--radius)
        ),
          /* Card background */
        var(--sidebar-bg, #003032);

      background-repeat: no-repeat;
      background-size: var(--size) var(--size),
      var(--size) var(--size),
      cover;
    }

    /* ========================================
       SELECTION OVERLAY STYLES
       ======================================== */
    .selection-overlay {
      z-index: 15;
      opacity: 0;
      transform: scale(0.98);
    }

    .selection-overlay.active {
      opacity: 1;
      transform: scale(1);
      pointer-events: auto;
    }

    /* Semi-transparent background with border */
    .selection-overlay > div:first-child {
      box-shadow:
        inset 0 0 80px rgba(217, 242, 117, 0.15),
        0 0 0 3px var(--primary-bg, #D9F275),
        0 8px 24px rgba(0, 0, 0, 0.2);
    }

    /* Corner glow effects */
    .corner-glow {
      position: absolute;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: radial-gradient(circle, var(--primary-bg, #D9F275) 0%, transparent 70%);
      opacity: 0;
      filter: blur(20px);
    }

    .corner-glow-1 {
      top: -20px;
      right: -20px;
    }

    .corner-glow-2 {
      bottom: -20px;
      right: -20px;
    }

    .corner-glow-3 {
      top: -20px;
      left: -20px;
    }

    .corner-glow-4 {
      bottom: -20px;
      left: -20px;
    }

    .selection-overlay.active .corner-glow {
      animation: glowPulse 2s ease-in-out infinite;
    }

    .selection-overlay.active .corner-glow-1 {
      animation-delay: 0s;
    }

    .selection-overlay.active .corner-glow-2 {
      animation-delay: 0.5s;
    }

    .selection-overlay.active .corner-glow-3 {
      animation-delay: 1s;
    }

    .selection-overlay.active .corner-glow-4 {
      animation-delay: 1.5s;
    }

    @keyframes glowPulse {
      0%, 100% {
        opacity: 0.3;
        transform: scale(1);
      }
      50% {
        opacity: 0.6;
        transform: scale(1.2);
      }
    }

    /* Checkmark Container */
    .checkmark-container {
      position: relative;
      width: 80px;
      height: 80px;
      transform: scale(0);
      opacity: 0;
    }

    .selection-overlay.active .checkmark-container {
      animation: checkmarkBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
    }

    @keyframes checkmarkBounce {
      0% {
        transform: scale(0) rotate(-45deg);
        opacity: 0;
      }
      70% {
        transform: scale(1.15) rotate(5deg);
        opacity: 1;
      }
      100% {
        transform: scale(1) rotate(0deg);
        opacity: 1;
      }
    }

    /* Checkmark Circle */
    .checkmark-circle {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary-bg, #D9F275) 0%, #bef264 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow:
        0 0 0 3px var(--sidebar-bg, #003032),
        0 0 0 6px var(--primary-bg, #D9F275),
        0 8px 20px rgba(0, 0, 0, 0.3);
      position: relative;
    }

    .checkmark-circle::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.5), transparent);
      opacity: 0.8;
    }

    .checkmark-circle::after {
      content: '';
      position: absolute;
      inset: -6px;
      border-radius: 50%;
      background: transparent;
      border: 2px solid var(--primary-bg, #D9F275);
      animation: ripple 1.5s ease-out infinite;
    }

    @keyframes ripple {
      0% {
        transform: scale(1);
        opacity: 1;
      }
      100% {
        transform: scale(1.5);
        opacity: 0;
      }
    }

    /* Checkmark Icon */
    .checkmark-icon {
      width: 40px;
      height: 40px;
      color: var(--primary-text, #003032);
      position: relative;
      z-index: 1;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }

    .checkmark-path {
      stroke-dasharray: 50;
      stroke-dashoffset: 50;
    }

    .selection-overlay.active .checkmark-path {
      animation: drawCheck 0.4s ease-out 0.3s forwards;
    }

    @keyframes drawCheck {
      to {
        stroke-dashoffset: 0;
      }
    }

    /* ROUND BUTTON SLOT - positioned outside cutout */
    .view-button {
      position: absolute;
      top: 2px;
      right: 0;
      width: var(--w);
      height: var(--h);
      outline: var(--outline) solid #F7F7F7;
      border-radius: 50%;
      background: var(--primary-bg, #D9F275);
      border-color: var(--primary-bg);
      display: grid;
      place-items: center;
      cursor: pointer;
      transition: background 0.15s ease, transform 0.15s ease;
      z-index: 20;
      padding: 0;
      border: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .view-button:hover {
      transform: scale(1.05);
    }

    /* RTL: Position button on top-left */
    .view-button.rtl-position,
    [dir="rtl"] .view-button,
    :host-context([dir="rtl"]) .view-button,
    :host-context(html[dir="rtl"]) .view-button {
      right: auto;
      left: 0;
    }

    .drug-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      opacity: 0;
      transition: opacity 0.2s;
      z-index: 2;
    }

    .drug-card:hover::before {
      opacity: 1;
    }

    /* RTL Support */
    [dir="rtl"] .drug-card {
      direction: rtl;
    }

    /* RTL: Move action buttons to left - Must override Tailwind classes */
    :host-context([dir="rtl"]) .action-buttons,
    :host-context([dir="rtl"]) .action-buttons.right-4,
    :host-context([dir="rtl"]) .drug-card .action-buttons {
      right: auto !important;
      left: 1rem !important;
    }

    /* Global RTL support (for html element) */
    :host-context(html[dir="rtl"]) .action-buttons {
      right: auto !important;
      left: 1rem !important;
    }

    [dir="rtl"] .drug-card .absolute.bottom-0.right-0 {
      right: auto;
      left: 0;
    }

    /* Ensure LTR arrow is visible by default */
    .arrow-icon-ltr {
      display: block;
    }

    /* In selection mode, make card clickable */
    .drug-card {
      user-select: none;
    }
  `]
})
export class DrugCardComponent {
  private translationService = inject(TranslationService);

  @Input() drug!: PharmacyDrug;
  @Input() badges?: DrugBadge[];
  @Input() showEdit: boolean = true;
  @Input() showDelete: boolean = true;
  @Input() costingMethod: InventoryCostingMethod = 'FIFO';
  @Input() selectionMode: boolean = false;
  @Input() selected: boolean = false;

  view = output<void>();
  edit = output<void>();
  delete = output<void>();
  selectionToggle = output<boolean>();

  showCostLayers = signal(false);

  get isRTL(): boolean {
    return this.translationService.getCurrentLanguage() === 'ar';
  }

  getDrugInitials(): string {
    const name = this.getDrugName();
    if (name) {
      const words = name.trim().split(/\s+/);
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return 'DR';
  }

  getDrugName(): string {
    return this.drug?.generalDrug?.name || 'N/A';
  }

  getManufacturer(): string {
    return this.drug?.generalDrug?.manufacturer || '';
  }

  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  hasDiscount(): boolean {
    return this.drug.priceAfterDiscount < this.drug.price;
  }

  getCurrentPrice(): number {
    return this.drug.priceAfterDiscount;
  }

  getDiscountAmount(): number {
    return this.drug.price - this.drug.priceAfterDiscount;
  }

  getDiscountPercentage(): number {
    if (!this.hasDiscount()) return 0;
    return Math.round(((this.drug.price - this.drug.priceAfterDiscount) / this.drug.price) * 100);
  }

  getMaxStock(): number {
    if (this.drug.costLayers && this.drug.costLayers.length > 0) {
      const totalFromLayers = this.drug.costLayers.reduce((sum, layer) => sum + layer.quantity, 0);
      return Math.max(totalFromLayers, this.drug.stockQuantity, this.drug.minimumStock * 2);
    }
    return Math.max(this.drug.stockQuantity, this.drug.minimumStock * 2);
  }

  getStockPercentage(): number {
    const maxStock = this.getMaxStock();
    if (maxStock === 0) return 0;
    return Math.min((this.drug.stockQuantity / maxStock) * 100, 100);
  }

  getCostingMethod(): string {
    return this.costingMethod;
  }

  getMonthsUntilExpiry(): number {
    if (!this.drug.expiryDate) return 0;
    const expiry = new Date(this.drug.expiryDate);
    const today = new Date();
    const months = (expiry.getFullYear() - today.getFullYear()) * 12 + (expiry.getMonth() - today.getMonth());
    return Math.max(0, months);
  }

  getBadgeClasses(badge: DrugBadge): string {
    const base = 'px-2.5 py-1 rounded-full text-xs font-medium';
    const variant = badge.variant || 'default';

    const variants: { [key: string]: string } = {
      success: 'bg-green-500/20 text-green-400',
      warning: 'bg-amber-500/20 text-amber-400',
      danger: 'bg-red-500/20 text-red-400',
      info: 'bg-blue-500/20 text-blue-400',
      default: 'bg-white/10 text-white/80'
    };

    return `${base} ${variants[variant]}`;
  }

  getStatusBadgeClasses(): string {
    const base = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium';
    const status = this.drug?.status;
    if (status === 'active') {
      return `${base} bg-green-500/20 text-green-400`;
    } else if (status === 'out_of_stock') {
      return `${base} bg-red-500/20 text-red-400`;
    }
    return `${base} bg-white/10 text-white/60`;
  }

  getStatusDotClasses(): string {
    const base = 'w-1.5 h-1.5 rounded-full mr-2';
    const status = this.drug?.status;
    if (status === 'active') {
      return `${base} bg-green-400`;
    } else if (status === 'out_of_stock') {
      return `${base} bg-red-400`;
    }
    return `${base} bg-gray-400`;
  }

  getStatusLabel(): string {
    const status = this.drug?.status;
    if (status === 'active') {
      return this.translationService.translate('drugCard.active') || 'Active';
    } else if (status === 'out_of_stock') {
      return this.translationService.translate('drugCard.outOfStock') || 'Out of Stock';
    }
    return this.translationService.translate('drugCard.inactive') || 'Inactive';
  }

  toggleCostLayers(): void {
    this.showCostLayers.update(val => !val);
  }

  onCardClick(event: Event): void {
    // Only toggle selection if in selection mode and not clicking buttons
    if (this.selectionMode && !this.isButtonClick(event)) {
      this.selectionToggle.emit(!this.selected);
    }
  }

  onViewClick(event: Event): void {
    event.stopPropagation();
    this.view.emit();
  }

  onEditClick(event: Event): void {
    event.stopPropagation();
    this.edit.emit();
  }

  onDeleteClick(event: Event): void {
    event.stopPropagation();
    this.delete.emit();
  }

  private isButtonClick(event: Event): boolean {
    const target = event.target as HTMLElement;
    return target.closest('button') !== null;
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }
}
