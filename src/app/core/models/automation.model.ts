export type AutomationTrigger = 'stock_low' | 'expiry_soon' | 'purchase_received' | 'sale_completed' | 'payment_due' | 'custom';
export type AutomationAction = 'notify' | 'reorder' | 'adjust_price' | 'create_task' | 'send_email' | 'webhook';
export type AutomationStatus = 'active' | 'inactive' | 'testing';

export interface AutomationRule {
  id: string;
  pharmacyId: string;
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  triggerConditions: { [key: string]: any };
  action: AutomationAction;
  actionConfig: { [key: string]: any };
  status: AutomationStatus;
  priority: number;
  enabled: boolean;
  lastExecuted?: Date;
  executionCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  auditTrail?: string[];
}

export interface AutomationEvent {
  id: string;
  pharmacyId: string;
  ruleId: string;
  ruleName?: string;
  trigger: AutomationTrigger;
  payload: { [key: string]: any };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  executedAt?: Date;
  createdAt: Date;
}



