import { Country } from '../../core/services/platform-countries.service';

/**
 * Country Mapper
 * 
 * Pure class for transforming API responses to domain models.
 * 
 * Rules:
 * - Static methods only
 * - No Angular decorators
 * - No dependencies on HttpClient or services
 * - Handles null/undefined with defaults
 * - Converts date strings to Date objects
 * - Protects against missing fields
 */
export class CountryMapper {
  /**
   * Map API response to Country domain model
   * 
   * @param country - Raw API response (may be any/unknown)
   * @returns Country domain model
   */
  static fromApi(country: unknown): Country {
    const apiCountry = country as any;

    return {
      id: apiCountry.id ?? '',
      name: apiCountry.name ?? '',
      code: apiCountry.code ?? '',
      isActive: apiCountry.isActive ?? true,
      createdAt: this.parseDate(apiCountry.createdAt),
      updatedAt: this.parseDate(apiCountry.updatedAt)
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

