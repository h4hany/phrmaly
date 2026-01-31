import { Subscription } from '../../core/models/platform.model';
import { SubscriptionPlanMapper } from './subscription-plan.mapper';

/**
 * Subscription Mapper
 * 
 * Pure class for transforming API responses to domain models.
 * 
 * Rules:
 * - Static methods only
 * - No Angular decorators
 * - No dependencies on HttpClient or services
 * - Uses SubscriptionPlanMapper for nested plan mapping
 * - Handles null/undefined with defaults
 * - Converts all date fields
 */
export class SubscriptionMapper {
  /**
   * Map API response to Subscription domain model
   * 
   * @param subscription - Raw API response (may be any/unknown)
   * @returns Subscription domain model
   */
  static fromApi(subscription: unknown): Subscription {
    const apiSub = subscription as any;

    return {
      id: apiSub.id ?? '',
      accountId: apiSub.accountId ?? '',
      account: apiSub.account ?? undefined,
      accountName: apiSub.accountName ?? apiSub.account?.name ?? '',
      planId: apiSub.planId ?? '',
      plan: apiSub.plan ? SubscriptionPlanMapper.fromApi(apiSub.plan) : undefined,
      planName: apiSub.planName ?? apiSub.plan?.name ?? '',
      status: apiSub.status ?? 'active',
      currentPeriodStart: this.parseDate(apiSub.currentPeriodStart),
      currentPeriodEnd: this.parseDate(apiSub.currentPeriodEnd),
      cancelAtPeriodEnd: apiSub.cancelAtPeriodEnd ?? false,
      trialEndsAt: apiSub.trialEndsAt ? this.parseDate(apiSub.trialEndsAt) : undefined,
      totalPrice: apiSub.totalPrice ?? 0,
      createdAt: this.parseDate(apiSub.createdAt),
      updatedAt: this.parseDate(apiSub.updatedAt)
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

