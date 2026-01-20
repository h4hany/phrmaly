import { Component, Input, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { Voucher } from '../../../core/models/voucher.model';
import * as QRCode from 'qrcode';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-voucher-card',
  standalone: true,
  imports: [CommonModule, DatePipe, TranslatePipe],
  template: `
    <div #cardElement class="voucher-card" [style.width.px]="500">
      <div class="accent-border"></div>

      <!-- Top Wrapper (dark background shows through bottom curve) -->
      <div class="top-wrap">
        <!-- Top White Section with Info -->
        <div class="content-section">
          <!-- Logo Header -->
          <div class="logo-header">
            <div class="logo-wellnest">
              <h1>{{ voucher.pharmacy.name.toUpperCase() }}</h1>
              <p>{{ 'invoice.voucher.pharmacyCard' | translate }}</p>
            </div>
            <div class="logo-apple">{{ voucher.voucherCode }}</div>
          </div>

          <!-- Banner -->
          <div class="banner-text">
            <h2>{{ 'invoice.voucher.exclusiveOffer' | translate }}</h2>
            <p>{{ 'invoice.voucher.cardDescription' | translate }}</p>
          </div>

          <!-- Discount Badge -->
          <div class="discount-badge">
            <h3>{{ averageDiscountPercentage.toFixed(0) }}%</h3>
            <p>{{ 'invoice.voucher.discount' | translate }}</p>
          </div>

          <!-- Info Grid -->
          <div class="info-grid">
            <div class="info-item">
              <label>{{ 'patient.fullName' | translate }}</label>
              <span>{{ voucher.patient.fullName }}</span>
            </div>
            <div class="info-item">
              <label>{{ 'invoice.voucher.issueDate' | translate }}</label>
              <span>{{ voucher.createdAt | date:'dd/MM/yyyy - HH:mm' }}</span>
            </div>
            <div class="info-item">
              <label>{{ 'invoice.voucher.validUntil' | translate }}</label>
              <span>{{ voucher.validUntil | date:'dd/MM/yyyy - HH:mm' }}</span>
            </div>
            <div class="info-item">
              <label>{{ 'invoice.voucher.amount' | translate }}</label>
              <span>{{ voucher.amount | number:'1.2-2' }} EGP</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Wrapper (white background shows through top curve) -->
      <div class="bottom-wrap">
        <!-- Bottom Dark Section with QR -->
        <div class="qr-section">
          <!-- QR Code -->
          <div class="qr-container">
            <div class="qr-icon">
              <div class="qr-corners"></div>
              <canvas #qrCanvas class="qr-code-canvas"></canvas>
            </div>
            <div class="qr-label">{{ voucher.voucherCode }}</div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>{{ 'invoice.voucher.termsApply' | translate }}</p>
      </div>

      <!-- Copy Button -->
      <div class="copy-button-container" [class.hidden]="isCapturing">
        <button
          type="button"
          (click)="copyCardAsImage()"
          [disabled]="copying"
          class="copy-button"
          [title]="'invoice.voucher.copyCard' | translate"
        >
          @if (copying) {
            <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ 'invoice.voucher.copying' | translate }}
          } @else {
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {{ 'invoice.voucher.copyCard' | translate }}
          }
        </button>
      </div>
    </div>
  `,
  styles: [`
    .voucher-card {
      background: white;
      border-radius: 30px;
      box-shadow: 0 20px 60px rgba(0, 48, 50, 0.2);
      overflow: hidden;
      position: relative;
    }

    .accent-border {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 5px;
      background: linear-gradient(90deg, var(--sidebar-active-bg) 0%, var(--sidebar-bg) 50%, var(--sidebar-active-bg) 100%);
      z-index: 10;
    }

    .top-wrap {
      background: var(--sidebar-bg);
    }

    .bottom-wrap {
      background: white;
    }

    .content-section {
      background: white;
      padding: 50px 40px 30px 40px;
      position: relative;
      border-bottom-left-radius: 120px;
    }

    .logo-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
    }

    .logo-wellnest h1 {
      font-size: 28px;
      font-weight: 900;
      color: var(--sidebar-bg);
      letter-spacing: -0.5px;
      margin: 0;
    }

    .logo-wellnest p {
      font-size: 9px;
      color: var(--sidebar-bg);
      opacity: 0.7;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
      margin-top: 2px;
      margin: 0;
    }

    .logo-apple {
      font-size: 24px;
      font-weight: 800;
      color: var(--sidebar-bg);
      letter-spacing: 0.5px;
    }

    .banner-text {
      text-align: center;
      margin-bottom: 30px;
    }

    .banner-text h2 {
      font-size: 16px;
      font-weight: 800;
      color: var(--sidebar-bg);
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 8px;
      margin: 0 0 8px 0;
    }

    .banner-text p {
      font-size: 12px;
      color: var(--sidebar-bg);
      opacity: 0.6;
      line-height: 1.6;
      margin: 0;
    }

    .discount-badge {
      background: linear-gradient(135deg, var(--sidebar-active-bg) 0%, #b8d959 100%);
      border-radius: 20px;
      padding: 20px;
      text-align: center;
      margin-bottom: 25px;
      box-shadow: 0 8px 25px rgba(217, 242, 117, 0.3);
    }

    .discount-badge h3 {
      font-size: 52px;
      font-weight: 900;
      color: var(--sidebar-active-text);
      line-height: 1;
      margin-bottom: 5px;
      margin: 0 0 5px 0;
    }

    .discount-badge p {
      font-size: 18px;
      font-weight: 800;
      color: var(--sidebar-active-text);
      letter-spacing: 1px;
      margin: 0;
    }

    .info-grid {
      display: grid;
      gap: 12px;
    }

    .info-item {
      background: var(--sidebar-text);
      border-radius: 12px;
      padding: 12px 16px;
      display: grid;
      grid-template-columns: 130px 1fr;
      gap: 10px;
      align-items: center;
    }

    .info-item label {
      font-size: 10px;
      font-weight: 700;
      color: var(--sidebar-bg);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.7;
    }

    .info-item span {
      font-size: 13px;
      font-weight: 700;
      color: var(--sidebar-bg);
    }

    .qr-section {
      background: var(--sidebar-bg);
      padding: 60px 40px 40px 40px;
      text-align: center;
      border-top-right-radius: 120px;
    }

    .qr-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    .qr-icon {
      width: 180px;
      height: 180px;
      background: white;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      position: relative;
    }

    .qr-code-canvas {
      width: 150px;
      height: 150px;
    }

    .qr-corners {
      position: absolute;
      inset: 12px;
      border: 3px solid var(--sidebar-bg);
      border-radius: 12px;
      pointer-events: none;
    }

    .qr-corners::before,
    .qr-corners::after {
      content: '';
      position: absolute;
      width: 25px;
      height: 25px;
      border: 4px solid var(--sidebar-bg);
    }

    .qr-corners::before {
      top: -3px;
      left: -3px;
      border-right: none;
      border-bottom: none;
      border-radius: 8px 0 0 0;
    }

    .qr-corners::after {
      bottom: -3px;
      right: -3px;
      border-left: none;
      border-top: none;
      border-radius: 0 0 8px 0;
    }

    .qr-label {
      color: var(--sidebar-text);
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .footer {
      background: var(--sidebar-bg);
      padding: 0 40px 20px 40px;
      text-align: center;
    }

    .footer p {
      font-size: 11px;
      font-weight: 700;
      color: var(--sidebar-active-bg);
      letter-spacing: 1px;
      margin: 0;
    }

    .copy-button-container {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 20;
    }

    .copy-button-container.hidden {
      display: none;
    }

    .copy-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: var(--sidebar-active-bg);
      color: var(--sidebar-active-text);
      border: none;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .copy-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .copy-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media print {
      .voucher-card {
        box-shadow: none;
      }
      .copy-button-container {
        display: none;
      }
    }
  `]
})
export class VoucherCardComponent implements AfterViewInit {
  @ViewChild('cardElement', { static: false }) cardElement!: ElementRef<HTMLDivElement>;
  @ViewChild('qrCanvas', { static: false }) qrCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() voucher!: Voucher;
  @Input() averageDiscountPercentage = 0;
  @Output() onCardReady = new EventEmitter<ElementRef<HTMLDivElement>>();
  @Output() onCardCopied = new EventEmitter<Blob>();
  
