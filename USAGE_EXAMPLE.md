# Platform Subscriptions Service - Usage Example

## Component Example

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { PlatformSubscriptionsService } from '../core/services/platform-subscriptions.service';
import { SubscriptionPlan } from '../core/models/platform.model';
import { PaginatedResponse, PaginationParams } from '../core/models/common.model';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  template: `
    <div>
      <h1>Subscription Plans</h1>
      
      @if (loading()) {
        <p>Loading...</p>
      } @else if (error()) {
        <p>Error: {{ error() }}</p>
      } @else {
        <div>
          @for (plan of plans(); track plan.id) {
            <div>
              <h3>{{ plan.name }}</h3>
              <p>{{ plan.description }}</p>
              <p>Price: {{ plan.price }} {{ plan.currency }}</p>
            </div>
          }
        </div>
        
        <div>
          <button (click)="loadPrevious()" [disabled]="!hasPrevious()">Previous</button>
          <span>Page {{ currentPage() }} of {{ totalPages() }}</span>
          <button (click)="loadNext()" [disabled]="!hasNext()">Next</button>
        </div>
      }
    </div>
  `
})
export class SubscriptionsComponent implements OnInit {
  private subscriptionsService = inject(PlatformSubscriptionsService);
  
  plans = signal<SubscriptionPlan[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  currentPage = signal(1);
  totalPages = signal(1);
  total = signal(0);

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(page: number = 1): void {
    this.loading.set(true);
    this.error.set(null);

    const params: PaginationParams = {
      page,
      pageSize: 10
    };

    this.subscriptionsService.getPlans(params).subscribe({
      next: (response) => {
        this.plans.set(response.data);
        this.currentPage.set(response.page);
        this.totalPages.set(response.totalPages);
        this.total.set(response.total);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  loadNext(): void {
    if (this.hasNext()) {
      this.loadPlans(this.currentPage() + 1);
    }
  }

  loadPrevious(): void {
    if (this.hasPrevious()) {
      this.loadPlans(this.currentPage() - 1);
    }
  }

  hasNext(): boolean {
    return this.currentPage() < this.totalPages();
  }

  hasPrevious(): boolean {
    return this.currentPage() > 1;
  }

  createPlan(): void {
    const newPlan = {
      name: 'Starter',
      description: 'For single pharmacies',
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

    this.subscriptionsService.createPlan(newPlan).subscribe({
      next: (plan) => {
        console.log('Plan created:', plan);
        this.loadPlans(); // Reload list
      },
      error: (err) => {
        this.error.set(err.message);
      }
    });
  }

  updatePlan(id: string): void {
    const updates = {
      name: 'Updated Plan Name'
    };

    this.subscriptionsService.updatePlan(id, updates).subscribe({
      next: (plan) => {
        console.log('Plan updated:', plan);
        this.loadPlans(); // Reload list
      },
      error: (err) => {
        this.error.set(err.message);
      }
    });
  }

  deletePlan(id: string): void {
    if (confirm('Are you sure you want to delete this plan?')) {
      this.subscriptionsService.deletePlan(id).subscribe({
        next: () => {
          console.log('Plan deleted');
          this.loadPlans(); // Reload list
        },
        error: (err) => {
          this.error.set(err.message);
        }
      });
    }
  }
}
```

## Architecture Flow

```
Component
  ↓
PlatformSubscriptionsService (Feature Service)
  ↓
CoreApiService (Global HTTP Wrapper)
  ↓
EndpointResolverService (URL Builder)
  ↓
Environment Config
```

## Key Features

1. **Type Safety**: All responses are strongly typed
2. **Error Handling**: Errors are automatically transformed to ApiResponse format
3. **Pagination**: Full pagination support with meta information
4. **Date Mapping**: Date strings automatically converted to Date objects
5. **Authentication**: JWT tokens automatically injected via interceptor
6. **No Hardcoded URLs**: All endpoints use constants from PLATFORM_ENDPOINTS

