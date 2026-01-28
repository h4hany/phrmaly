import { InvoiceMapper } from './invoice.mapper';
import { Invoice } from '../../core/models/platform.model';

describe('InvoiceMapper', () => {
  describe('fromApi', () => {
    it('should map complete API response to Invoice', () => {
      const apiResponse = {
        id: 'inv-1',
        subscriptionId: 'sub-1',
        accountId: 'acc-1',
        invoiceNumber: 'INV-2024-001',
        amount: 299.99,
        currency: 'USD',
        status: 'paid',
        dueDate: '2024-01-15T00:00:00Z',
        paidAt: '2024-01-10T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      };

      const result = InvoiceMapper.fromApi(apiResponse);

      expect(result).toBeInstanceOf(Object);
      expect(result.id).toBe('inv-1');
      expect(result.subscriptionId).toBe('sub-1');
      expect(result.accountId).toBe('acc-1');
      expect(result.invoiceNumber).toBe('INV-2024-001');
      expect(result.amount).toBe(299.99);
      expect(result.currency).toBe('USD');
      expect(result.status).toBe('paid');
      expect(result.dueDate).toBeInstanceOf(Date);
      expect(result.paidAt).toBeInstanceOf(Date);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should convert all date strings to Date objects', () => {
      const apiResponse = {
        id: 'inv-1',
        subscriptionId: 'sub-1',
        accountId: 'acc-1',
        invoiceNumber: 'INV-001',
        amount: 299,
        dueDate: '2024-01-15T00:00:00Z',
        paidAt: '2024-01-10T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      };

      const result = InvoiceMapper.fromApi(apiResponse);

      expect(result.dueDate).toBeInstanceOf(Date);
      expect(result.paidAt).toBeInstanceOf(Date);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.dueDate.getTime()).toBe(new Date('2024-01-15T00:00:00Z').getTime());
      expect(result.paidAt?.getTime()).toBe(new Date('2024-01-10T00:00:00Z').getTime());
    });

    it('should handle Date objects in API response', () => {
      const dueDate = new Date('2024-01-15');
      const paidAt = new Date('2024-01-10');
      const apiResponse = {
        id: 'inv-1',
        subscriptionId: 'sub-1',
        accountId: 'acc-1',
        invoiceNumber: 'INV-001',
        amount: 299,
        dueDate,
        paidAt
      };

      const result = InvoiceMapper.fromApi(apiResponse);

      expect(result.dueDate).toBe(dueDate);
      expect(result.paidAt).toBe(paidAt);
    });

    it('should handle optional paidAt field', () => {
      const apiResponseWithPaidAt = {
        id: 'inv-1',
        subscriptionId: 'sub-1',
        accountId: 'acc-1',
        invoiceNumber: 'INV-001',
        amount: 299,
        dueDate: '2024-01-15T00:00:00Z',
        paidAt: '2024-01-10T00:00:00Z'
      };

      const apiResponseWithoutPaidAt = {
        id: 'inv-1',
        subscriptionId: 'sub-1',
        accountId: 'acc-1',
        invoiceNumber: 'INV-001',
        amount: 299,
        dueDate: '2024-01-15T00:00:00Z'
      };

      const resultWithPaidAt = InvoiceMapper.fromApi(apiResponseWithPaidAt);
      const resultWithoutPaidAt = InvoiceMapper.fromApi(apiResponseWithoutPaidAt);

      expect(resultWithPaidAt.paidAt).toBeInstanceOf(Date);
      expect(resultWithoutPaidAt.paidAt).toBeUndefined();
    });

    it('should provide default values for missing fields', () => {
      const apiResponse = {
        id: 'inv-1'
      };

      const result = InvoiceMapper.fromApi(apiResponse);

      expect(result.subscriptionId).toBe('');
      expect(result.accountId).toBe('');
      expect(result.invoiceNumber).toBe('');
      expect(result.amount).toBe(0);
      expect(result.currency).toBe('USD');
      expect(result.status).toBe('draft');
      expect(result.paidAt).toBeUndefined();
    });

    it('should handle null and undefined values', () => {
      const apiResponse = {
        id: 'inv-1',
        subscriptionId: null,
        accountId: undefined,
        invoiceNumber: null,
        amount: undefined,
        currency: null,
        status: undefined,
        paidAt: null
      };

      const result = InvoiceMapper.fromApi(apiResponse);

      expect(result.subscriptionId).toBe('');
      expect(result.accountId).toBe('');
      expect(result.invoiceNumber).toBe('');
      expect(result.amount).toBe(0);
      expect(result.currency).toBe('USD');
      expect(result.status).toBe('draft');
      expect(result.paidAt).toBeUndefined();
    });

    it('should convert numbers from strings', () => {
      const apiResponse = {
        id: 'inv-1',
        subscriptionId: 'sub-1',
        accountId: 'acc-1',
        invoiceNumber: 'INV-001',
        amount: '299.99'
      };

      const result = InvoiceMapper.fromApi(apiResponse);

      expect(result.amount).toBe(299.99);
    });

    it('should handle invalid date strings', () => {
      const apiResponse = {
        id: 'inv-1',
        subscriptionId: 'sub-1',
        accountId: 'acc-1',
        invoiceNumber: 'INV-001',
        amount: 299,
        dueDate: 'invalid-date',
        paidAt: 'also-invalid',
        createdAt: 'invalid',
        updatedAt: 'invalid'
      };

      const result = InvoiceMapper.fromApi(apiResponse);

      expect(result.dueDate).toBeInstanceOf(Date);
      expect(result.paidAt).toBeInstanceOf(Date);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(isNaN(result.dueDate.getTime())).toBe(false);
      expect(isNaN(result.paidAt?.getTime() ?? NaN)).toBe(false);
    });

    it('should handle missing date fields', () => {
      const apiResponse = {
        id: 'inv-1',
        subscriptionId: 'sub-1',
        accountId: 'acc-1',
        invoiceNumber: 'INV-001',
        amount: 299
      };

      const result = InvoiceMapper.fromApi(apiResponse);

      expect(result.dueDate).toBeInstanceOf(Date);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle null paidAt', () => {
      const apiResponse = {
        id: 'inv-1',
        subscriptionId: 'sub-1',
        accountId: 'acc-1',
        invoiceNumber: 'INV-001',
        amount: 299,
        dueDate: '2024-01-15T00:00:00Z',
        paidAt: null
      };

      const result = InvoiceMapper.fromApi(apiResponse);

      expect(result.paidAt).toBeUndefined();
    });

    it('should handle empty string paidAt', () => {
      const apiResponse = {
        id: 'inv-1',
        subscriptionId: 'sub-1',
        accountId: 'acc-1',
        invoiceNumber: 'INV-001',
        amount: 299,
        dueDate: '2024-01-15T00:00:00Z',
        paidAt: ''
      };

      const result = InvoiceMapper.fromApi(apiResponse);

      expect(result.paidAt).toBeUndefined();
    });

    it('should preserve all string fields', () => {
      const apiResponse = {
        id: 'inv-1',
        subscriptionId: 'sub-1',
        accountId: 'acc-1',
        invoiceNumber: 'INV-2024-001',
        currency: 'EUR',
        status: 'open'
      };

      const result = InvoiceMapper.fromApi(apiResponse);

      expect(result.id).toBe('inv-1');
      expect(result.subscriptionId).toBe('sub-1');
      expect(result.accountId).toBe('acc-1');
      expect(result.invoiceNumber).toBe('INV-2024-001');
      expect(result.currency).toBe('EUR');
      expect(result.status).toBe('open');
    });
  });
});

