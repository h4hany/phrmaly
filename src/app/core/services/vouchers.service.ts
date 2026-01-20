import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Voucher } from '../models/voucher.model';
import { ApiService, ApiResponse } from './api.service';
import { PharmacyContextService } from './pharmacy-context.service';
import { Patient } from '../models/patient.model';
import { Pharmacy } from '../models/user.model';

export interface VoucherListItem {
  id: string;
  voucherCode: string;
  voucherName: string;
  patientId: string;
  patientName: string;
  pharmacyId: string;
  pharmacyName: string;
  amount: number;
  createdAt: Date;
  validUntil: Date;
  status: 'active' | 'expired' | 'used';
}

@Injectable({
  providedIn: 'root'
})
export class VouchersService {
  private apiService = inject(ApiService);
  private pharmacyContextService = inject(PharmacyContextService);

  // Mock data storage
  private mockVouchers: Voucher[] = this.initializeMockVouchers();

  private initializeMockVouchers(): Voucher[] {
    const pharmacy: Pharmacy = {
      id: 'ph1',
      name: 'Main Pharmacy',
      address: '123 Main St',
      phone: '+1234567890',
      email: 'main@pharmly.com',
      primaryColor: '#166534',
      secondaryColor: '#22c55e',
      sidebarColor: '#14532d',
      rtlEnabled: false
    };

    const patients: Patient[] = [
      {
        id: 'PAT001',
        fullName: 'John Smith',
        dateOfBirth: new Date('1985-05-15'),
        gender: 'male',
        phone: '+201116811410',
        email: 'john.smith@example.com',
        address: {
          city: 'New York',
          area: 'Manhattan',
          street: '123 Main St',
          notes: 'Apartment 4B'
        },
        occupation: 'Engineer',
        medicalNotes: 'Allergic to penicillin',
        cardId: 'PC-2024-001234',
        validUntil: new Date('2025-12-31'),
        issuedDate: new Date('2024-01-15'),
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-11-27')
      },
      {
        id: 'PAT002',
        fullName: 'Jane Doe',
        dateOfBirth: new Date('1990-08-22'),
        gender: 'female',
        phone: '+201116811410',
        email: 'jane.doe@example.com',
        address: {
          city: 'Los Angeles',
          area: 'Beverly Hills',
          street: '456 Oak Ave',
          notes: ''
        },
        occupation: 'Teacher',
        medicalNotes: '',
        cardId: 'PC-2024-001235',
        validUntil: new Date('2025-11-30'),
        issuedDate: new Date('2024-02-10'),
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-11-26')
      },
      {
        id: 'PAT003',
        fullName: 'Michael Johnson',
        dateOfBirth: new Date('1978-12-03'),
        gender: 'male',
        phone: '+201116811410',
        email: 'michael.j@example.com',
        address: {
          city: 'Chicago',
          area: 'Downtown',
          street: '789 Pine Rd',
          notes: ''
        },
        occupation: 'Doctor',
        medicalNotes: 'Diabetes Type 2',
        cardId: 'PC-2024-001236',
        validUntil: new Date('2026-03-20'),
        issuedDate: new Date('2024-03-20'),
        createdAt: new Date('2024-03-20'),
        updatedAt: new Date('2024-11-25')
      }
    ];

    const now = new Date();
    const threeMonthsLater = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const sixMonthsLater = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    return [
      {
        voucherName: 'PAT001-Main Pharmacy-VCH001',
        voucherCode: 'VCH001',
        createdAt: new Date('2024-11-01'),
        validUntil: threeMonthsLater,
        amount: 150.00,
        patient: patients[0],
        pharmacy: pharmacy
      },
      {
        voucherName: 'PAT001-Main Pharmacy-VCH002',
        voucherCode: 'VCH002',
        createdAt: new Date('2024-11-15'),
        validUntil: sixMonthsLater,
        amount: 250.50,
        patient: patients[0],
        pharmacy: pharmacy
      },
      {
        voucherName: 'PAT002-Main Pharmacy-VCH003',
        voucherCode: 'VCH003',
        createdAt: new Date('2024-10-20'),
        validUntil: threeMonthsLater,
        amount: 75.25,
        patient: patients[1],
        pharmacy: pharmacy
      },
      {
        voucherName: 'PAT002-Main Pharmacy-VCH004',
        voucherCode: 'VCH004',
        createdAt: new Date('2024-11-20'),
        validUntil: threeMonthsLater,
        amount: 300.00,
        patient: patients[1],
        pharmacy: pharmacy
      },
      {
        voucherName: 'PAT003-Main Pharmacy-VCH005',
        voucherCode: 'VCH005',
        createdAt: new Date('2024-09-10'),
        validUntil: oneMonthAgo, // Expired voucher
        amount: 100.00,
        patient: patients[2],
        pharmacy: pharmacy
      },
      {
        voucherName: 'PAT003-Main Pharmacy-VCH006',
        voucherCode: 'VCH006',
        createdAt: new Date('2024-11-25'),
        validUntil: threeMonthsLater,
        amount: 500.75,
        patient: patients[2],
        pharmacy: pharmacy
      },
      {
        voucherName: 'PAT001-Main Pharmacy-VCH007',
        voucherCode: 'VCH007',
        createdAt: new Date('2024-08-15'),
        validUntil: twoMonthsAgo, // Expired voucher
        amount: 200.00,
        patient: patients[0],
        pharmacy: pharmacy
      },
      {
        voucherName: 'PAT002-Main Pharmacy-VCH008',
        voucherCode: 'VCH008',
        createdAt: new Date('2024-11-28'),
        validUntil: threeMonthsLater,
        amount: 125.50,
        patient: patients[1],
        pharmacy: pharmacy
      }
    ];
  }

