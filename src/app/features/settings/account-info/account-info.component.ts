import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { PharmacyContextService } from '../../../core/services/pharmacy-context.service';
import { PharmacyStaffService } from '../../../core/services/pharmacy-staff.service';
import { FormWrapperComponent } from '../../../shared/components/form-wrapper/form-wrapper.component';

@Component({
  selector: 'app-account-info',
  standalone: true,
  imports: [CommonModule, FormWrapperComponent],
  template: `
    <app-form-wrapper title="Account Information" subtitle="View your account details and subscription information">
      <div class="space-y-6">
        <!-- Subscription Information -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Subscription Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-4 bg-gray-50 rounded-[var(--radius-md)]">
              <label class="block text-sm font-medium text-gray-500 mb-1">Subscription Start Date</label>
              <p class="text-lg font-semibold text-gray-900">{{ subscriptionStartDate | date:'longDate' }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-[var(--radius-md)]">
              <label class="block text-sm font-medium text-gray-500 mb-1">Subscription End Date</label>
              <p class="text-lg font-semibold text-gray-900">{{ subscriptionEndDate | date:'longDate' }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-[var(--radius-md)]" [class.bg-yellow-50]="daysRemaining <= 30" [class.bg-red-50]="daysRemaining <= 7">
              <label class="block text-sm font-medium text-gray-500 mb-1">Days Remaining</label>
              <p class="text-lg font-semibold" [class.text-yellow-700]="daysRemaining <= 30" [class.text-red-700]="daysRemaining <= 7" [class.text-gray-900]="daysRemaining > 30">
                {{ daysRemaining }} {{ daysRemaining === 1 ? 'day' : 'days' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Account Statistics -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Account Statistics</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="p-4 bg-gray-50 rounded-[var(--radius-md)]">
              <label class="block text-sm font-medium text-gray-500 mb-1">Total Pharmacies</label>
              <p class="text-lg font-semibold text-gray-900">{{ pharmacyCount }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-[var(--radius-md)]">
              <label class="block text-sm font-medium text-gray-500 mb-1">Total Staff Members</label>
              <p class="text-lg font-semibold text-gray-900">{{ totalStaffCount }}</p>
            </div>
          </div>
        </div>
      </div>
    </app-form-wrapper>
  `,
  styles: []
})
export class AccountInfoComponent implements OnInit {
  private authService = inject(AuthService);
  private pharmacyContextService = inject(PharmacyContextService);
  private pharmacyStaffService = inject(PharmacyStaffService);

  subscriptionStartDate = new Date();
  subscriptionEndDate = new Date();
  daysRemaining = 0;
  pharmacyCount = 0;
  totalStaffCount = 0;
  loading = false;

  ngOnInit(): void {
    this.loadAccountInfo();
  }

  loadAccountInfo(): void {
    this.loading = true;
    
    // Mock subscription dates (in real app, this would come from an API)
    this.subscriptionStartDate = new Date('2024-01-01');
    this.subscriptionEndDate = new Date('2025-12-31');
    this.calculateDaysRemaining();

    // Get pharmacy count
    const user = this.authService.getCurrentUser();
    if (user?.pharmacies) {
      this.pharmacyCount = user.pharmacies.length;
    } else if (user?.pharmacyId) {
      this.pharmacyCount = 1;
    }

    // Get total staff count across all pharmacies
    this.pharmacyStaffService.getAll({ page: 1, pageSize: 1000 }).subscribe({
      next: (response) => {
        this.totalStaffCount = response.total;
        this.loading = false;
      },
      error: () => {
        this.totalStaffCount = 0;
        this.loading = false;
      }
    });
  }

  calculateDaysRemaining(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(this.subscriptionEndDate);
    endDate.setHours(0, 0, 0, 0);
    
    const diffTime = endDate.getTime() - today.getTime();
    this.daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (this.daysRemaining < 0) {
      this.daysRemaining = 0;
    }
  }
}







