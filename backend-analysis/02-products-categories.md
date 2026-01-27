# Products & Categories - Backend Requirements

## Overview
Drug/product management system with global drug catalog and pharmacy-specific drug instances. Supports barcode scanning, inventory tracking, and product bundles.

---

## Features

### 1. General Drugs (Global Catalog)
- Global drug database
- Drug information (name, description, manufacturer, international barcode)
- Drug search and lookup
- Used as reference for pharmacy-specific drugs

### 2. Pharmacy Drugs (Pharmacy-Specific)
- Pharmacy-specific drug instances
- Internal barcode (PLU: 6-8 digits)
- Pricing (price, priceAfterDiscount)
- Stock management (quantity, minimumStock)
- Expiry date tracking
- Cost layers (FIFO/AVERAGE costing)
- Status management (active, inactive, out_of_stock)
- Classification (medicinal, cosmetic)
- Origin (local, imported)

### 3. Drug Bundles
- Product bundles/packages
- Fixed pricing for bundles
- Multiple drugs per bundle
- Bundle status (active, inactive)

### 4. Barcode Scanning
- Internal barcode lookup (PLU codes)
- International barcode lookup
- Quick drug search by barcode
- Integration with invoice/POS system

---

## API Contracts

### General Drugs Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/drugs/general` | List all general drugs | User | Query params | `GeneralDrug[]` |
| GET | `/api/drugs/general/:id` | Get general drug by ID | User | - | `GeneralDrug` |
| POST | `/api/drugs/general` | Create general drug | Admin | `Omit<GeneralDrug, 'id'>` | `GeneralDrug` |
| PUT | `/api/drugs/general/:id` | Update general drug | Admin | `Partial<GeneralDrug>` | `GeneralDrug` |
| DELETE | `/api/drugs/general/:id` | Delete general drug | Admin | - | `{ success: boolean }` |
| GET | `/api/drugs/general/search` | Search general drugs | User | `?q=string` | `GeneralDrug[]` |

### Pharmacy Drugs Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/drugs` | List pharmacy drugs | User | Query params | `PaginatedResponse<PharmacyDrug>` |
| GET | `/api/drugs/:id` | Get pharmacy drug by ID | User | - | `PharmacyDrug` |
| GET | `/api/drugs/barcode/:barcode` | Get drug by barcode | User | - | `PharmacyDrug` |
| POST | `/api/drugs` | Create pharmacy drug | User | `Omit<PharmacyDrug, 'id'\|'createdAt'\|'updatedAt'>` | `PharmacyDrug` |
| PUT | `/api/drugs/:id` | Update pharmacy drug | User | `Partial<PharmacyDrug>` | `PharmacyDrug` |
| DELETE | `/api/drugs/:id` | Delete pharmacy drug | User | - | `{ success: boolean }` |
| GET | `/api/drugs/search` | Search pharmacy drugs | User | `?q=string` | `PharmacyDrug[]` |
| GET | `/api/drugs/low-stock` | Get low stock drugs | User | `?threshold=number` | `PharmacyDrug[]` |
| GET | `/api/drugs/expiring` | Get expiring drugs | User | `?days=number` | `PharmacyDrug[]` |

### Bundles Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/bundles` | List all bundles | User | - | `Bundle[]` |
| GET | `/api/bundles/:id` | Get bundle by ID | User | - | `Bundle` |
| POST | `/api/bundles` | Create bundle | User | `Omit<Bundle, 'id'\|'createdAt'\|'updatedAt'>` | `Bundle` |
| PUT | `/api/bundles/:id` | Update bundle | User | `Partial<Bundle>` | `Bundle` |
| DELETE | `/api/bundles/:id` | Delete bundle | User | - | `{ success: boolean }` |

---

## Data Models

### GeneralDrug
```typescript
interface GeneralDrug {
  id: string;
  name: string;
  description?: string;
  manufacturer: string;
  internationalBarcode: string; // EAN/UPC barcode
}
```

### PharmacyDrug
```typescript
interface PharmacyDrug {
  id: string;
  generalDrugId: string;
  generalDrug?: GeneralDrug; // Populated on fetch
  pharmacyId: string;
  internalBarcode: string; // PLU: 6-8 digits
  price: number;
  priceAfterDiscount: number;
  stockQuantity: number;
  minimumStock: number;
  expiryDate?: Date;
  status: 'active' | 'inactive' | 'out_of_stock';
  classification?: 'medicinal' | 'cosmetic';
  origin?: 'local' | 'imported';
  costLayers: CostLayer[];
  createdAt: Date;
  updatedAt: Date;
}
```

### CostLayer
```typescript
interface CostLayer {
  quantity: number;
  unitCost: number;
  purchaseDate: Date;
  expiryDate?: Date;
}
```

**Inventory Costing Methods:**
- `FIFO` (First In, First Out)
- `AVERAGE` (Average Cost)

### Bundle
```typescript
interface Bundle {
  id: string;
  name: string;
  fixedPrice: number;
  items: BundleItem[];
  pharmacyId: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}
```

### BundleItem
```typescript
interface BundleItem {
  drugId: string;
  quantity: number;
}
```

---

## Query Parameters

### Pagination
- `page`: number (default: 1)
- `pageSize`: number (default: 10)
- `sortBy`: string (optional, e.g., 'name', 'price', 'stockQuantity')
- `sortOrder`: 'asc' | 'desc' (optional)

### Filters
- `pharmacyId`: string (required for pharmacy drugs)
- `status`: 'active' | 'inactive' | 'out_of_stock'
- `classification`: 'medicinal' | 'cosmetic'
- `origin`: 'local' | 'imported'
- `search`: string (search by name, barcode)
- `lowStock`: boolean (filter low stock items)
- `expiring`: boolean (filter expiring items)
- `expiringDays`: number (days until expiry, default: 30)

---

## Business Rules

### Stock Management
- Stock quantity decreases on invoice creation
- Stock quantity increases on purchase receipt
- Out of stock status when `stockQuantity === 0`
- Low stock alert when `stockQuantity <= minimumStock`

### Expiry Management
- Drugs with expiry dates should be tracked
- Expiring drugs alert (configurable days, default: 30)
- Expired drugs should be marked as inactive

### Cost Layers
- Cost layers track purchase history for FIFO/AVERAGE costing
- Each purchase creates a new cost layer
- Cost layers are consumed on sales (FIFO) or averaged (AVERAGE)

### Barcode Requirements
- Internal barcode (PLU): 6-8 digits, unique per pharmacy
- International barcode: EAN/UPC format, can be shared across pharmacies
- Barcode lookup should be fast (indexed)

---

## Missing/Unclear Requirements

1. **Drug Categories**: No explicit category system in frontend
2. **Drug Images**: No image upload for drugs visible
3. **Drug Variants**: No support for drug variants (e.g., different strengths)
4. **Batch/Lot Numbers**: Cost layers imply batch tracking, but no explicit lot number field
5. **Drug Interactions**: No drug interaction warnings
6. **Prescription Requirements**: No flag for prescription-only drugs
7. **Tax Information**: No tax rate or tax category fields
8. **Unit of Measure**: No explicit unit field (assumed: pieces/units)
9. **Reorder Points**: `minimumStock` exists, but no automatic reorder logic
10. **Drug Expiry Alerts**: Expiry tracking exists, but no alert mechanism defined

---

## Notes

- Barcode scanning is implemented client-side using keyboard input detection
- Frontend uses mock data; all endpoints need to be implemented
- Cost layers are critical for inventory valuation
- Drug bundles allow fixed pricing regardless of individual drug prices



