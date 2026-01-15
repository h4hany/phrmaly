export interface GeneralDrug {
  id: string;
  name: string;
  description?: string;
  manufacturer: string;
  internationalBarcode: string;
}

export interface PharmacyDrug {
  id: string;
  generalDrugId: string;
  generalDrug?: GeneralDrug;
  pharmacyId: string;
  internalBarcode: string; // PLU, 6-8 digits
  price: number;
  priceAfterDiscount: number;
  stockQuantity: number;
  minimumStock: number;
  expiryDate?: Date;
  status: 'active' | 'inactive' | 'out_of_stock';
  costLayers: CostLayer[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CostLayer {
  quantity: number;
  unitCost: number;
  purchaseDate: Date;
  expiryDate?: Date;
}

export type InventoryCostingMethod = 'FIFO' | 'AVERAGE';






