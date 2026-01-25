# Authentication & Users - Backend Requirements

## Overview
Authentication and user management system supporting multiple roles, multi-pharmacy accounts, and permission-based access control.

---

## Features

### 1. Authentication
- User login (email, username, or phone)
- Admin login (separate endpoint)
- JWT token-based authentication
- Token refresh mechanism
- Logout functionality
- Password reset (implied but not explicitly implemented in frontend)

### 2. User Management
- Multi-role support (Account Owner, Pharmacy Manager, Staff, Inventory Manager, etc.)
- Multi-pharmacy account support
- User profile management
- Avatar/photo upload
- User status management (active/inactive)

### 3. Permission System
- Role-based access control (RBAC)
- Permission context retrieval
- Module-based access control
- Resource limits per account (max users, max pharmacies)

---

## API Contracts

### Authentication Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| POST | `/api/auth/login` | User login | Public | `{ identifier: string, password: string }` | `{ token: string, user: User }` |
| POST | `/api/auth/admin-login` | Admin login | Public | `{ identifier: string, password: string }` | `{ token: string, user: User }` |
| POST | `/api/auth/logout` | Logout | User | - | `{ message: string }` |
| POST | `/api/auth/refresh` | Refresh token | User | `{ refreshToken: string }` | `{ token: string }` |

### User Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/users/me` | Get current user | User | - | `User` |
| GET | `/api/users/:id` | Get user by ID | Admin | - | `User` |
| PUT | `/api/users/me` | Update current user | User | `Partial<User>` | `User` |
| PUT | `/api/users/:id` | Update user | Admin | `Partial<User>` | `User` |
| DELETE | `/api/users/:id` | Delete user | Admin | - | `{ success: boolean }` |

### Permission Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/auth/permissions` | Get permission context | User | - | `PermissionContext` |
| GET | `/api/permissions` | List all permissions | Admin | - | `Permission[]` |
| GET | `/api/roles` | List all roles | Admin | - | `Role[]` |
| POST | `/api/roles` | Create role | Admin | `Omit<Role, 'id'>` | `Role` |
| PUT | `/api/roles/:id` | Update role | Admin | `Partial<Role>` | `Role` |
| DELETE | `/api/roles/:id` | Delete role | Admin | - | `{ success: boolean }` |

---

## Data Models

### User
```typescript
interface User {
  id: string;
  email?: string;
  username?: string;
  phone?: string;
  password: string; // Hashed in backend
  role: UserRole;
  fullName: string;
  avatarUrl?: string;
  pharmacyId?: string; // For single-pharmacy users
  pharmacies?: Pharmacy[]; // For multi-pharmacy users
  createdAt: Date;
  updatedAt: Date;
}
```

**UserRole Enum:**
- `ACCOUNT_OWNER`
- `PHARMACY_MANAGER`
- `PHARMACY_STAFF`
- `PHARMACY_INVENTORY_MANAGER`
- `PHARMACY_ACCOUNTING_MANAGER`
- `SUPER_ADMIN`
- `SUPPORT_ADMIN`
- `SALES_ADMIN`
- `FINANCE_ADMIN`

### Pharmacy
```typescript
interface Pharmacy {
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
  createdAt: Date;
  updatedAt: Date;
}
```

### PermissionContext
```typescript
interface PermissionContext {
  permissions: string[]; // e.g., ['patients.view', 'invoices.create']
  modules: string[]; // e.g., ['dashboard', 'patients', 'inventory']
  limits: {
    maxUsers: number;
    maxPharmacies: number;
  };
}
```

### Permission
```typescript
interface Permission {
  id: string;
  resource: ResourceType; // 'patients', 'invoices', 'drugs', etc.
  actions: PermissionAction[]; // ['view', 'create', 'edit', 'delete', 'manage']
  description?: string;
}
```

### Role
```typescript
interface Role {
  id: string;
  pharmacyId?: string; // null for system roles
  name: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
  createdAt: Date;
  createdBy: string;
}
```

---

## Query Parameters

### Pagination (where applicable)
- `page`: number (default: 1)
- `pageSize`: number (default: 10)
- `sortBy`: string (optional)
- `sortOrder`: 'asc' | 'desc' (optional)

### Filters
- `role`: UserRole (filter users by role)
- `pharmacyId`: string (filter users by pharmacy)
- `status`: 'active' | 'inactive' (filter by status)
- `search`: string (search by name, email, username)

---

## Authentication Requirements

### Token Format
- **Type**: JWT (JSON Web Token)
- **Storage**: Frontend stores in `localStorage` as `auth_token`
- **Header**: `Authorization: Bearer <token>`
- **Expiration**: Should be configurable (recommended: 24 hours for access token)

### Security Requirements
- Password hashing (bcrypt/argon2)
- Token refresh mechanism
- CSRF protection
- Rate limiting on login endpoints
- Account lockout after failed attempts

---

## Missing/Unclear Requirements

1. **Password Reset**: Frontend doesn't show password reset flow, but it's a standard requirement
2. **Email Verification**: Not implemented in frontend
3. **Two-Factor Authentication**: Not implemented
4. **Session Management**: No explicit session management endpoints
5. **User Activity Logging**: Not explicitly required but implied for audit trails
6. **Password Policy**: No validation rules visible in frontend
7. **Account Lockout**: No explicit lockout mechanism visible

---

## Notes

- The frontend uses mock authentication currently
- Permission context is returned synchronously to avoid race conditions with route guards
- Multi-pharmacy users can switch between pharmacies (pharmacy context service)
- RTL (Right-to-Left) support is configurable per pharmacy

