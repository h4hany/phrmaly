import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Endpoint Resolver Service
 * 
 * Builds URLs from environment configuration.
 * This is the ONLY service that accesses environment directly.
 * 
 * Architecture:
 * - Environment Config → EndpointResolver → CoreApiService → Feature Services
 */
@Injectable({
  providedIn: 'root'
})
export class EndpointResolverService {
  /**
   * Resolve platform endpoint
   * Builds: {apiBaseUrl}/api/{platformPrefix}/{apiVersion}/{path}
   * 
   * Example:
   * - path: 'subscription-plans'
   * - Result: 'http://localhost:5000/api/platform/v1/subscription-plans'
   */
  resolve(path: string): string {
    return `${environment.apiBaseUrl}/api/${environment.platformPrefix}/${environment.apiVersion}/${path}`;
  }

  /**
   * Resolve pharmacy endpoint (for normal platform users)
   * Builds: {apiBaseUrl}/api/pharmacy/{apiVersion}/{path}
   */
  resolvePharmacy(path: string): string {
    return `${environment.apiBaseUrl}/api/pharmacy/${environment.apiVersion}/${path}`;
  }
}

