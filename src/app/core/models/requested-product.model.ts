export interface RequestedProduct {
  id: string;
  productName: string;
  requestedBy: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  notes?: string;
  pharmacyId: string;
}

