export type SupplierType = 'manufacturer' | 'warehouse';

export interface Supplier {
  id: string;
  name: string;
  type: SupplierType;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}











