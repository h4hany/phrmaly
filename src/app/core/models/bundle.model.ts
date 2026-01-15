export interface BundleItem {
  drugId: string;
  quantity: number;
}

export interface Bundle {
  id: string;
  name: string;
  fixedPrice: number;
  items: BundleItem[];
  pharmacyId: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}







