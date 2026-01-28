import { Invoice } from '../../core/models/platform.model';

/**
 * Invoice Mapper
 * 
 * Pure class for transforming API responses to domain models.
 * 
 * Rules:
 * - Static methods only
 * - No Angular decorators
 * - No dependencies on HttpClient or services
 * - Handles null/undefined with defaults
 * - Converts all date fields (dueDate, paidAt, createdAt, updatedAt)
 * - Protects against missing fields
 */
export class InvoiceMapper {
  /**
   * Map API response to Invoice domain model
   * 
   * @param invoice - Raw API response (may be any/unknown)
   * @returns Invoice domain model
   */
  static fromApi(invoice: unknown): Invoice {
    const apiInvoice = invoice as any;

    return {
      id: apiInvoice.id ?? '',
      subscriptionId: apiInvoice.subscriptionId ?? '',
      accountId: apiInvoice.accountId ?? '',
      invoiceNumber: apiInvoice.invoiceNumber ?? '',
      amount: Number(apiInvoice.amount) || 0,
      currency: apiInvoice.currency ?? 'USD',
      status: apiInvoice.status ?? 'draft',
      dueDate: this.parseDate(apiInvoice.dueDate),
      paidAt: apiInvoice.paidAt ? this.parseDate(apiInvoice.paidAt) : undefined,
      createdAt: this.parseDate(apiInvoice.createdAt),
      updatedAt: this.parseDate(apiInvoice.updatedAt)
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

