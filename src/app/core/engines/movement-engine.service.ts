import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { DrugMovement, MovementFilter, StaffRiskScore, MovementType, RiskLevel } from '../models/movement.model';
import { PaginatedResponse, PaginationParams } from '../models/common.model';
import { PharmacyContextService } from '../services/pharmacy-context.service';
import { EventBusService } from './event-bus.service';

@Injectable({
  providedIn: 'root'
})
export class MovementEngineService {
  private pharmacyContextService = inject(PharmacyContextService);
  private eventBus = inject(EventBusService);

  private movements: DrugMovement[] = [
    {
      id: 'MOV001',
      pharmacyId: 'ph1',
      drugId: 'PDRG001',
      drugName: 'Paracetamol 500mg',
      movementType: 'sale',
      quantity: -5,
      previousQuantity: 150,
      newQuantity: 145,
      unitCost: 3.50,
      staffId: 'staff1',
      staffName: 'John Doe',
      riskLevel: 'low',
      riskScore: 15,
      timestamp: new Date('2024-11-27T10:30:00'),
      createdAt: new Date('2024-11-27T10:30:00'),
      createdBy: 'staff1'
    },
    {
      id: 'MOV002',
      pharmacyId: 'ph1',
      drugId: 'PDRG003',
      drugName: 'Amoxicillin 250mg',
      movementType: 'adjustment',
      quantity: -17,
      previousQuantity: 25,
      newQuantity: 8,
      unitCost: 8.00,
      staffId: 'staff2',
      staffName: 'Jane Smith',
      reason: 'Inventory correction',
      riskLevel: 'high',
      riskScore: 75,
      variance: -17,
      timestamp: new Date('2024-11-27T09:15:00'),
      createdAt: new Date('2024-11-27T09:15:00'),
      createdBy: 'staff2'
    },
    {
      id: 'MOV003',
      pharmacyId: 'ph1',
      drugId: 'PDRG002',
      drugName: 'Ibuprofen 200mg',
      movementType: 'purchase',
      quantity: 50,
      previousQuantity: 100,
      newQuantity: 150,
      unitCost: 5.00,
      staffId: 'staff1',
      staffName: 'John Doe',
      riskLevel: 'low',
      riskScore: 10,
      timestamp: new Date('2024-11-26T14:20:00'),
      createdAt: new Date('2024-11-26T14:20:00'),
      createdBy: 'staff1'
    }
  ];

  getMovements(params?: PaginationParams & MovementFilter): Observable<PaginatedResponse<DrugMovement>> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of({ data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }).pipe(delay(300));
    }

    let filtered = this.movements.filter(m => m.pharmacyId === pharmacyId);

    // Apply filters
    if (params?.drugId) {
      filtered = filtered.filter(m => m.drugId === params.drugId);
    }
    if (params?.staffId) {
      filtered = filtered.filter(m => m.staffId === params.staffId);
    }
    if (params?.movementType) {
      filtered = filtered.filter(m => m.movementType === params.movementType);
    }
    if (params?.riskLevel) {
      filtered = filtered.filter(m => m.riskLevel === params.riskLevel);
    }
    if (params?.startDate) {
      filtered = filtered.filter(m => m.timestamp >= params.startDate!);
    }
    if (params?.endDate) {
      filtered = filtered.filter(m => m.timestamp <= params.endDate!);
    }

    // Pagination
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

  getMovementById(id: string): Observable<DrugMovement | null> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of(null).pipe(delay(300));
    }

    const movement = this.movements.find(m => m.id === id && m.pharmacyId === pharmacyId);
    return of(movement || null).pipe(delay(300));
  }

  recordMovement(movement: Omit<DrugMovement, 'id' | 'timestamp' | 'createdAt' | 'pharmacyId'>): Observable<DrugMovement> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      throw new Error('No pharmacy context');
    }

    // Calculate risk score
    const riskScore = this.calculateRiskScore(movement);
    const riskLevel = this.getRiskLevel(riskScore);

    const newMovement: DrugMovement = {
      ...movement,
      id: `MOV${String(this.movements.length + 1).padStart(3, '0')}`,
      pharmacyId,
      riskScore,
      riskLevel,
      timestamp: new Date(),
      createdAt: new Date()
    };

    this.movements.push(newMovement);

    // Emit event
    this.eventBus.emit({
      type: 'drug_movement',
      payload: newMovement,
      source: 'movement-engine'
    });

    return of(newMovement).pipe(delay(500));
  }

  getStaffRiskScores(): Observable<StaffRiskScore[]> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of([]).pipe(delay(300));
    }

    const pharmacyMovements = this.movements.filter(m => m.pharmacyId === pharmacyId);
    const staffMap = new Map<string, StaffRiskScore>();

    pharmacyMovements.forEach(movement => {
      if (!staffMap.has(movement.staffId)) {
        staffMap.set(movement.staffId, {
          staffId: movement.staffId,
          staffName: movement.staffName || 'Unknown',
          pharmacyId,
          totalMovements: 0,
          suspiciousMovements: 0,
          riskScore: 0,
          riskLevel: 'low'
        });
      }

      const score = staffMap.get(movement.staffId)!;
      score.totalMovements++;
      if (movement.riskLevel === 'high' || movement.riskLevel === 'critical') {
        score.suspiciousMovements++;
      }
      score.riskScore += movement.riskScore;
      if (!score.lastMovementDate || movement.timestamp > score.lastMovementDate) {
        score.lastMovementDate = movement.timestamp;
      }
    });

    // Calculate average risk score and level
    const scores = Array.from(staffMap.values()).map(score => {
      score.riskScore = score.totalMovements > 0 ? score.riskScore / score.totalMovements : 0;
      score.riskLevel = this.getRiskLevel(score.riskScore);
      return score;
    });

    return of(scores).pipe(delay(300));
  }

  private calculateRiskScore(movement: Omit<DrugMovement, 'id' | 'timestamp' | 'createdAt' | 'pharmacyId' | 'riskScore' | 'riskLevel'>): number {
    let score = 0;

    // Large quantity changes
    if (Math.abs(movement.quantity) > 50) score += 20;
    if (Math.abs(movement.quantity) > 100) score += 30;

    // Negative adjustments (losses)
    if (movement.movementType === 'adjustment' && movement.quantity < 0) {
      score += 40;
    }

    // Variance detection
    if (movement.variance && Math.abs(movement.variance) > 10) {
      score += 30;
    }

    // Theft-related types
    if (movement.movementType === 'theft') {
      score += 100;
    }

    return Math.min(score, 100);
  }

  private getRiskLevel(score: number): RiskLevel {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  }
}





