import { UserRole } from './user.model';

export interface PharmacyStaff {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  username?: string;
  role: UserRole;
  pharmacyId: string;
  status: 'active' | 'inactive';
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  pharmacyRoles?: Array<{
    pharmacyId: string;
    pharmacyName: string;
    roleId: string;
    roleName: string;
  }>;
}










