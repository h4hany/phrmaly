# Inventory & Stock - Backend Requirements

## Overview
Comprehensive inventory management system with stock tracking, movements, transfers, alerts, and risk monitoring. Supports multi-branch inventory transfers and real-time stock updates.

---

## Features

### 1. Inventory Alerts
- Low stock alerts (quantity <= minimumStock)
- Expiring drugs alerts (configurable days)
- Out of stock notifications
- Multi-pharmacy inventory alerts view

### 2. Inventory Movements
- Track all stock movements (sales, purchases, transfers, adjustments)
- Movement history with audit trail
- Risk scoring for suspicious movements
- Movement filtering and search
- Risk dashboard for staff performance

### 3. Inventory Transfers
- Inter-branch inventory transfers
- Transfer requests and approvals
- Transfer shipments and tracking
- Transfer variance tracking
- Transfer status management

### 4. Inventory Map
- Visual inventory location mapping
- Stock location tracking (implied)

### 5. Requested Products
- Product request system
- Request status tracking (pending, approved, rejected, fulfilled)
- Request notes and history

---

## API Contracts

### Inventory Alerts Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/inventory/alerts` | Get inventory alerts | User | Query params | `InventoryAlert[]` |
| GET | `/api/inventory/alerts/low-stock` | Get low stock alerts | User | `?pharmacyId=string` | `PharmacyDrug[]` |
| GET | `/api/inventory/alerts/expiring` | Get expiring alerts | User | `?pharmacyId=string&days=number` | `PharmacyDrug[]` |
| GET | `/api/inventory/alerts/out-of-stock` | Get out of stock alerts | User | `?pharmacyId=string` | `PharmacyDrug[]` |
| GET | `/api/inventory/alerts/pharmacies` | Get alerts across pharmacies | Admin | - | `PharmaciesInventoryAlerts[]` |

### Inventory Movements Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/inventory/movements` | List movements | User | Query params | `PaginatedResponse<DrugMovement>` |
| GET | `/api/inventory/movements/:id` | Get movement by ID | User | - | `DrugMovement` |
| POST | `/api/inventory/movements` | Create movement | User | `Omit<DrugMovement, 'id'\|'timestamp'\|'createdAt'>` | `DrugMovement` |
| GET | `/api/inventory/movements/risk` | Get risk dashboard | Admin | Query params | `StaffRiskScore[]` |
| GET | `/api/inventory/movements/staff/:staffId` | Get movements by staff | Admin | Query params | `DrugMovement[]` |
| GET | `/api/inventory/movements/drug/:drugId` | Get movements by drug | User | Query params | `DrugMovement[]` |

### Inventory Transfers Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/inventory/transfers` | List transfers | User | Query params | `PaginatedResponse<TransferRequest>` |
| GET | `/api/inventory/transfers/:id` | Get transfer by ID | User | - | `TransferRequest` |
| POST | `/api/inventory/transfers` | Create transfer request | User | `Omit<TransferRequest, 'id'\|'createdAt'\|'updatedAt'>` | `TransferRequest` |
| PUT | `/api/inventory/transfers/:id/approve` | Approve transfer | Admin | `{ approvedBy: string, notes?: string }` | `TransferRequest` |
| PUT | `/api/inventory/transfers/:id/reject` | Reject transfer | Admin | `{ rejectedBy: string, notes?: string }` | `TransferRequest` |
| POST | `/api/inventory/transfers/:id/ship` | Create shipment | User | `Omit<TransferShipment, 'id'\|'createdAt'>` | `TransferShipment` |
| PUT | `/api/inventory/transfers/:id/receive` | Receive transfer | User | `{ receivedBy: string, items: TransferItem[], variances?: TransferVariance[] }` | `TransferRequest` |
| GET | `/api/inventory/transfers/:id/variances` | Get transfer variances | User | - | `TransferVariance[]` |

### Inventory Map Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/inventory/map` | Get inventory map | User | `?pharmacyId=string` | `InventoryMapData` |

### Requested Products Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/inventory/requested-products` | List requested products | User | `?pharmacyId=string` | `RequestedProduct[]` |
| GET | `/api/inventory/requested-products/:id` | Get requested product | User | - | `RequestedProduct` |
| POST | `/api/inventory/requested-products` | Create request | User | `Omit<RequestedProduct, 'id'\|'requestedAt'>` | `RequestedProduct` |
| PUT | `/api/inventory/requested-products/:id/status` | Update request status | Admin | `{ status: 'pending'\|'approved'\|'rejected'\|'fulfilled' }` | `RequestedProduct` |
| DELETE | `/api/inventory/requested-products/:id` | Delete request | User | - | `{ success: boolean }` |

---

## Data Models

### DrugMovement
```typescript
interface DrugMovement {
  id: string;
  pharmacyId: string;
  drugId: string;
  drugName?: string; // Populated on fetch
  movementType: MovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  unitCost?: number;
  staffId: string;
  staffName?: string; // Populated on fetch
  reason?: string;
  riskLevel: RiskLevel;
  riskScore: number; // 0-100
  variance?: number;
  timestamp: Date;
  createdAt: Date;
  createdBy: string;
  auditTrail?: string[];
}
```

**MovementType:**
- `sale` - Sale transaction
- `purchase` - Purchase receipt
- `transfer_in` - Received from another branch
- `transfer_out` - Shipped to another branch
- `adjustment` - Manual adjustment
- `expiry` - Expired items removed
- `damage` - Damaged items removed
- `theft` - Theft/loss recorded

