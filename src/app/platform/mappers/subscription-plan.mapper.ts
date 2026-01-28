import { SubscriptionPlan } from '../../core/models/platform.model';

/**
 * SubscriptionPlan Mapper
 * 
 * Pure class for transforming API responses to domain models.
 * 
 * Rules:
 * - Static methods only
 * - No Angular decorators
 * - No dependencies on HttpClient or services
 * - Handles null/undefined with defaults
 * - Converts date strings to Date objects
 * - Converts numbers with Number()
 * - Protects against missing fields
 */
export class SubscriptionPlanMapper {
  /**
   * Map API response to SubscriptionPlan domain model
   * 
   * @param plan - Raw API response (may be any/unknown)
   * @returns SubscriptionPlan domain model
   */
  static fromApi(plan: unknown): SubscriptionPlan {
    const apiPlan = plan as any;

    return {
      id: apiPlan.id ?? '',
      name: apiPlan.name ?? '',
      description: apiPlan.description ?? '',
      tier: apiPlan.tier ?? 'starter',
      price: Number(apiPlan.price) || 0,
      currency: apiPlan.currency ?? 'USD',
      billingCycle: apiPlan.billingCycle ?? 'monthly',
      maxPharmacies: Number(apiPlan.maxPharmacies) || 0,
      maxStaff: Number(apiPlan.maxStaff) || 0,
      enabledModules: Array.isArray(apiPlan.enabledModules) ? apiPlan.enabledModules : [],
      features: apiPlan.features && typeof apiPlan.features === 'object' ? apiPlan.features : {},
      isActive: apiPlan.isActive ?? true,
      isArchived: apiPlan.isArchived ?? false,
      createdAt: this.parseDate(apiPlan.createdAt),
      updatedAt: this.parseDate(apiPlan.updatedAt)
    };
  }

  /**
   * Parse date from string or Date object
   * 
   * @param date - Date string or Date object
   * @returns Date object
   */
  private static parseDate(date: unknown): Date {
    if (date instanceof Date) {
      return date;
    }
    
    if (typeof date === 'string') {
      const parsed = new Date(date);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    
    return new Date();
  }
}

