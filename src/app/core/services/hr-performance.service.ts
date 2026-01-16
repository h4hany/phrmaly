import { Injectable, inject } from '@angular/core';
import { Observable, of, delay, combineLatest, map } from 'rxjs';
import { PerformanceMetrics, StaffActivity } from '../models/hr.model';
import { PharmacyContextService } from './pharmacy-context.service';
import { InvoicesService } from './invoices.service';
import { AttendanceService } from './attendance.service';
import { MovementEngineService } from '../engines/movement-engine.service';
import { RiskLevel } from '../models/movement.model';

@Injectable({
  providedIn: 'root'
})
export class HRPerformanceService {
  private pharmacyContextService = inject(PharmacyContextService);
  private invoicesService = inject(InvoicesService);
  private attendanceService = inject(AttendanceService);
  private movementEngine = inject(MovementEngineService);

  private performanceMetrics: PerformanceMetrics[] = [
    {
      staffId: 'ST001',
      staffName: 'Sarah Johnson',
      pharmacyId: 'ph1',
      period: {
        startDate: new Date('2024-11-01'),
        endDate: new Date('2024-11-30')
      },
      sales: {
        totalRevenue: 45000,
        totalInvoices: 120,
        averageInvoiceValue: 375,
        growthPercentage: 15.5
      },
      errors: {
        invoiceEdits: 3,
        inventoryAdjustments: 1,
        auditFlags: 0,
        totalErrors: 4
      },
      attendance: {
        percentage: 98,
        lateArrivals: 1,
        absences: 0
      },
      inventory: {
        movements: 45,
        suspiciousMovements: 0,
        riskScore: 15
      },
      overallScore: 92,
      performanceGrade: 'A',
      riskLevel: 'low',
      riskScore: 15,
      trends: {
        sales: 'up',
        errors: 'stable',
        attendance: 'up'
      },
      lastUpdated: new Date()
    },
    {
      staffId: 'ST002',
      staffName: 'Michael Chen',
      pharmacyId: 'ph1',
      period: {
        startDate: new Date('2024-11-01'),
        endDate: new Date('2024-11-30')
      },
      sales: {
        totalRevenue: 32000,
        totalInvoices: 95,
        averageInvoiceValue: 337,
        growthPercentage: 8.2
      },
      errors: {
        invoiceEdits: 8,
        inventoryAdjustments: 3,
        auditFlags: 1,
        totalErrors: 12
      },
      attendance: {
        percentage: 85,
        lateArrivals: 5,
        absences: 2
      },
      inventory: {
        movements: 38,
        suspiciousMovements: 2,
        riskScore: 45
      },
      overallScore: 72,
      performanceGrade: 'C+',
      riskLevel: 'medium',
      riskScore: 45,
      trends: {
        sales: 'up',
        errors: 'up',
        attendance: 'down'
      },
      lastUpdated: new Date()
    }
  ];

  private activities: StaffActivity[] = [
    {
      id: 'ACT001',
      staffId: 'ST001',
      staffName: 'Sarah Johnson',
      pharmacyId: 'ph1',
      type: 'sale',
      entityType: 'Invoice',
      entityId: 'INV001',
      description: 'Created invoice SALES-2024-001 for $500',
      timestamp: new Date('2024-11-27T10:30:00'),
      metadata: { amount: 500 }
    },
    {
      id: 'ACT002',
      staffId: 'ST001',
      staffName: 'Sarah Johnson',
      pharmacyId: 'ph1',
      type: 'edit',
      entityType: 'Invoice',
      entityId: 'INV001',
      description: 'Updated invoice SALES-2024-001',
      timestamp: new Date('2024-11-27T10:35:00')
    }
  ];

