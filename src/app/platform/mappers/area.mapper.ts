import { Area } from '../../core/services/platform-areas.service';

/**
 * Area Mapper
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
export class AreaMapper {
  /**
   * Map API response to Area domain model
   * 
   * @param area - Raw API response (may be any/unknown)
   * @returns Area domain model
   */
  static fromApi(area: unknown): Area {
    const apiArea = area as any;

    return {
      id: apiArea.id ?? '',
      name: apiArea.name ?? '',
      cityId: apiArea.cityId ?? '',
      city: apiArea.city ? {
        id: apiArea.city.id ?? '',
        name: apiArea.city.name ?? '',
        countryId: apiArea.city.countryId ?? ''
      } : undefined,
      country: apiArea.country ? {
        id: apiArea.country.id ?? '',
        name: apiArea.country.name ?? '',
        code: apiArea.country.code ?? ''
      } : undefined,
      isActive: apiArea.isActive ?? true,
      createdAt: this.parseDate(apiArea.createdAt),
      updatedAt: this.parseDate(apiArea.updatedAt)
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

