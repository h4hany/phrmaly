export enum UserRole {
  ACCOUNT_OWNER = 'account_owner',
  PHARMACY_MANAGER = 'pharmacy_manager',
  PHARMACY_STAFF = 'pharmacy_staff'
}

export interface User {
  id: string;
  email?: string;
  username?: string;
  phone?: string;
  password: string;
  role: UserRole;
  fullName: string;
  avatarUrl?: string;
  pharmacyId?: string;
  pharmacies?: Pharmacy[];
}

export interface Pharmacy {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  sidebarColor?: string;
  rtlEnabled?: boolean;
}






