import {Component, inject, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {ButtonComponent} from '../../../shared/components/button/button.component';
import {ModalComponent} from '../../../shared/components/modal/modal.component';
import {AlertComponent} from '../../../shared/components/alert/alert.component';
import {DrugsService} from '../../../core/services/drugs.service';
import {InvoiceCartService} from '../../../core/services/invoice-cart.service';
import {RequestedProductsService} from '../../../core/services/requested-products.service';
import {ToastService} from '../../../core/services/toast.service';
import {TranslationService} from '../../../core/services/translation.service';
import {PharmacyDrug} from '../../../core/models/drug.model';
import {TranslatePipe} from '../../../core/pipes/translate.pipe';
import type {DrugBadge} from '../drug-card/drug-card.component';
import {DrugCardComponent} from '../drug-card/drug-card.component';
import {ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-drugs-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent, ModalComponent, AlertComponent, TranslatePipe, DrugCardComponent, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      @if (errorMessage) {
        <app-alert type="error" [title]="errorMessage"/>
      }

      <!-- Integrated Search Hero with Info Banner -->
      <div class="search-hero">
        <!-- Floating Orb Background -->
        <div class="floating-orb"></div>

        <!-- Search Input -->
        <div class="search-wrapper">
          <svg class="search-icon-hero" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            [placeholder]="'search.placeholder' | translate"
            [value]="searchQuery"
            (input)="searchQuery = $any($event.target).value; onSearch()"
            class="search-input-hero"
          />
        </div>

        <!-- Action Pills and Info Banner Side by Side -->
        <div class="hero-content-wrapper">
          <!-- Left: Action Pills -->


          <!-- Right: Info Banner -->
          <div class="info-banner-integrated">
            <!-- Decorative background pattern -->
            <div class="info-banner-pattern"></div>

            <!-- Content -->
            <div class="info-banner-content">
              <!-- Cosmetic Indicator -->
              <div class="info-item">
                <div class="info-icon cosmetic-icon">
                  <span class="sparkle">✨</span>
                </div>
                <div class="info-text">
                  <span class="info-label">{{ 'info.cosmeticProducts' | translate }}</span>
                  <span class="info-description">{{ 'info.cosmeticDescription' | translate }}</span>
                </div>
              </div>

              <!-- Divider -->
              <div class="info-divider"></div>

              <!-- Imported Indicator -->
              <div class="info-item">
                <div class="info-icon imported-icon">
                  <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                  </svg>
                </div>
                <div class="info-text">
                  <span class="info-label">{{ 'info.importedProducts' | translate }}</span>
                  <span class="info-description">{{ 'info.importedDescription' | translate }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="action-pills-wrapper">
            <button
              type="button"
              class="pill-button"
              [class.active]="selectionMode"
              (click)="toggleSelectionMode()"
            >
              <svg class="pill-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {{ selectionMode ? ('button.cancelSelection' | translate) : ('button.selectForInvoice' | translate) }}
            </button>
            <button
              type="button"
              class="pill-button"
              (click)="openImportModal()"
            >
              <svg class="pill-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
              {{ 'button.import' | translate }}
            </button>
            <button
              type="button"
              class="pill-button"
            >
              <svg class="pill-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              {{ 'common.export' | translate }}
            </button>
            <button
              type="button"
              class="pill-button primary"
              (click)="navigateToNew()"
            >
              <svg class="pill-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              {{ 'button.addNewDrug' | translate }}
            </button>
          </div>
        </div>
      </div>

      <!-- Selection Mode Bar -->
      @if (selectionMode && selectedDrugIds.size > 0) {
        <div
          class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white shadow-lg rounded-lg px-6 py-4 border-2 border-[#166534] flex items-center gap-4">
          <span class="text-gray-700 font-medium">
            {{ selectedDrugIds.size }} {{ 'invoice.drugsSelected' | translate }}
          </span>
          <app-button variant="primary" (onClick)="createInvoiceFromSelection()">
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            {{ 'invoice.createInvoice' | translate }} ({{ selectedDrugIds.size }})
          </app-button>
          <button
            type="button"
            (click)="clearSelection()"
            class="text-gray-500 hover:text-gray-700"
            [title]="'common.clear' | translate"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }

      <!-- Cards Grid -->
      @if (loading) {
        <div class="flex items-center justify-center py-12">
          <div class="text-gray-500">{{ 'common.loading' | translate }}</div>
        </div>
      } @else if (drugs.length === 0) {
        <div class="flex flex-col items-center justify-center py-12 text-gray-500">
          <svg class="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
          </svg>
          <p class="text-lg font-medium mb-4">{{ 'empty.noDrugs' | translate }}</p>
          @if (searchQuery.trim()) {
            <app-button variant="primary" (onClick)="openRequestProductModal()">
              <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              {{ 'button.requestProduct' | translate }}
            </app-button>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (drug of drugs; track drug.id) {
            <app-drug-card
              [drug]="drug"
              [badges]="getBadges(drug)"
              [selectionMode]="selectionMode"
              [selected]="selectedDrugIds.has(drug.id)"
              (view)="viewDrug(drug.id)"
              (edit)="editDrug(drug.id)"
              (delete)="confirmDelete(drug)"
              (selectionToggle)="onDrugSelectionToggle(drug.id, $event)"
            ></app-drug-card>
          }
        </div>
      }

      <!-- Delete Modal -->
      <app-modal
        #deleteModal
        [title]="'button.deleteDrug' | translate"
        [showFooter]="true"
        [confirmText]="'common.delete' | translate"
        [confirmLoading]="deleting"
        (confirmed)="deleteDrug()"
      >
        <p>{{ 'modal.deleteDrugConfirm' | translate }}</p>
      </app-modal>

      <!-- Import Modal -->
      <app-modal
        #importModal
        [title]="'button.importDrugs' | translate"
        [showFooter]="true"
        [confirmText]="'button.upload' | translate"
        [confirmLoading]="importing"
        (confirmed)="handleImport()"
      >
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ 'button.selectFile' | translate }}
            </label>
            <input
              type="file"
              #fileInput
              (change)="onFileSelected($event)"
              accept=".csv,.xlsx,.xls"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-[#166534] text-sm"
            />
            <p class="mt-2 text-xs text-gray-500">
              {{ 'button.importFileFormat' | translate }}
            </p>
            @if (selectedFile) {
              <p class="mt-2 text-sm text-gray-700">
                <span class="font-medium">{{ 'button.selectedFile' | translate }}:</span> {{ selectedFile.name }}
              </p>
            }
          </div>
          @if (importError) {
            <app-alert type="error" [title]="importError"></app-alert>
          }
          @if (importSuccess) {
            <app-alert type="success" [title]="importSuccess"></app-alert>
          }
        </div>
      </app-modal>

      <!-- Request Product Modal -->
      <app-modal
        #requestProductModal
        [title]="'button.requestProduct' | translate"
        [showFooter]="true"
        [confirmText]="'common.submit' | translate"
        [confirmLoading]="requestingProduct"
        (confirmed)="submitProductRequest()"
      >
        <form [formGroup]="requestProductForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ 'requestedProduct.productName' | translate }} <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              formControlName="productName"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-[#166534]"
              [class.border-red-500]="requestProductForm.get('productName')?.invalid && requestProductForm.get('productName')?.touched"
            />
            @if (requestProductForm.get('productName')?.invalid && requestProductForm.get('productName')?.touched) {
              <p class="mt-1 text-sm text-red-600">{{ 'validation.nameRequired' | translate }}</p>
            }
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ 'requestedProduct.notes' | translate }}
            </label>
            <textarea
              formControlName="notes"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-[#166534]"
              [placeholder]="'requestedProduct.notesPlaceholder' | translate"
            ></textarea>
          </div>
        </form>
      </app-modal>
    </div>
  `,
  styles: [`
    /* ========================================
       SEARCH HERO SECTION
       ======================================== */
    .search-hero {
      position: relative;
      background: linear-gradient(135deg, #003032 0%, #004547 100%);
      border-radius: 20px;
      padding: 2.5rem;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0, 48, 50, 0.15);
      margin-bottom: 2rem;
    }

    .floating-orb {
      position: absolute;
      top: -50%;
      right: -10%;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(217, 242, 117, 0.15), transparent);
      border-radius: 50%;
      animation: float 6s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0) scale(1);
      }
      50% {
        transform: translateY(-20px) scale(1.1);
      }
    }

    .search-wrapper {
      position: relative;
      margin: 0 auto;
    }

    .search-input-hero {
      width: 100%;
      padding: 1.25rem 1.5rem 1.25rem 3.5rem;
      border: 2px solid rgba(217, 242, 117, 0.3);
      border-radius: 16px;
      font-size: 1rem;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    .search-input-hero::placeholder {
      color: #9ca3af;
    }

    .search-input-hero:focus {
      outline: none;
      border-color: #D9F275;
      box-shadow: 0 12px 32px rgba(217, 242, 117, 0.25);
      transform: translateY(-2px);
    }

    .search-icon-hero {
      position: absolute;
      left: 1.25rem;
      top: 50%;
      transform: translateY(-50%);
      color: #003032;
      width: 20px;
      height: 20px;
    }

    /* ========================================
       HERO CONTENT WRAPPER (Side by Side)
       ======================================== */
    .hero-content-wrapper {
      display: flex;
      /*grid-template-columns: 1fr 1fr;*/
      justify-content: space-between;
      margin-top: 1.5rem;
      align-items: start;
    }

    /* ========================================
       ACTION PILLS (Vertical Stack - Left Side)
       ======================================== */
    .action-pills-wrapper {
      display: flex;
      flex-direction: row;
      gap: 0.75rem;
    }

    .pill-button {
      /*width: 100%;*/
      padding: 0.75rem 1.5rem;
      border-radius: 50px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      color: #E3F4F5;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .pill-button:hover {
      background: #D9F275;
      color: #003032;
      border-color: #D9F275;
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(217, 242, 117, 0.3);
    }

    .pill-button.primary {
      background: #D9F275;
      color: #003032;
      border-color: #D9F275;
    }

    .pill-button.primary:hover {
      background: #bef264;
      transform: translateX(4px) scale(1.02);
    }

    .pill-button.active {
      background: #D9F275;
      color: #003032;
      border-color: #D9F275;
    }

    .pill-icon {
      width: 18px;
      height: 18px;
    }

    /* ========================================
       INFO BANNER (Right Side)
       ======================================== */
    .info-banner-integrated {
      /*position: relative;*/
      /*padding: 1.5rem;*/
      /*background: rgba(255, 255, 255, 0.08);*/
      backdrop-filter: blur(10px);
      /*border: 1px solid rgba(227, 244, 245, 0.15);*/
      /*border-radius: 16px;*/
      height: 100%;
      display: flex;
      align-items: center;
    }

    .info-banner-pattern {
      position: absolute;
      inset: 0;
      opacity: 0.03;
      background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(227, 244, 245, 0.5) 10px, rgba(227, 244, 245, 0.5) 11px);
      pointer-events: none;
      border-radius: 16px;
    }

    .info-banner-content {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      flex-wrap: wrap;
      width: 100%;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      animation: fadeInUp 0.6s ease-out;
    }

    .info-item:nth-child(2) {
      animation-delay: 0.1s;
    }

    .info-item:nth-child(3) {
      animation-delay: 0.2s;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .info-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
      transition: transform 0.3s ease;
    }

    .info-item:hover .info-icon {
      transform: scale(1.1) rotate(5deg);
    }

    .cosmetic-icon {
      background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
      box-shadow: 0 4px 12px rgba(236, 72, 153, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    .cosmetic-icon::before {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 12px;
      background: linear-gradient(135deg, #ec4899, #db2777);
      opacity: 0.4;
      filter: blur(8px);
      z-index: -1;
    }

    .sparkle {
      font-size: 1.5rem;
      animation: sparkleRotate 3s linear infinite;
    }

    @keyframes sparkleRotate {
      0%, 100% {
        transform: rotate(0deg);
      }
      25% {
        transform: rotate(10deg);
      }
      75% {
        transform: rotate(-10deg);
      }
    }

    .imported-icon {
      background: linear-gradient(135deg, #D9F275 0%, #bef264 100%);
      color: #003032;
      box-shadow: 0 4px 12px rgba(217, 242, 117, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    }

    .imported-icon::before {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 12px;
      background: linear-gradient(135deg, #D9F275, #bef264);
      opacity: 0.5;
      filter: blur(8px);
      z-index: -1;
    }

    .imported-icon svg {
      animation: floatUp 2s ease-in-out infinite;
    }

    @keyframes floatUp {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-4px);
      }
    }

    .info-text {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-label {
      color: #E3F4F5;
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: 0.025em;
    }

    .info-description {
      color: rgba(227, 244, 245, 0.7);
      font-size: 0.8rem;
      font-weight: 500;
    }

    .info-divider {
      width: 2px;
      height: 48px;
      background: linear-gradient(to bottom, transparent, rgba(227, 244, 245, 0.3), transparent);
      position: relative;
    }

    .info-divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #D9F275;
      box-shadow: 0 0 12px rgba(217, 242, 117, 0.8);
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
      50% {
        opacity: 0.6;
        transform: translate(-50%, -50%) scale(1.3);
      }
    }

    /* ========================================
       RTL SUPPORT
       ======================================== */
    [dir="rtl"] .info-banner-content,
    :host-context([dir="rtl"]) .info-banner-content {
      direction: rtl;
    }

    [dir="rtl"] .search-icon-hero,
    :host-context([dir="rtl"]) .search-icon-hero {
      left: auto;
      right: 1.25rem;
    }

    [dir="rtl"] .search-input-hero,
    :host-context([dir="rtl"]) .search-input-hero {
      padding: 1.25rem 3.5rem 1.25rem 1.5rem;
    }

    [dir="rtl"] .pill-button:hover,
    :host-context([dir="rtl"]) .pill-button:hover {
      transform: translateX(-4px);
    }

    [dir="rtl"] .pill-button.primary:hover,
    :host-context([dir="rtl"]) .pill-button.primary:hover {
      transform: translateX(-4px) scale(1.02);
    }

    /* ========================================
       RESPONSIVE
       ======================================== */
    @media (max-width: 968px) {
      .hero-content-wrapper {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .pill-button:hover {
        transform: translateY(-2px);
      }

      .pill-button.primary:hover {
        transform: translateY(-2px) scale(1.02);
      }
    }

    @media (max-width: 768px) {
      .search-hero {
        padding: 2rem 1.5rem;
      }

      .action-pills-wrapper {
        gap: 0.5rem;
      }

      .pill-button {
        padding: 0.65rem 1rem;
        font-size: 0.85rem;
      }

      .info-banner-integrated {
        padding: 1.25rem 1rem;
      }

      .info-banner-content {
        gap: 1.5rem;
        flex-direction: column;
      }

      .info-divider {
        display: none;
      }

      .info-item {
        width: 100%;
        justify-content: center;
      }
    }
  `]})
export class DrugsListComponent implements OnInit {
  private router = inject(Router);
  private drugsService = inject(DrugsService);
  private invoiceCartService = inject(InvoiceCartService);
  private requestedProductsService = inject(RequestedProductsService);
  private toastService = inject(ToastService);
  private translationService = inject(TranslationService);
  private fb = inject(FormBuilder);

  drugs: PharmacyDrug[] = [];
  searchQuery = '';
  errorMessage = '';
  loading = false;
  deleting = false;
  selectedDrugId: string | null = null;
  lowStockCount = 0;
  expiringCount = 0;
  importing = false;
  selectedFile: File | null = null;
  importError = '';
  importSuccess = '';
  selectionMode = false;
  selectedDrugIds = new Set<string>();
  requestingProduct = false;
  requestProductForm!: FormGroup;
  @ViewChild('deleteModal') deleteModal!: ModalComponent;
  @ViewChild('importModal') importModal!: ModalComponent;
  @ViewChild('requestProductModal') requestProductModal!: ModalComponent;

  pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  };

  ngOnInit(): void {
    this.loadDrugs();
    this.checkAlerts();
    this.initRequestProductForm();
  }

  initRequestProductForm(): void {
    this.requestProductForm = this.fb.group({
      productName: ['', [Validators.required]],
      notes: ['']
    });
  }

  loadDrugs(): void {
    this.loading = true;
    this.drugsService.getPharmacyDrugs({
      page: this.pagination.page,
      pageSize: this.pagination.pageSize
    }).subscribe({
      next: (response) => {
        this.drugs = response.data;
        this.pagination = {
          page: response.page,
          pageSize: response.pageSize,
          total: response.total,
          totalPages: response.totalPages
        };
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load drugs';
        this.loading = false;
      }
    });
  }

  checkAlerts(): void {
    this.drugsService.getLowStockDrugs().subscribe({
      next: (drugs) => {
        this.lowStockCount = drugs.length;
      }
    });

    this.drugsService.getExpiringDrugs(30).subscribe({
      next: (drugs) => {
        this.expiringCount = drugs.length;
      }
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.loading = true;
      this.drugsService.searchPharmacyDrugs(this.searchQuery).subscribe({
        next: (results) => {
          this.drugs = results;
          this.pagination = {
            page: 1,
            pageSize: 10,
            total: results.length,
            totalPages: Math.ceil(results.length / 10)
          };
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'Search failed';
          this.loading = false;
        }
      });
    } else {
      this.loadDrugs();
    }
  }

  navigateToNew(): void {
    this.router.navigate(['/drugs/new']);
  }

  viewDrug(id: string): void {
    this.router.navigate(['/drugs', id]);
  }

  editDrug(id: string): void {
    this.router.navigate(['/drugs', id, 'edit']);
  }

  confirmDelete(drug: PharmacyDrug): void {
    this.selectedDrugId = drug.id;
    this.deleteModal.open();
  }

  deleteDrug(): void {
    if (!this.selectedDrugId) return;

    this.deleting = true;
    this.drugsService.deletePharmacyDrug(this.selectedDrugId).subscribe({
      next: (success) => {
        if (success) {
          this.loadDrugs();
          this.checkAlerts();
          this.deleteModal.close();
          this.selectedDrugId = null;
        }
        this.deleting = false;
      },
      error: () => {
        this.errorMessage = 'Failed to delete drug';
        this.deleting = false;
      }
    });
  }

  openImportModal(): void {
    this.selectedFile = null;
    this.importError = '';
    this.importSuccess = '';
    this.importModal.open();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension && ['csv', 'xlsx', 'xls'].includes(fileExtension)) {
        this.selectedFile = file;
        this.importError = '';
      } else {
        this.importError = 'Please select a valid CSV or Excel file';
        this.selectedFile = null;
      }
    }
  }

  handleImport(): void {
    if (!this.selectedFile) {
      this.importError = 'Please select a file to import';
      return;
    }

    this.importing = true;
    this.importError = '';
    this.importSuccess = '';

    // TODO: Implement actual CSV/Excel parsing and import logic
    // For now, this is a placeholder that simulates import
    setTimeout(() => {
      this.importing = false;
      this.importSuccess = `File "${this.selectedFile!.name}" uploaded successfully. Import functionality will process the file.`;

      // Clear file after a delay
      setTimeout(() => {
        this.selectedFile = null;
        this.importModal.close();
        this.loadDrugs(); // Refresh the list
      }, 2000);
    }, 1500);
  }

  getBadges(drug: PharmacyDrug): DrugBadge[] {
    const badges: DrugBadge[] = [];

    // Classification badge
    if (drug.classification) {
      const classificationLabel = drug.classification === 'medicinal'
        ? 'drug.classification.medicinal'
        : 'drug.classification.cosmetic';
      badges.push({
        label: classificationLabel,
        variant: drug.classification === 'medicinal' ? 'info' : 'default'
      });
    }

    // Origin badge
    if (drug.origin) {
      const originLabel = drug.origin === 'local'
        ? 'drug.origin.local'
        : 'drug.origin.imported';
      badges.push({
        label: originLabel,
        variant: drug.origin === 'local' ? 'success' : 'warning'
      });
    }

    // Low stock badge
    if (drug.stockQuantity <= drug.minimumStock) {
      badges.push({
        label: 'Low Stock',
        variant: 'warning'
      });
    }

    // Expiring soon badge
    if (drug.expiryDate) {
      const expiryDate = new Date(drug.expiryDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
        badges.push({
          label: 'Expiring Soon',
          variant: 'danger'
        });
      }
    }

    return badges;
  }

  toggleSelectionMode(): void {
    this.selectionMode = !this.selectionMode;
    if (!this.selectionMode) {
      this.selectedDrugIds.clear();
    }
  }

  onDrugSelectionToggle(drugId: string, selected: boolean): void {
    if (selected) {
      this.selectedDrugIds.add(drugId);
    } else {
      this.selectedDrugIds.delete(drugId);
    }
  }

  clearSelection(): void {
    this.selectedDrugIds.clear();
  }

  createInvoiceFromSelection(): void {
    if (this.selectedDrugIds.size === 0) return;

    // Get selected drugs
    const selectedDrugs = this.drugs.filter(drug => this.selectedDrugIds.has(drug.id));

    // Add all selected drugs to cart
    selectedDrugs.forEach(drug => {
      this.invoiceCartService.addDrug(drug);
    });

    // Clear selection and exit selection mode
    this.selectedDrugIds.clear();
    this.selectionMode = false;

    // Navigate to invoice form
    this.router.navigate(['/invoices/new']);
  }

  openRequestProductModal(): void {
    const productName = this.searchQuery.trim();
    this.requestProductForm.patchValue({
      productName: productName,
      notes: ''
    });
    this.requestProductModal.open();
  }

  submitProductRequest(): void {
    if (this.requestProductForm.valid) {
      this.requestingProduct = true;
      const { productName, notes } = this.requestProductForm.value;

      this.requestedProductsService.createRequest(productName, notes).subscribe({
        next: () => {
          this.requestingProduct = false;
          this.requestProductModal.close();
          this.requestProductForm.reset();
          // Get translated message
          const message = this.translationService.translate('requestedProduct.successMessage');
          this.toastService.success(message);
        },
        error: () => {
          this.requestingProduct = false;
          this.errorMessage = 'Failed to submit product request';
        }
      });
    } else {
      Object.keys(this.requestProductForm.controls).forEach(key => {
        this.requestProductForm.get(key)?.markAsTouched();
      });
    }
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }
}
