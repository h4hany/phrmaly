import { SubscriptionPlanMapper } from './subscription-plan.mapper';
import { SubscriptionPlan } from '../../core/models/platform.model';

describe('SubscriptionPlanMapper', () => {
  describe('fromApi', () => {
    it('should map complete API response to SubscriptionPlan', () => {
      const apiResponse = {
        id: 'plan-1',
        name: 'Professional',
        description: 'For growing pharmacy chains',
        tier: 'professional',
        price: 299,
        currency: 'USD',
        billingCycle: 'monthly',
        maxPharmacies: 5,
        maxStaff: 50,
        enabledModules: ['inventory', 'hr'],
        features: { apiAccess: true },
        isActive: true,
        isArchived: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      };

      const result = SubscriptionPlanMapper.fromApi(apiResponse);

      expect(result).toBeInstanceOf(Object);
      expect(result.id).toBe('plan-1');
      expect(result.name).toBe('Professional');
      expect(result.description).toBe('For growing pharmacy chains');
      expect(result.tier).toBe('professional');
      expect(result.price).toBe(299);
      expect(result.currency).toBe('USD');
      expect(result.billingCycle).toBe('monthly');
      expect(result.maxPharmacies).toBe(5);
      expect(result.maxStaff).toBe(50);
      expect(result.enabledModules).toEqual(['inventory', 'hr']);
      expect(result.features).toEqual({ apiAccess: true });
      expect(result.isActive).toBe(true);
      expect(result.isArchived).toBe(false);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should convert date strings to Date objects', () => {
      const apiResponse = {
        id: 'plan-1',
        name: 'Test',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      };

      const result = SubscriptionPlanMapper.fromApi(apiResponse);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.createdAt.getTime()).toBe(new Date('2024-01-01T00:00:00Z').getTime());
      expect(result.updatedAt.getTime()).toBe(new Date('2024-01-02T00:00:00Z').getTime());
    });

    it('should handle Date objects in API response', () => {
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');
      const apiResponse = {
        id: 'plan-1',
        name: 'Test',
        createdAt,
        updatedAt
      };

      const result = SubscriptionPlanMapper.fromApi(apiResponse);

      expect(result.createdAt).toBe(createdAt);
      expect(result.updatedAt).toBe(updatedAt);
    });

    it('should provide default values for missing fields', () => {
      const apiResponse = {
        id: 'plan-1',
        name: 'Test'
      };

      const result = SubscriptionPlanMapper.fromApi(apiResponse);

      expect(result.description).toBe('');
      expect(result.tier).toBe('starter');
      expect(result.price).toBe(0);
      expect(result.currency).toBe('USD');
      expect(result.billingCycle).toBe('monthly');
      expect(result.maxPharmacies).toBe(0);
      expect(result.maxStaff).toBe(0);
      expect(result.enabledModules).toEqual([]);
      expect(result.features).toEqual({});
      expect(result.isActive).toBe(true);
      expect(result.isArchived).toBe(false);
    });

    it('should handle null and undefined values', () => {
      const apiResponse = {
        id: 'plan-1',
        name: 'Test',
        description: null,
        price: undefined,
        currency: null,
        enabledModules: null,
        features: undefined,
        isActive: null
      };

      const result = SubscriptionPlanMapper.fromApi(apiResponse);

      expect(result.description).toBe('');
      expect(result.price).toBe(0);
      expect(result.currency).toBe('USD');
      expect(result.enabledModules).toEqual([]);
      expect(result.features).toEqual({});
      expect(result.isActive).toBe(true);
    });

    it('should convert numbers from strings', () => {
      const apiResponse = {
        id: 'plan-1',
        name: 'Test',
        price: '299',
        maxPharmacies: '5',
        maxStaff: '50'
      };

      const result = SubscriptionPlanMapper.fromApi(apiResponse);

      expect(result.price).toBe(299);
      expect(result.maxPharmacies).toBe(5);
      expect(result.maxStaff).toBe(50);
    });

    it('should handle invalid date strings', () => {
      const apiResponse = {
        id: 'plan-1',
        name: 'Test',
        createdAt: 'invalid-date',
        updatedAt: 'also-invalid'
      };

      const result = SubscriptionPlanMapper.fromApi(apiResponse);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(isNaN(result.createdAt.getTime())).toBe(false);
      expect(isNaN(result.updatedAt.getTime())).toBe(false);
    });

    it('should handle missing date fields', () => {
      const apiResponse = {
        id: 'plan-1',
        name: 'Test'
      };

      const result = SubscriptionPlanMapper.fromApi(apiResponse);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should preserve array types for enabledModules', () => {
      const apiResponse = {
        id: 'plan-1',
        name: 'Test',
        enabledModules: ['inventory', 'hr', 'finance']
      };

      const result = SubscriptionPlanMapper.fromApi(apiResponse);

      expect(Array.isArray(result.enabledModules)).toBe(true);
      expect(result.enabledModules.length).toBe(3);
      expect(result.enabledModules).toEqual(['inventory', 'hr', 'finance']);
    });

    it('should handle non-array enabledModules', () => {
      const apiResponse = {
        id: 'plan-1',
        name: 'Test',
        enabledModules: 'not-an-array'
      };

      const result = SubscriptionPlanMapper.fromApi(apiResponse);

      expect(Array.isArray(result.enabledModules)).toBe(true);
      expect(result.enabledModules).toEqual([]);
    });

    it('should preserve object types for features', () => {
      const apiResponse = {
        id: 'plan-1',
        name: 'Test',
        features: {
          apiAccess: true,
          prioritySupport: true,
          customReports: false
        }
      };

      const result = SubscriptionPlanMapper.fromApi(apiResponse);

      expect(typeof result.features).toBe('object');
      expect(result.features.apiAccess).toBe(true);
      expect(result.features.prioritySupport).toBe(true);
      expect(result.features.customReports).toBe(false);
    });

    it('should handle non-object features', () => {
      const apiResponse = {
        id: 'plan-1',
        name: 'Test',
        features: 'not-an-object'
      };

      const result = SubscriptionPlanMapper.fromApi(apiResponse);

      expect(typeof result.features).toBe('object');
      expect(result.features).toEqual({});
    });
  });
});

