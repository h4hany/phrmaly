export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'export';
export type ResourceType = 
  | 'drugs' 
  | 'patients' 
  | 'invoices' 
  | 'purchases' 
  | 'suppliers' 
  | 'payments' 
  | 'staff' 
  | 'inventory' 
  | 'movements' 
  | 'transfers' 
  | 'reports' 
  | 'settings' 
  | 'automation' 
  | 'permissions';

export interface Permission {
  id: string;
  pharmacyId: string;
  roleId: string;
  roleName?: string;
  resource: ResourceType;
  actions: PermissionAction[];
  conditions?: { [key: string]: any };
  createdAt: Date;
  createdBy: string;
  auditTrail?: string[];
}

export interface Role {
  id: string;
  pharmacyId: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isSystemRole: boolean;
  createdAt: Date;
  createdBy: string;
  auditTrail?: string[];
}

export interface FeatureFlag {
  id: string;
  pharmacyId?: string; // null for global flags
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  targetRoles?: string[];
  targetUsers?: string[];
  metadata?: { [key: string]: any };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  auditTrail?: string[];
}