**RiskLevel:**
- `low` - Normal movement
- `medium` - Slightly suspicious
- `high` - Suspicious movement
- `critical` - Highly suspicious, requires investigation

### StaffRiskScore
```typescript
interface StaffRiskScore {
  staffId: string;
  staffName: string;
  pharmacyId: string;
  totalMovements: number;
  suspiciousMovements: number;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  lastMovementDate?: Date;
}
```

### MovementFilter
```typescript
interface MovementFilter {
  drugId?: string;
  staffId?: string;
  movementType?: MovementType;
  riskLevel?: RiskLevel;
  startDate?: Date;
  endDate?: Date;
}
```

### TransferRequest
```typescript
interface TransferRequest {
  id: string;
  pharmacyId: string;
  fromBranchId: string;
  fromBranchName?: string; // Populated on fetch
  toBranchId: string;
  toBranchName?: string; // Populated on fetch
  items: TransferItem[];
  status: TransferStatus;
  requestedBy: string;
  requestedByName?: string; // Populated on fetch
  approvedBy?: string;
  approvedByName?: string; // Populated on fetch
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  auditTrail?: string[];
}
```

**TransferStatus:**
- `pending` - Awaiting approval
- `approved` - Approved, ready to ship
- `in_transit` - Shipped, in transit
- `received` - Received at destination
- `rejected` - Rejected by approver
- `cancelled` - Cancelled by requester

### TransferItem
```typescript
interface TransferItem {
  drugId: string;
  drugName?: string; // Populated on fetch
  requestedQuantity: number;
  approvedQuantity?: number;
  shippedQuantity?: number;
  receivedQuantity?: number;
  unitCost?: number;
}
```

### TransferShipment
```typescript
interface TransferShipment {
  id: string;
  transferRequestId: string;
  pharmacyId: string;
  shippedBy: string;
  shippedByName?: string; // Populated on fetch
  shippedAt: Date;
  trackingNumber?: string;
  items: TransferItem[];
  status: TransferStatus;
  createdAt: Date;
  createdBy: string;
}
```

### TransferVariance
```typescript
interface TransferVariance {
  id: string;
  transferId: string;
  drugId: string;
  drugName?: string; // Populated on fetch
  expectedQuantity: number;
  actualQuantity: number;
  variance: number;
  variancePercentage: number;
  reason?: string;
  resolved: boolean;
  createdAt: Date;
}
```

### RequestedProduct
```typescript
interface RequestedProduct {
  id: string;
  productName: string;
  requestedBy: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  notes?: string;
  pharmacyId: string;
}
```

---

## Query Parameters

### Pagination
- `page`: number (default: 1)
- `pageSize`: number (default: 10)
- `sortBy`: string (optional)
- `sortOrder`: 'asc' | 'desc' (optional)

### Filters
- `pharmacyId`: string (required for most endpoints)
- `drugId`: string (filter by drug)
- `staffId`: string (filter by staff)
- `movementType`: MovementType (filter by type)
- `riskLevel`: RiskLevel (filter by risk)
- `status`: string (filter by status)
- `startDate`: ISO date string
- `endDate`: ISO date string
- `fromBranchId`: string (for transfers)
- `toBranchId`: string (for transfers)

---

## Business Rules

### Stock Movements
- All stock changes must create a movement record
- Movements are immutable (cannot be edited/deleted)
- Risk score calculated based on:
  - Movement type
  - Quantity variance
  - Staff history
  - Time patterns
  - Frequency of movements

### Transfers
- Transfer requests require approval (configurable by role)
- Approved transfers create shipment records
- Received transfers update stock at destination
- Variances must be recorded and resolved
- Transfer status workflow: pending → approved → in_transit → received

### Inventory Alerts
- Low stock: `stockQuantity <= minimumStock`
- Expiring: `expiryDate <= (today + days)`
- Out of stock: `stockQuantity === 0`
- Alerts should be real-time or near-real-time

### Risk Scoring
- Risk score (0-100) calculated per movement
- Staff risk score aggregated from movements
- Risk factors:
  - Large quantity adjustments
  - Frequent adjustments
  - Off-hours movements
  - Unusual movement patterns
  - Variance in transfers

---

## Missing/Unclear Requirements

1. **Real-time Updates**: No WebSocket/SSE implementation visible for real-time alerts
2. **Inventory Valuation**: No explicit inventory valuation endpoints
3. **Stock Taking**: No stock taking/cycle count functionality
4. **Location Tracking**: Inventory map exists but no explicit location model
5. **Serial Numbers**: No serial number tracking for high-value items
6. **Batch Expiry Alerts**: Expiry alerts exist, but no batch-level expiry management
7. **Automatic Reordering**: No automatic reorder point triggers
8. **Inventory Reports**: No explicit inventory reporting endpoints
9. **Stock Adjustment Reasons**: Movement reason exists, but no predefined reason codes
10. **Transfer Approval Workflow**: Approval exists, but no multi-level approval workflow

---

## Notes

- Risk scoring is critical for fraud detection and staff monitoring
- All movements should be auditable (immutable audit trail)
- Transfer variances need resolution workflow
- Inventory alerts should support notification system (email, SMS, in-app)

