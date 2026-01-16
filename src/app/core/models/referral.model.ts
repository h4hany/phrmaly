export interface Doctor {
  id: string;
  pharmacyId: string;
  name: string;
  specialty?: string;
  clinic?: string;
  phone?: string;
  email?: string;
  totalReferrals: number;
  totalRevenue: number;
  lastReferralDate?: Date;
  createdAt: Date;
  createdBy: string;
  auditTrail?: string[];
}

export interface Clinic {
  id: string;
  pharmacyId: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  totalReferrals: number;
  totalRevenue: number;
  doctors: string[];
  lastReferralDate?: Date;
  createdAt: Date;
  createdBy: string;
  auditTrail?: string[];
}

export interface Referral {
  id: string;
  pharmacyId: string;
  doctorId?: string;
  doctorName?: string;
  clinicId?: string;
  clinicName?: string;
  patientId: string;
  patientName?: string;
  invoiceId?: string;
  revenue: number;
  referralDate: Date;
  notes?: string;
  createdAt: Date;
  createdBy: string;
  auditTrail?: string[];
}

