import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { TransferRequest, TransferShipment, TransferVariance, TransferItem, TransferStatus } from '../models/transfer.model';
import { PaginatedResponse, PaginationParams } from '../models/common.model';
import { PharmacyContextService } from '../services/pharmacy-context.service';
import { EventBusService } from './event-bus.service';

@Injectable({
  providedIn: 'root'
})
export class TransferEngineService {
  private pharmacyContextService = inject(PharmacyContextService);
  private eventBus = inject(EventBusService);

  private transfers: TransferRequest[] = [
    {
      id: 'TRF001',
      pharmacyId: 'ph1',
      fromBranchId: 'branch1',
      fromBranchName: 'Main Branch',
      toBranchId: 'branch2',
      toBranchName: 'North Branch',
      items: [
        { drugId: 'PDRG001', drugName: 'Paracetamol 500mg', requestedQuantity: 50, approvedQuantity: 50 },
        { drugId: 'PDRG002', drugName: 'Ibuprofen 200mg', requestedQuantity: 30, approvedQuantity: 30 }
      ],
      status: 'approved',
      requestedBy: 'staff1',
      requestedByName: 'John Doe',
      approvedBy: 'manager1',
      approvedByName: 'Manager',
      createdAt: new Date('2024-11-25'),
      updatedAt: new Date('2024-11-26'),
      createdBy: 'staff1'
    }
  ];

  getTransfers(params?: PaginationParams): Observable<PaginatedResponse<TransferRequest>> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of({ data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }).pipe(delay(300));
    }

    const filtered = this.transfers.filter(t => t.pharmacyId === pharmacyId);
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginated = filtered.slice(start, end);

    return of({
      data: paginated,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize)
    }).pipe(delay(500));
  }

  getTransferById(id: string): Observable<TransferRequest | null> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of(null).pipe(delay(300));
    }

    const transfer = this.transfers.find(t => t.id === id && t.pharmacyId === pharmacyId);
    return of(transfer || null).pipe(delay(300));
  }

  createTransfer(transfer: Omit<TransferRequest, 'id' | 'createdAt' | 'updatedAt' | 'pharmacyId' | 'status'>): Observable<TransferRequest> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      throw new Error('No pharmacy context');
    }

    const newTransfer: TransferRequest = {
      ...transfer,
      id: `TRF${String(this.transfers.length + 1).padStart(3, '0')}`,
      pharmacyId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.transfers.push(newTransfer);

    this.eventBus.emit({
      type: 'transfer_created',
      payload: newTransfer,
      source: 'transfer-engine'
    });

    return of(newTransfer).pipe(delay(500));
  }

  updateTransferStatus(id: string, status: TransferStatus, approvedBy?: string): Observable<TransferRequest> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      throw new Error('No pharmacy context');
    }

    const index = this.transfers.findIndex(t => t.id === id && t.pharmacyId === pharmacyId);
    if (index === -1) {
      throw new Error('Transfer not found');
    }

    this.transfers[index] = {
      ...this.transfers[index],
      status,
      approvedBy: approvedBy || this.transfers[index].approvedBy,
      updatedAt: new Date()
    };

    return of(this.transfers[index]).pipe(delay(500));
  }
}

