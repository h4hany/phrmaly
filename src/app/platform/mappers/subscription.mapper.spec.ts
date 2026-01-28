import { SubscriptionMapper } from './subscription.mapper';
import { SubscriptionPlanMapper } from './subscription-plan.mapper';
import { Subscription } from '../../core/models/platform.model';

describe('SubscriptionMapper', () => {
  describe('fromApi', () => {
    it('should map complete API response to Subscription', () => {
      const apiResponse = {
        id: 'sub-1',
        accountId: 'acc-1',
        planId: 'plan-1',
        status: 'active',
        currentPeriodStart: '2024-01-01T00:00:00Z',
        currentPeriodEnd: '2024-01-31T00:00:00Z',
        cancelAtPeriodEnd: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      };

      const result = SubscriptionMapper.fromApi(apiResponse);

      expect(result).toBeInstanceOf(Object);
      expect(result.id).toBe('sub-1');
      expect(result.accountId).toBe('acc-1');
      expect(result.planId).toBe('plan-1');
      expect(result.status).toBe('active');
      expect(result.cancelAtPeriodEnd).toBe(false);
      expect(result.currentPeriodStart).toBeInstanceOf(Date);
      expect(result.currentPeriodEnd).toBeInstanceOf(Date);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should convert all date strings to Date objects', () => {
      const apiResponse = {
        id: 'sub-1',
        accountId: 'acc-1',
        planId: 'plan-1',
        currentPeriodStart: '2024-01-01T00:00:00Z',
        currentPeriodEnd: '2024-01-31T00:00:00Z',
        trialEndsAt: '2024-02-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      };

      const result = SubscriptionMapper.fromApi(apiResponse);

      expect(result.currentPeriodStart).toBeInstanceOf(Date);
      expect(result.currentPeriodEnd).toBeInstanceOf(Date);
      expect(result.trialEndsAt).toBeInstanceOf(Date);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle Date objects in API response', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const apiResponse = {
        id: 'sub-1',
        accountId: 'acc-1',
        planId: 'plan-1',
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate
      };

      const result = SubscriptionMapper.fromApi(apiResponse);

      expect(result.currentPeriodStart).toBe(startDate);
      expect(result.currentPeriodEnd).toBe(endDate);
    });

    it('should use SubscriptionPlanMapper for nested plan', () => {
      const apiResponse = {
        id: 'sub-1',
        accountId: 'acc-1',
        planId: 'plan-1',
        plan: {
          id: 'plan-1',
          name: 'Professional',
          price: 299,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z'
        }
      };

      const result = SubscriptionMapper.fromApi(apiResponse);

      expect(result.plan).toBeDefined();
      expect(result.plan?.id).toBe('plan-1');
      expect(result.plan?.name).toBe('Professional');
      expect(result.plan?.price).toBe(299);
      expect(result.plan?.createdAt).toBeInstanceOf(Date);
      expect(result.plan?.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle missing plan', () => {
      const apiResponse = {
        id: 'sub-1',
        accountId: 'acc-1',
        planId: 'plan-1'
      };

      const result = SubscriptionMapper.fromApi(apiResponse);

      expect(result.plan).toBeUndefined();
    });

    it('should handle null plan', () => {
      const apiResponse = {
        id: 'sub-1',
        accountId: 'acc-1',
        planId: 'plan-1',
        plan: null
      };

      const result = SubscriptionMapper.fromApi(apiResponse);

      expect(result.plan).toBeUndefined();
    });

    it('should provide default values for missing fields', () => {
      const apiResponse = {
        id: 'sub-1'
      };

      const result = SubscriptionMapper.fromApi(apiResponse);

      expect(result.accountId).toBe('');
      expect(result.planId).toBe('');
      expect(result.status).toBe('active');
      expect(result.cancelAtPeriodEnd).toBe(false);
      expect(result.trialEndsAt).toBeUndefined();
    });

    it('should handle null and undefined values', () => {
      const apiResponse = {
        id: 'sub-1',
        accountId: null,
        planId: undefined,
        status: null,
        cancelAtPeriodEnd: null
      };

      const result = SubscriptionMapper.fromApi(apiResponse);

      expect(result.accountId).toBe('');
      expect(result.planId).toBe('');
      expect(result.status).toBe('active');
      expect(result.cancelAtPeriodEnd).toBe(false);
    });

    it('should handle optional trialEndsAt', () => {
      const apiResponseWithTrial = {
        id: 'sub-1',
        accountId: 'acc-1',
        planId: 'plan-1',
        trialEndsAt: '2024-02-01T00:00:00Z'
      };

      const apiResponseWithoutTrial = {
        id: 'sub-1',
        accountId: 'acc-1',
        planId: 'plan-1'
      };

      const resultWithTrial = SubscriptionMapper.fromApi(apiResponseWithTrial);
      const resultWithoutTrial = SubscriptionMapper.fromApi(apiResponseWithoutTrial);

      expect(resultWithTrial.trialEndsAt).toBeInstanceOf(Date);
      expect(resultWithoutTrial.trialEndsAt).toBeUndefined();
    });

    it('should handle invalid date strings', () => {
      const apiResponse = {
        id: 'sub-1',
        accountId: 'acc-1',
        planId: 'plan-1',
        currentPeriodStart: 'invalid-date',
        currentPeriodEnd: 'also-invalid',
        createdAt: 'invalid',
        updatedAt: 'invalid'
      };

      const result = SubscriptionMapper.fromApi(apiResponse);

      expect(result.currentPeriodStart).toBeInstanceOf(Date);
      expect(result.currentPeriodEnd).toBeInstanceOf(Date);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(isNaN(result.currentPeriodStart.getTime())).toBe(false);
      expect(isNaN(result.currentPeriodEnd.getTime())).toBe(false);
    });

    it('should handle missing date fields', () => {
      const apiResponse = {
        id: 'sub-1',
        accountId: 'acc-1',
        planId: 'plan-1'
      };

      const result = SubscriptionMapper.fromApi(apiResponse);

      expect(result.currentPeriodStart).toBeInstanceOf(Date);
      expect(result.currentPeriodEnd).toBeInstanceOf(Date);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should preserve account object if provided', () => {
      const account = {
        id: 'acc-1',
        name: 'Test Account'
      };
      const apiResponse = {
        id: 'sub-1',
        accountId: 'acc-1',
        planId: 'plan-1',
        account
      };

      const result = SubscriptionMapper.fromApi(apiResponse);

      expect(result.account).toBe(account);
    });
  });
});

