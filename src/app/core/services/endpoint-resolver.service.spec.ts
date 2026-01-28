import { TestBed } from '@angular/core/testing';
import { EndpointResolverService } from './endpoint-resolver.service';
import { environment } from '../../../environments/environment';

describe('EndpointResolverService', () => {
  let service: EndpointResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EndpointResolverService]
    });
    service = TestBed.inject(EndpointResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('resolve', () => {
    it('should build platform endpoint URL correctly', () => {
      const path = 'subscription-plans';
      const expected = `${environment.apiBaseUrl}/api/${environment.platformPrefix}/${environment.apiVersion}/${path}`;
      
      const result = service.resolve(path);
      
      expect(result).toBe(expected);
    });

    it('should handle nested paths', () => {
      const path = 'admins/123/roles';
      const expected = `${environment.apiBaseUrl}/api/${environment.platformPrefix}/${environment.apiVersion}/${path}`;
      
      const result = service.resolve(path);
      
      expect(result).toBe(expected);
    });
  });

  describe('resolvePharmacy', () => {
    it('should build pharmacy endpoint URL correctly', () => {
      const path = 'invoices';
      const expected = `${environment.apiBaseUrl}/api/pharmacy/${environment.apiVersion}/${path}`;
      
      const result = service.resolvePharmacy(path);
      
      expect(result).toBe(expected);
    });
  });
});