  copying = false;
  isCapturing = false;

  ngAfterViewInit(): void {
    if (this.qrCanvas && this.voucher) {
      this.generateQRCode();
    }
    if (this.cardElement) {
      this.onCardReady.emit(this.cardElement);
    }
  }

  private generateQRCode(): void {
    if (!this.qrCanvas?.nativeElement || !this.voucher) {
      return;
    }

    const canvas = this.qrCanvas.nativeElement;
    const qrData = JSON.stringify({
      voucherCode: this.voucher.voucherCode,
      voucherName: this.voucher.voucherName,
      patientId: this.voucher.patient.id,
      patientName: this.voucher.patient.fullName,
      pharmacyId: this.voucher.pharmacy.id,
      pharmacyName: this.voucher.pharmacy.name,
      amount: this.voucher.amount,
      createdAt: this.voucher.createdAt.toISOString(),
      validUntil: this.voucher.validUntil.toISOString()
    });

    QRCode.toCanvas(canvas, qrData, {
      width: 150,
      margin: 2,
      color: {
        dark: '#003032',
        light: '#FFFFFF'
      }
    }, (error) => {
      if (error) {
        console.error('Error generating QR code:', error);
      }
    });
  }

  copyCardAsImage(): void {
    if (!this.cardElement?.nativeElement || this.copying) {
      return;
    }

    this.copying = true;
    this.isCapturing = true; // Hide the button before capture
    const cardElement = this.cardElement.nativeElement;

    // Small delay to ensure the button is hidden before capture
    setTimeout(() => {
      html2canvas(cardElement, {
        backgroundColor: '#ffffff',
        scale: 1.5, // Reduced from 2 for faster rendering
        logging: false,
        useCORS: true,
        allowTaint: false,
        removeContainer: true,
        imageTimeout: 0,
        onclone: (clonedDoc: Document) => {
          // Hide any buttons in the cloned document
          const buttons = clonedDoc.querySelectorAll('.copy-button-container');
          buttons.forEach(btn => (btn as HTMLElement).style.display = 'none');
        }
      }).then((canvas: HTMLCanvasElement) => {
        this.isCapturing = false; // Show the button again after capture
        canvas.toBlob((blob: Blob | null) => {
          this.copying = false;
          if (!blob) {
            console.error('Failed to generate card image');
            return;
          }

          const item = new ClipboardItem({ 'image/png': blob });
          navigator.clipboard.write([item]).then(() => {
            this.onCardCopied.emit(blob);
          }).catch((error) => {
            console.error('Failed to copy to clipboard:', error);
            // Fallback: download the image
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `voucher-${this.voucher.voucherCode}.png`;
            a.click();
            URL.revokeObjectURL(url);
          });
        }, 'image/png');
      }).catch((error) => {
        console.error('Failed to capture card:', error);
        this.copying = false;
        this.isCapturing = false; // Make sure to show button again on error
      });
    }, 50); // Small delay to ensure DOM update
  }
}