  getPerformanceMetrics(staffId: string, startDate: Date, endDate: Date): Observable<PerformanceMetrics> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      throw new Error('No pharmacy selected');
    }

    // Check if we have cached metrics
    const cached = this.performanceMetrics.find(p => 
      p.pharmacyId === pharmacyId && 
      p.staffId === staffId &&
      p.period.startDate.getTime() === startDate.getTime() &&
      p.period.endDate.getTime() === endDate.getTime()
    );

    if (cached) {
      return of(cached).pipe(delay(300));
    }

    // Calculate metrics from various sources
    return combineLatest([
      this.invoicesService.getAll(),
      this.attendanceService.getAttendanceStats(staffId, startDate, endDate),
      this.movementEngine.getMovements({ staffId, startDate, endDate, page: 1, pageSize: 1000 })
    ]).pipe(
      map(([invoices, attendance, movements]) => {
        // Filter invoices for this staff and period
        const staffInvoices = invoices.data.filter(inv => {
          // In real app, invoices would have staffId
          // For now, we'll use mock data
          return true;
        });

        const totalRevenue = staffInvoices.reduce((sum, inv) => sum + inv.total, 0);
        const totalInvoices = staffInvoices.length;
        const averageInvoiceValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

        // Calculate risk score from movements
        const movementData = movements.data || [];
        const suspiciousMovements = movementData.filter(m => m.riskLevel === 'high' || m.riskLevel === 'critical').length;
        const riskScore = Math.min(100, (suspiciousMovements / Math.max(movementData.length, 1)) * 100);

        // Calculate overall score
        const salesScore = Math.min(100, (totalRevenue / 50000) * 100);
        const attendanceScore = attendance.attendancePercentage;
        const errorScore = Math.max(0, 100 - (12 * 5)); // Mock error calculation
        const riskScoreNormalized = 100 - riskScore;

        const overallScore = Math.round(
          (salesScore * 0.3) +
          (attendanceScore * 0.25) +
          (errorScore * 0.25) +
          (riskScoreNormalized * 0.2)
        );

        const performanceGrade = this.calculateGrade(overallScore);
        const riskLevel = this.calculateRiskLevel(riskScore);

        const metrics: PerformanceMetrics = {
          staffId,
          staffName: '',
          pharmacyId,
          period: { startDate, endDate },
          sales: {
            totalRevenue,
            totalInvoices,
            averageInvoiceValue,
            growthPercentage: 0 // Would calculate from previous period
          },
          errors: {
            invoiceEdits: 0, // Would calculate from audit logs
            inventoryAdjustments: 0,
            auditFlags: 0,
            totalErrors: 0
          },
          attendance: {
            percentage: attendance.attendancePercentage,
            lateArrivals: attendance.lateDays,
            absences: attendance.absentDays
          },
          inventory: {
            movements: movementData.length,
            suspiciousMovements,
            riskScore: Math.round(riskScore)
          },
          overallScore,
          performanceGrade,
          riskLevel,
          riskScore: Math.round(riskScore),
          trends: {
            sales: 'stable',
            errors: 'stable',
            attendance: 'stable'
          },
          lastUpdated: new Date()
        };

        // Cache the metrics
        this.performanceMetrics.push(metrics);
        return metrics;
      }),
      delay(500)
    );
  }

  getStaffActivities(staffId: string, limit: number = 50): Observable<StaffActivity[]> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of([]).pipe(delay(300));
    }

    const filtered = this.activities
      .filter(a => a.pharmacyId === pharmacyId && a.staffId === staffId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    return of(filtered).pipe(delay(300));
  }

  getPerformanceLeaderboard(startDate: Date, endDate: Date, limit: number = 10): Observable<PerformanceMetrics[]> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of([]).pipe(delay(300));
    }

    const filtered = this.performanceMetrics
      .filter(p => 
        p.pharmacyId === pharmacyId &&
        p.period.startDate.getTime() === startDate.getTime() &&
        p.period.endDate.getTime() === endDate.getTime()
      )
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, limit);

    return of(filtered).pipe(delay(500));
  }

  getRiskLeaderboard(startDate: Date, endDate: Date, limit: number = 10): Observable<PerformanceMetrics[]> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of([]).pipe(delay(300));
    }

    const filtered = this.performanceMetrics
      .filter(p => 
        p.pharmacyId === pharmacyId &&
        p.period.startDate.getTime() === startDate.getTime() &&
        p.period.endDate.getTime() === endDate.getTime()
      )
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, limit);

    return of(filtered).pipe(delay(500));
  }

  private calculateGrade(score: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
    if (score >= 97) return 'A+';
    if (score >= 93) return 'A';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'D';
    return 'F';
  }

  private calculateRiskLevel(score: number): RiskLevel {
    if (score >= 75) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 25) return 'medium';
    return 'low';
  }
}

