/**
 * Permission Model
 * 
 * Defines the structure for permission-based access control.
 * The backend returns a PermissionContext containing:
 * - permissions: Array of granted permission keys
 * - modules: Array of enabled module names
 * - limits: Resource limits (users, pharmacies, etc.)
 */

export interface PermissionContext {
  permissions: string[];
  modules: string[];
  limits: {
    maxUsers: number;
    maxPharmacies: number;
  };
}

/**
 * Legacy permission models for backward compatibility
 * Used by PermissionEngineService and FeatureFlagService
 */

export type ResourceType = 
  | 'patients' 
  | 'invoices' 
  | 'drugs' 
  | 'inventory' 
  | 'staff' 
  | 'settings' 
  | 'reports'
  | 'audit'
  | string;

export type PermissionAction = 
  | 'view' 
  | 'create' 
  | 'edit' 
  | 'delete' 
  | 'manage'
  | string;

export interface Permission {
  id: string;
  resource: ResourceType;
  actions: PermissionAction[];
  description?: string;
}

export interface Role {
  id: string;
  pharmacyId?: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface FeatureFlag {
  id: string;
  pharmacyId?: string | null;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  targetRoles?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
