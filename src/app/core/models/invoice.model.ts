import { Patient } from './patient.model';

export interface InvoiceItem {
  id: string;
  drugId: string;
  drugName: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  totalPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patient?: Patient;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  promoCode?: string;
  total: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  paymentMethod?: 'cash' | 'card' | 'bank_transfer';
  createdAt: Date;
  updatedAt: Date;
  pharmacyId: string;
}






