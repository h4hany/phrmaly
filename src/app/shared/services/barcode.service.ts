import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BarcodeService {
  private barcodeSubject = new Subject<string>();
  public barcode$ = this.barcodeSubject.asObservable();

  private barcodeBuffer = '';
  private bufferTimeout: any;

  constructor() {
    this.initializeBarcodeReader();
  }

  private initializeBarcodeReader(): void {
    document.addEventListener('keypress', (event: KeyboardEvent) => {
      // Check if barcode scanner is active (usually very fast keypresses)
      if (event.key && event.key.length === 1) {
        this.handleBarcodeInput(event.key);
      }
    });
  }

  private handleBarcodeInput(char: string): void {
    // Clear buffer after a delay (barcode scanners input very fast)
    if (this.bufferTimeout) {
      clearTimeout(this.bufferTimeout);
    }

    this.barcodeBuffer += char;

    // If Enter key or newline, process the barcode
    if (char === '\n' || char === '\r') {
      this.processBarcode(this.barcodeBuffer.trim());
      this.barcodeBuffer = '';
    } else {
      // Set timeout to process barcode if no more input (for scanners that don't send Enter)
      this.bufferTimeout = setTimeout(() => {
        if (this.barcodeBuffer.length >= 6) { // Minimum barcode length
          this.processBarcode(this.barcodeBuffer.trim());
        }
        this.barcodeBuffer = '';
      }, 100);
    }
  }

  private processBarcode(barcode: string): void {
    if (barcode.length >= 6) { // PLU codes are 6-8 digits
      this.barcodeSubject.next(barcode);
    }
  }

  // Manual barcode input (for testing or manual entry)
  scanBarcode(barcode: string): void {
    if (barcode && barcode.length >= 6) {
      this.barcodeSubject.next(barcode);
    }
  }
}