  getAll(params?: { page?: number; pageSize?: number; patientId?: string }): Observable<ApiResponse<VoucherListItem[]>> {
    const pharmacy = this.pharmacyContextService.getCurrentPharmacy();
    let filtered = this.mockVouchers
      .filter(v => !pharmacy || v.pharmacy.id === pharmacy.id)
      .map(v => this.mapToListItem(v));

    if (params?.patientId) {
      filtered = filtered.filter(v => v.patientId === params.patientId);
    }

    // In real app: return this.apiService.get<ApiResponse<VoucherListItem[]>>('/vouchers', params);
    return of({
      data: filtered,
      message: 'Vouchers retrieved successfully'
    }).pipe(delay(300));
  }

  getById(id: string): Observable<Voucher | null> {
    const voucher = this.mockVouchers.find(v => v.voucherCode === id || v.voucherName === id);
    // In real app: return this.apiService.get<Voucher>(`/vouchers/${id}`);
    return of(voucher || null).pipe(delay(200));
  }

  getByPatientId(patientId: string): Observable<Voucher[]> {
    const pharmacy = this.pharmacyContextService.getCurrentPharmacy();
    const filtered = this.mockVouchers.filter(v => 
      v.patient.id === patientId && 
      (!pharmacy || v.pharmacy.id === pharmacy.id)
    );
    // In real app: return this.apiService.get<Voucher[]>(`/vouchers/patient/${patientId}`);
    return of(filtered).pipe(delay(200));
  }

  create(voucher: Omit<Voucher, 'createdAt' | 'validUntil'>): Observable<Voucher> {
    const newVoucher: Voucher = {
      ...voucher,
      createdAt: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 3 months
    };
    this.mockVouchers.push(newVoucher);
    // In real app: return this.apiService.post<Voucher>('/vouchers', newVoucher);
    return of(newVoucher).pipe(delay(300));
  }

  update(id: string, voucher: Partial<Voucher>): Observable<Voucher> {
    const index = this.mockVouchers.findIndex(v => v.voucherCode === id || v.voucherName === id);
    if (index === -1) {
      throw new Error('Voucher not found');
    }
    this.mockVouchers[index] = {
      ...this.mockVouchers[index],
      ...voucher,
      voucherCode: this.mockVouchers[index].voucherCode,
      voucherName: this.mockVouchers[index].voucherName
    };
    // In real app: return this.apiService.put<Voucher>(`/vouchers/${id}`, voucher);
    return of(this.mockVouchers[index]).pipe(delay(300));
  }

  delete(id: string): Observable<boolean> {
    const index = this.mockVouchers.findIndex(v => v.voucherCode === id || v.voucherName === id);
    if (index === -1) {
      return of(false).pipe(delay(200));
    }
    this.mockVouchers.splice(index, 1);
    // In real app: return this.apiService.delete<boolean>(`/vouchers/${id}`);
    return of(true).pipe(delay(300));
  }

  private mapToListItem(voucher: Voucher): VoucherListItem {
    const now = new Date();
    let status: 'active' | 'expired' | 'used' = 'active';
    if (voucher.validUntil < now) {
      status = 'expired';
    }

    return {
      id: voucher.voucherCode,
      voucherCode: voucher.voucherCode,
      voucherName: voucher.voucherName,
      patientId: voucher.patient.id,
      patientName: voucher.patient.fullName,
      pharmacyId: voucher.pharmacy.id,
      pharmacyName: voucher.pharmacy.name,
      amount: voucher.amount,
      createdAt: voucher.createdAt,
      validUntil: voucher.validUntil,
      status
    };
  }
}

