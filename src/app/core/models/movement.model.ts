export type MovementType = 'sale' | 'purchase' | 'transfer_in' | 'transfer_out' | 'adjustment' | 'expiry' | 'damage' | 'theft';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface DrugMovement {
  id: string;
  pharmacyId: string;
  drugId: string;
  drugName?: string;
  movementType: MovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  unitCost?: number;
  staffId: string;
  staffName?: string;
  reason?: string;
  riskLevel: RiskLevel;
  riskScore: number;
  variance?: number;
  timestamp: Date;
  createdAt: Date;
  createdBy: string;
  auditTrail?: string[];
}

export interface StaffRiskScore {
  staffId: string;
  staffName: string;
  pharmacyId: string;
  totalMovements: number;
  suspiciousMovements: number;
  riskScore: number;
  riskLevel: RiskLevel;
  lastMovementDate?: Date;
}

export interface MovementFilter {
  drugId?: string;
  staffId?: string;
  movementType?: MovementType;
  riskLevel?: RiskLevel;
  startDate?: Date;
  endDate?: Date;
}



