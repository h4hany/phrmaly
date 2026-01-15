import { Supplier } from './supplier.model';

export interface PurchaseInvoiceItem {
  id: string;
  drugId: string;
  drugName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplier?: Supplier;
  purchaseDate: Date;
  dueDate?: Date;
  items: PurchaseInvoiceItem[];
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  pharmacyId: string;
  createdAt: Date;
  updatedAt: Date;
}






