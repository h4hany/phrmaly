import { Directive, ElementRef, HostListener, Output, EventEmitter } from '@angular/core';
import { BarcodeService } from '../services/barcode.service';

@Directive({
  selector: '[appBarcodeScanner]',
  standalone: true
})
export class BarcodeScannerDirective {
  @Output() barcodeScanned = new EventEmitter<string>();

  private barcodeBuffer = '';
  private bufferTimeout: any;

  constructor(
    private el: ElementRef,
    private barcodeService: BarcodeService
  ) {
    // Subscribe to global barcode service
    this.barcodeService.barcode$.subscribe(barcode => {
      if (this.isElementFocused()) {
        this.barcodeScanned.emit(barcode);
      }
    });
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Allow manual input, but also detect barcode scanner patterns
    // Barcode scanners typically send characters very quickly
    if (event.key && event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
      if (this.bufferTimeout) {
        clearTimeout(this.bufferTimeout);
      }

      this.barcodeBuffer += event.key;

      // Clear buffer after delay (normal typing)
      this.bufferTimeout = setTimeout(() => {
        this.barcodeBuffer = '';
      }, 200);
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const pastedText = event.clipboardData?.getData('text') || '';
    if (pastedText.length >= 6 && /^\d+$/.test(pastedText)) {
      // Likely a barcode (numeric, 6+ digits)
      event.preventDefault();
      this.barcodeScanned.emit(pastedText.trim());
    }
  }

  private isElementFocused(): boolean {
    return document.activeElement === this.el.nativeElement ||
           this.el.nativeElement.contains(document.activeElement);
  }
}







