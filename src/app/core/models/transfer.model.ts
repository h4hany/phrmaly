export type TransferStatus = 'pending' | 'approved' | 'in_transit' | 'received' | 'rejected' | 'cancelled';
export type TransferType = 'request' | 'shipment';

export interface TransferRequest {
  id: string;
  pharmacyId: string;
  fromBranchId: string;
  fromBranchName?: string;
  toBranchId: string;
  toBranchName?: string;
  items: TransferItem[];
  status: TransferStatus;
  requestedBy: string;
  requestedByName?: string;
  approvedBy?: string;
  approvedByName?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  auditTrail?: string[];
}

export interface TransferItem {
  drugId: string;
  drugName?: string;
  requestedQuantity: number;
  approvedQuantity?: number;
  shippedQuantity?: number;
  receivedQuantity?: number;
  unitCost?: number;
}

export interface TransferShipment {
  id: string;
  transferRequestId: string;
  pharmacyId: string;
  shippedBy: string;
  shippedByName?: string;
  shippedAt: Date;
  trackingNumber?: string;
  items: TransferItem[];
  status: TransferStatus;
  createdAt: Date;
  createdBy: string;
}

export interface TransferVariance {
  id: string;
  transferId: string;
  drugId: string;
  drugName?: string;
  expectedQuantity: number;
  actualQuantity: number;
  variance: number;
  variancePercentage: number;
  reason?: string;
  resolved: boolean;
  createdAt: Date;
}





