import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CoreApiService } from './core-api.service';
import { EndpointResolverService } from './endpoint-resolver.service';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

describe('CoreApiService', () => {
  let service: CoreApiService;
  let httpMock: HttpTestingController;
  let endpointResolver: EndpointResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CoreApiService, EndpointResolverService]
    });

    service = TestBed.inject(CoreApiService);
    httpMock = TestBed.inject(HttpTestingController);
    endpointResolver = TestBed.inject(EndpointResolverService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('auth_token');
  });

  describe('GET requests', () => {
    it('should make GET request and return ApiResponse', (done) => {
      const testData = { id: '1', name: 'Test' };
      const mockResponse: ApiResponse<typeof testData> = {
        success: true,
        message: 'Success',
        data: testData,
        errors: []
      };

      service.get<typeof testData>('test-endpoint').subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data).toEqual(testData);
        done();
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/api/${environment.platformPrefix}/${environment.apiVersion}/test-endpoint`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should include query parameters in GET request', (done) => {
      const params = { page: 1, pageSize: 10 };
      const mockResponse: ApiResponse<any> = {
        success: true,
        message: 'Success',
        data: null,
        errors: []
      };

      service.get('test-endpoint', params).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(
        request => request.url.includes('test-endpoint') && 
                   request.params.get('page') === '1' &&
                   request.params.get('pageSize') === '10'
      );
      req.flush(mockResponse);
    });

    it('should include Authorization header when token exists', (done) => {
      localStorage.setItem('auth_token', 'test-token');
      const mockResponse: ApiResponse<any> = {
        success: true,
        message: 'Success',
        data: null,
        errors: []
      };

      service.get('test-endpoint').subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/api/${environment.platformPrefix}/${environment.apiVersion}/test-endpoint`
      );
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      req.flush(mockResponse);
    });
  });

  describe('POST requests', () => {
    it('should make POST request with body', (done) => {
      const body = { name: 'Test' };
      const mockResponse: ApiResponse<any> = {
        success: true,
        message: 'Created',
        data: body,
        errors: []
      };

      service.post('test-endpoint', body).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data).toEqual(body);
        done();
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/api/${environment.platformPrefix}/${environment.apiVersion}/test-endpoint`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      req.flush(mockResponse);
    });
  });

  describe('PUT requests', () => {
    it('should make PUT request with body', (done) => {
      const body = { id: '1', name: 'Updated' };
      const mockResponse: ApiResponse<any> = {
        success: true,
        message: 'Updated',
        data: body,
        errors: []
      };

      service.put('test-endpoint', body).subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/api/${environment.platformPrefix}/${environment.apiVersion}/test-endpoint`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(body);
      req.flush(mockResponse);
    });
  });

  describe('DELETE requests', () => {
    it('should make DELETE request', (done) => {
      const mockResponse: ApiResponse<null> = {
        success: true,
        message: 'Deleted',
        data: null,
        errors: []
      };

      service.delete('test-endpoint').subscribe(response => {
        expect(response.success).toBe(true);
        done();
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/api/${environment.platformPrefix}/${environment.apiVersion}/test-endpoint`
      );
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('Error handling', () => {
    it('should handle HTTP errors and transform to ApiResponse', (done) => {
      service.get('test-endpoint').subscribe({
        next: () => fail('should have failed'),
        error: (error: ApiResponse<any>) => {
          expect(error.success).toBe(false);
          expect(error.errors.length).toBeGreaterThan(0);
          done();
        }
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/api/${environment.platformPrefix}/${environment.apiVersion}/test-endpoint`
      );
      req.flush(
        { message: 'Not Found' },
        { status: 404, statusText: 'Not Found' }
      );
    });

    it('should preserve ApiResponse format from error response', (done) => {
      const errorResponse: ApiResponse<null> = {
        success: false,
        message: 'Validation failed',
        data: null,
        errors: [{ code: 'VALIDATION_ERROR', message: 'Invalid input' }]
      };

      service.get('test-endpoint').subscribe({
        next: () => fail('should have failed'),
        error: (error: ApiResponse<any>) => {
          expect(error.success).toBe(false);
          expect(error.errors[0].code).toBe('VALIDATION_ERROR');
          done();
        }
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/api/${environment.platformPrefix}/${environment.apiVersion}/test-endpoint`
      );
      req.flush(errorResponse, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('Pharmacy endpoints', () => {
    it('should use pharmacy prefix when usePharmacy is true', (done) => {
      const mockResponse: ApiResponse<any> = {
        success: true,
        message: 'Success',
        data: null,
        errors: []
      };

      service.get('test-endpoint', undefined, true).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/api/pharmacy/${environment.apiVersion}/test-endpoint`
      );
      req.flush(mockResponse);
    });
  });
});

