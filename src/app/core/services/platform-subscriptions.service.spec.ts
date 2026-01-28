import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PlatformSubscriptionsService } from './platform-subscriptions.service';
import { CoreApiService } from './core-api.service';
import { EndpointResolverService } from './endpoint-resolver.service';
import { ApiResponse, PaginatedApiResponse } from '../models/api-response.model';
import { SubscriptionPlan, Subscription, Invoice } from '../models/platform.model';
import { PLATFORM_ENDPOINTS } from '../constants/platform-endpoints';
import { environment } from '../../../environments/environment';

describe('PlatformSubscriptionsService', () => {
  let service: PlatformSubscriptionsService;
  let httpMock: HttpTestingController;
  let coreApi: CoreApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PlatformSubscriptionsService,
        CoreApiService,
        EndpointResolverService
      ]
    });

    service = TestBed.inject(PlatformSubscriptionsService);
    httpMock = TestBed.inject(HttpTestingController);
    coreApi = TestBed.inject(CoreApiService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getPlans', () => {
    it('should fetch subscription plans with pagination', (done) => {
      const mockPlans: SubscriptionPlan[] = [
        {
          id: '1',
          name: 'Professional',
          description: 'Test plan',
          tier: 'professional',
          price: 299,
          currency: 'USD',
          billingCycle: 'monthly',
          maxPharmacies: 5,
          maxStaff: 50,
          enabledModules: ['inventory'],
          features: {},
          isActive: true,
          isArchived: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ];

      const mockResponse: PaginatedApiResponse<SubscriptionPlan> = {
        success: true,
        message: 'Success',
        data: mockPlans,
        errors: [],
        meta: {
          pagination: {
            page: 1,
            pageSize: 10,
            totalItems: 1,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false
          }
        }
      };

      service.getPlans({ page: 1, pageSize: 10 }).subscribe(result => {
        expect(result.data.length).toBe(1);
        expect(result.data[0].name).toBe('Professional');
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        done();
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/api/${environment.platformPrefix}/${environment.apiVersion}/${PLATFORM_ENDPOINTS.plans.root}?page=1&pageSize=10`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle API errors', (done) => {
      const errorResponse: ApiResponse<SubscriptionPlan[]> = {
        success: false,
        message: 'Failed to fetch plans',
        data: null,
        errors: [{ code: 'ERROR', message: 'Failed to fetch plans' }]
      };

      service.getPlans().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toContain('Failed to fetch');
          done();
        }
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/api/${environment.platformPrefix}/${environment.apiVersion}/${PLATFORM_ENDPOINTS.plans.root}`
      );
      req.flush(errorResponse, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('getPlanById', () => {
    it('should fetch plan by ID', (done) => {
      const mockPlan: SubscriptionPlan = {
        id: '1',
        name: 'Professional',
        description: 'Test plan',
        tier: 'professional',
        price: 299,
        currency: 'USD',
        billingCycle: 'monthly',
        maxPharmacies: 5,
        maxStaff: 50,
        enabledModules: ['inventory'],
        features: {},
        isActive: true,
        isArchived: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };

      const mockResponse: ApiResponse<SubscriptionPlan> = {
        success: true,
        message: 'Success',
        data: mockPlan,
        errors: []
      };

      service.getPlanById('1').subscribe(plan => {
        expect(plan.id).toBe('1');
        expect(plan.name).toBe('Professional');
        done();
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/api/${environment.platformPrefix}/${environment.apiVersion}/${PLATFORM_ENDPOINTS.plans.byId('1')}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('createPlan', () => {
    it('should create subscription plan', (done) => {
      const newPlan = {
        name: 'Starter',
        description: 'New plan',
        tier: 'starter' as const,
        price: 99,
        currency: 'USD',
        billingCycle: 'monthly' as const,
        maxPharmacies: 1,
        maxStaff: 10,
        enabledModules: ['inventory'] as any[],
        features: {},
        isActive: true,
        isArchived: false
      };

      const mockResponse: ApiResponse<SubscriptionPlan> = {
        success: true,
        message: 'Created',
        data: {
          ...newPlan,
          id: '2',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        errors: []
      };

      service.createPlan(newPlan).subscribe(plan => {
        expect(plan.name).toBe('Starter');
        expect(plan.id).toBe('2');
        done();
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/api/${environment.platformPrefix}/${environment.apiVersion}/${PLATFORM_ENDPOINTS.plans.root}`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newPlan);
      req.flush(mockResponse);
    });
  });

  describe('updatePlan', () => {
    it('should update subscription plan', (done) => {
      const updates = { name: 'Updated Plan' };
      const mockResponse: ApiResponse<SubscriptionPlan> = {
        success: true,
        message: 'Updated',
        data: {
          id: '1',
          name: 'Updated Plan',
          description: 'Test',
          tier: 'professional',
          price: 299,
          currency: 'USD',
          billingCycle: 'monthly',
          maxPharmacies: 5,
          maxStaff: 50,
          enabledModules: [],
          features: {},
          isActive: true,
          isArchived: false,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-02')
        },
        errors: []
      };

      service.updatePlan('1', updates).subscribe(plan => {
        expect(plan.name).toBe('Updated Plan');
        done();
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/api/${environment.platformPrefix}/${environment.apiVersion}/${PLATFORM_ENDPOINTS.plans.byId('1')}`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updates);
      req.flush(mockResponse);
    });
  });

  describe('deletePlan', () => {
    it('should delete subscription plan', (done) => {
      const mockResponse: ApiResponse<void> = {
        success: true,
        message: 'Deleted',
        data: null,
        errors: []
      };

      service.deletePlan('1').subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/api/${environment.platformPrefix}/${environment.apiVersion}/${PLATFORM_ENDPOINTS.plans.byId('1')}`
      );
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('Date mapping', () => {
    it('should convert date strings to Date objects', (done) => {
      const mockResponse: ApiResponse<SubscriptionPlan> = {
        success: true,
        message: 'Success',
        data: {
          id: '1',
          name: 'Test',
          description: 'Test',
          tier: 'professional',
          price: 299,
          currency: 'USD',
          billingCycle: 'monthly',
          maxPharmacies: 5,
          maxStaff: 50,
          enabledModules: [],
          features: {},
          isActive: true,
          isArchived: false,
          createdAt: '2024-01-01T00:00:00Z' as any,
          updatedAt: '2024-01-02T00:00:00Z' as any
        },
        errors: []
      };

      service.getPlanById('1').subscribe(plan => {
        expect(plan.createdAt).toBeInstanceOf(Date);
        expect(plan.updatedAt).toBeInstanceOf(Date);
        done();
      });

      const req = httpMock.expectOne(
        `${environment.apiBaseUrl}/api/${environment.platformPrefix}/${environment.apiVersion}/${PLATFORM_ENDPOINTS.plans.byId('1')}`
      );
      req.flush(mockResponse);
    });
  });
});

