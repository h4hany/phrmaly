import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { PayrollRecord, SalaryRule, CommissionRule } from '../models/hr.model';
import { PaginatedResponse, PaginationParams } from '../models/common.model';
import { PharmacyContextService } from './pharmacy-context.service';
import { InvoicesService } from './invoices.service';

@Injectable({
  providedIn: 'root'
})
export class PayrollService {
  private pharmacyContextService = inject(PharmacyContextService);
  private invoicesService = inject(InvoicesService);

  private salaryRules: SalaryRule[] = [
    {
      id: 'SR001',
      pharmacyId: 'ph1',
      staffId: 'ST001',
      baseSalary: 5000,
      currency: 'USD',
      effectiveFrom: new Date('2024-01-01'),
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      createdBy: 'admin'
    },
    {
      id: 'SR002',
      pharmacyId: 'ph1',
      role: 'pharmacy_staff',
      baseSalary: 3000,
      currency: 'USD',
      effectiveFrom: new Date('2024-01-01'),
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      createdBy: 'admin'
    }
  ];

  private commissionRules: CommissionRule[] = [
    {
      id: 'CR001',
      pharmacyId: 'ph1',
      role: 'pharmacy_staff',
      type: 'percentage',
      value: 2, // 2% commission
      appliesTo: 'all_sales',
      effectiveFrom: new Date('2024-01-01'),
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      createdBy: 'admin'
    }
  ];

  private payrollRecords: PayrollRecord[] = [
    {
      id: 'PR001',
      pharmacyId: 'ph1',
      staffId: 'ST001',
      staffName: 'Sarah Johnson',
      period: {
        startDate: new Date('2024-11-01'),
        endDate: new Date('2024-11-30')
      },
      baseSalary: 5000,
      commission: 250,
      bonuses: 100,
      deductions: 0,
      totalEarnings: 5350,
      netPay: 5350,
      currency: 'USD',
      status: 'approved',
      paymentDate: new Date('2024-12-01'),
      paymentMethod: 'bank_transfer',
      breakdown: {
        baseSalary: 5000,
        commission: {
          total: 250,
          sales: 12500,
          items: [
            {
              invoiceId: 'INV001',
              invoiceNumber: 'SALES-2024-001',
              amount: 5000,
              commission: 100
            }
          ]
        },
        bonuses: [
          {
            id: 'B001',
            type: 'performance',
            amount: 100,
            reason: 'Outstanding performance'
          }
        ],
        deductions: []
      },
      createdAt: new Date('2024-11-30'),
      updatedAt: new Date('2024-12-01'),
      createdBy: 'system',
      approvedBy: 'admin',
      approvedAt: new Date('2024-12-01')
    }
  ];

  getPayrollRecords(params?: PaginationParams & { staffId?: string; status?: string }): Observable<PaginatedResponse<PayrollRecord>> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of({ data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }).pipe(delay(300));
    }

    let filtered = this.payrollRecords.filter(p => p.pharmacyId === pharmacyId);

    if (params?.staffId) {
      filtered = filtered.filter(p => p.staffId === params.staffId);
    }

    if (params?.status) {
      filtered = filtered.filter(p => p.status === params.status);
    }

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

  getSalaryRules(staffId?: string): Observable<SalaryRule[]> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of([]).pipe(delay(300));
    }

    let filtered = this.salaryRules.filter(r => r.pharmacyId === pharmacyId && r.isActive);

    if (staffId) {
      filtered = filtered.filter(r => r.staffId === staffId || (!r.staffId && !r.role));
    }

    return of(filtered).pipe(delay(300));
  }

  getCommissionRules(staffId?: string): Observable<CommissionRule[]> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of([]).pipe(delay(300));
    }

    let filtered = this.commissionRules.filter(r => r.pharmacyId === pharmacyId && r.isActive);

    if (staffId) {
      filtered = filtered.filter(r => r.staffId === staffId || (!r.staffId && !r.role));
    }

    return of(filtered).pipe(delay(300));
  }

  generatePayroll(staffId: string, startDate: Date, endDate: Date): Observable<PayrollRecord> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      throw new Error('No pharmacy selected');
    }

    // Get salary rule
    const salaryRule = this.salaryRules.find(r => 
      r.pharmacyId === pharmacyId && 
      (r.staffId === staffId || (!r.staffId && r.isActive))
    );

    const baseSalary = salaryRule?.baseSalary || 0;

    // Get commission rules
    const commissionRules = this.commissionRules.filter(r => 
      r.pharmacyId === pharmacyId && 
      (r.staffId === staffId || (!r.staffId && r.isActive))
    );

    // Calculate commission from invoices (mock - in real app, fetch from invoices service)
    let commission = 0;
    const commissionItems: any[] = [];

    // Mock commission calculation
    if (commissionRules.length > 0) {
      const rule = commissionRules[0];
      const mockSales = 12500;
      commission = (mockSales * rule.value) / 100;
      commissionItems.push({
        invoiceId: 'INV001',
        invoiceNumber: 'SALES-2024-001',
        amount: mockSales,
        commission: commission
      });
    }

    const payrollRecord: PayrollRecord = {
      id: `PR${Date.now()}`,
      pharmacyId,
      staffId,
      period: { startDate, endDate },
      baseSalary,
      commission,
      bonuses: 0,
      deductions: 0,
      totalEarnings: baseSalary + commission,
      netPay: baseSalary + commission,
      currency: 'USD',
      status: 'draft',
      breakdown: {
        baseSalary,
        commission: {
          total: commission,
          sales: 12500,
          items: commissionItems
        },
        bonuses: [],
        deductions: []
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    };

    this.payrollRecords.push(payrollRecord);
    return of(payrollRecord).pipe(delay(500));
  }

  approvePayroll(payrollId: string, approvedBy: string): Observable<boolean> {
    const payroll = this.payrollRecords.find(p => p.id === payrollId);
    if (!payroll) {
      return of(false).pipe(delay(300));
    }

    payroll.status = 'approved';
    payroll.approvedBy = approvedBy;
    payroll.approvedAt = new Date();
    payroll.updatedAt = new Date();

    return of(true).pipe(delay(500));
  }

  createSalaryRule(rule: Omit<SalaryRule, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Observable<SalaryRule> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      throw new Error('No pharmacy selected');
    }

    const newRule: SalaryRule = {
      ...rule,
      id: `SR${Date.now()}`,
      pharmacyId,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    };

    this.salaryRules.push(newRule);
    return of(newRule).pipe(delay(500));
  }

  createCommissionRule(rule: Omit<CommissionRule, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Observable<CommissionRule> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      throw new Error('No pharmacy selected');
    }

    const newRule: CommissionRule = {
      ...rule,
      id: `CR${Date.now()}`,
      pharmacyId,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    };

    this.commissionRules.push(newRule);
    return of(newRule).pipe(delay(500));
  }
}

