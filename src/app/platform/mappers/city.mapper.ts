import { City } from '../../core/services/platform-cities.service';
import { CountryMapper } from './country.mapper';

/**
 * City Mapper
 * 
 * Pure class for transforming API responses to domain models.
 * 
 * Rules:
 * - Static methods only
 * - No Angular decorators
 * - No dependencies on HttpClient or services
 * - Uses CountryMapper for nested country mapping
 * - Handles null/undefined with defaults
 * - Converts date strings to Date objects
 * - Protects against missing fields
 */
export class CityMapper {
  /**
   * Map API response to City domain model
   * 
   * @param city - Raw API response (may be any/unknown)
   * @returns City domain model
   */
  static fromApi(city: unknown): City {
    const apiCity = city as any;

    return {
      id: apiCity.id ?? '',
      name: apiCity.name ?? '',
      countryId: apiCity.countryId ?? '',
      country: apiCity.country ? {
        id: apiCity.country.id ?? '',
        name: apiCity.country.name ?? '',
        code: apiCity.country.code ?? ''
      } : undefined,
      isActive: apiCity.isActive ?? true,
      createdAt: this.parseDate(apiCity.createdAt),
      updatedAt: this.parseDate(apiCity.updatedAt)
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

