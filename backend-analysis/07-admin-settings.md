# Admin / Settings - Backend Requirements

## Overview
Administrative settings and configuration management for pharmacy operations, account management, theme customization, and system configuration.

---

## Features

### 1. Account Settings
- Account information management
- Pharmacy profile settings
- Contact information
- Logo upload
- Theme customization (colors, RTL support)

### 2. System Settings
- Feature flags management
- Permission management
- Module enable/disable
- System configuration

### 3. Payment Methods
- Payment method configuration
- Deduction rate management
- Payment method activation/deactivation

### 4. Audit Logs
- Activity logging
- Audit trail viewing
- User activity tracking

### 5. Migration
- Data migration tools
- Import/export functionality

---

## API Contracts

### Account Settings Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/settings/account` | Get account settings | User | - | `AccountSettings` |
| PUT | `/api/settings/account` | Update account settings | User | `Partial<AccountSettings>` | `AccountSettings` |
| POST | `/api/settings/account/logo` | Upload logo | User | `FormData` (file) | `{ logoUrl: string }` |
| PUT | `/api/settings/account/theme` | Update theme | User | `ThemeSettings` | `ThemeSettings` |

### System Settings Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/settings/system` | Get system settings | Admin | - | `SystemSettings` |
| PUT | `/api/settings/system` | Update system settings | Admin | `Partial<SystemSettings>` | `SystemSettings` |
| GET | `/api/settings/feature-flags` | List feature flags | Admin | - | `FeatureFlag[]` |
| POST | `/api/settings/feature-flags` | Create feature flag | Admin | `Omit<FeatureFlag, 'id'\|'createdAt'\|'updatedAt'>` | `FeatureFlag` |
| PUT | `/api/settings/feature-flags/:id` | Update feature flag | Admin | `Partial<FeatureFlag>` | `FeatureFlag` |
| DELETE | `/api/settings/feature-flags/:id` | Delete feature flag | Admin | - | `{ success: boolean }` |

### Permission Management Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/settings/permissions` | List permissions | Admin | - | `Permission[]` |
| GET | `/api/settings/permissions/modules` | List modules | Admin | - | `Module[]` |
| PUT | `/api/settings/permissions/modules/:moduleId` | Enable/disable module | Admin | `{ enabled: boolean }` | `Module` |

### Audit Log Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/audit-logs` | List audit logs | Admin | Query params | `PaginatedResponse<AuditLog>` |
| GET | `/api/audit-logs/:id` | Get audit log by ID | Admin | - | `AuditLog` |
| GET | `/api/audit-logs/user/:userId` | Get logs by user | Admin | Query params | `AuditLog[]` |
| GET | `/api/audit-logs/entity/:entityType/:entityId` | Get logs by entity | Admin | Query params | `AuditLog[]` |

### Migration Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| POST | `/api/migration/import` | Import data | Admin | `FormData` (file) | `{ success: boolean, records: number }` |
| GET | `/api/migration/export` | Export data | Admin | Query params | `{ downloadUrl: string }` |
| POST | `/api/migration/validate` | Validate import file | Admin | `FormData` (file) | `{ valid: boolean, errors: string[] }` |

---

## Data Models

### AccountSettings
```typescript
interface AccountSettings {
  pharmacyId: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  theme: ThemeSettings;
  createdAt: Date;
  updatedAt: Date;
}
```

### ThemeSettings
```typescript
interface ThemeSettings {
  primaryColor: string; // Hex color
  secondaryColor: string; // Hex color
  sidebarColor: string; // Hex color
  rtlEnabled: boolean;
}
```

### SystemSettings
```typescript
interface SystemSettings {
  pharmacyId: string;
  features: {
    [key: string]: boolean;
  };
  modules: {
    [key: string]: boolean;
  };
  limits: {
    maxUsers: number;
    maxPharmacies: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### FeatureFlag
```typescript
interface FeatureFlag {
  id: string;
  pharmacyId?: string | null; // null for global flags
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  targetRoles?: string[]; // Roles that can see this feature
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

### AuditLog
```typescript
interface AuditLog {
  id: string;
  pharmacyId: string;
  userId: string;
  userName?: string; // Populated on fetch
  action: string; // e.g., 'invoice.create', 'drug.update'
  entityType: string; // e.g., 'Invoice', 'Drug'
  entityId: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  metadata?: { [key: string]: any };
}
```

### Module
```typescript
interface Module {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  permissions: string[]; // Required permissions to access
}
```

---

## Query Parameters

### Pagination
- `page`: number (default: 1)
- `pageSize`: number (default: 10)
- `sortBy`: string (optional)
- `sortOrder`: 'asc' | 'desc' (optional)

### Audit Log Filters
- `pharmacyId`: string (required)
- `userId`: string (filter by user)
- `entityType`: string (filter by entity type)
- `entityId`: string (filter by entity)
- `action`: string (filter by action)
- `startDate`: ISO date string
- `endDate`: ISO date string

---

## Business Rules

### Account Settings
- Only account owner can modify account information
- Theme changes apply immediately
- Logo upload should validate file type and size
- RTL support affects UI layout

### Feature Flags
- Global flags apply to all pharmacies
- Pharmacy-specific flags override global flags
- Target roles determine feature visibility
- Feature flags should be cached for performance

### Audit Logging
- All critical actions should be logged
- Logs are immutable (cannot be edited/deleted)
- Logs should be retained for compliance (configurable retention period)
- Sensitive data should be masked in logs

### Migration
- Import should validate data before processing
- Import should support rollback on errors
- Export should include all related data
- Migration should be atomic (all or nothing)

---

## Missing/Unclear Requirements

1. **Backup/Restore**: No backup/restore functionality
2. **Data Retention Policy**: No explicit retention policy for audit logs
3. **Notification Settings**: No notification preferences
4. **Integration Settings**: No third-party integration configuration
5. **Security Settings**: No password policy, 2FA settings
6. **Localization Settings**: No language/locale configuration
7. **Email Settings**: No email server configuration
8. **SMS Settings**: No SMS gateway configuration
9. **Print Settings**: No printer configuration
10. **Tax Settings**: No tax configuration
11. **Currency Settings**: No currency configuration
12. **Time Zone Settings**: No timezone configuration
13. **Business Hours**: No business hours configuration
14. **Holiday Calendar**: No holiday calendar

---

## Notes

- Account settings are pharmacy-scoped
- Feature flags support A/B testing and gradual rollouts
- Audit logs are critical for compliance and security
- Migration tools should support bulk data operations
- Theme settings affect user experience and branding

