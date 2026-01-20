import { Patient } from './patient.model';
import { Pharmacy } from './user.model';

export interface Voucher {
  voucherName: string;
  voucherCode: string;
  createdAt: Date;
  validUntil: Date;
  amount: number;
  patient: Patient;
  pharmacy: Pharmacy;
}

