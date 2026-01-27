export interface SupplierPayment {
  id: string;
  supplierId: string;
  purchaseInvoiceId?: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'other';
  notes?: string;
  createdAt: Date;
}











