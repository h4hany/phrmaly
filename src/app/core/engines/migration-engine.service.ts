import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { PharmacyContextService } from '../services/pharmacy-context.service';

export interface MigrationJob {
  id: string;
  pharmacyId: string;
  fileName: string;
  status: 'uploading' | 'mapping' | 'preview' | 'importing' | 'completed' | 'failed';
  totalRows: number;
  processedRows: number;
  errors: string[];
  createdAt: Date;
  completedAt?: Date;
}

export interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  required: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MigrationEngineService {
  private pharmacyContextService = inject(PharmacyContextService);

  uploadFile(file: File): Observable<MigrationJob> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      throw new Error('No pharmacy context');
    }

    const job: MigrationJob = {
      id: `MIG${Date.now()}`,
      pharmacyId,
      fileName: file.name,
      status: 'uploading',
      totalRows: 0,
      processedRows: 0,
      errors: [],
      createdAt: new Date()
    };

    // Simulate file processing
    return of(job).pipe(delay(1000));
  }

  mapColumns(jobId: string, mappings: ColumnMapping[]): Observable<MigrationJob> {
    // Mock implementation
    const job: MigrationJob = {
      id: jobId,
      pharmacyId: 'ph1',
      fileName: 'data.csv',
      status: 'mapping',
      totalRows: 100,
      processedRows: 0,
      errors: [],
      createdAt: new Date()
    };

    return of(job).pipe(delay(500));
  }

  previewImport(jobId: string): Observable<{ valid: number; invalid: number; preview: any[] }> {
    return of({
      valid: 95,
      invalid: 5,
      preview: []
    }).pipe(delay(500));
  }

  executeImport(jobId: string): Observable<MigrationJob> {
    const job: MigrationJob = {
      id: jobId,
      pharmacyId: 'ph1',
      fileName: 'data.csv',
      status: 'completed',
      totalRows: 100,
      processedRows: 95,
      errors: ['Row 5: Invalid date format', 'Row 12: Missing required field'],
      createdAt: new Date(),
      completedAt: new Date()
    };

    return of(job).pipe(delay(2000));
  }
}



