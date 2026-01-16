import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileCardComponent } from '../../../shared/components/profile-card/profile-card.component';
import { ReferralsService } from '../referrals-list/referrals.service';
import { Referral } from '../../../core/models/referral.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-referral-detail',
  standalone: true,
  imports: [CommonModule, ProfileCardComponent, TranslatePipe],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <button (click)="router.navigate(['/growth/referrals'])" class="text-sm text-gray-600 hover:text-gray-900">
          ← {{ 'common.back' | translate }}
        </button>
      </div>

      @if (referral) {
        <app-profile-card
          [title]="referral.doctorName || 'Unknown Doctor'"
          [subtitle]="'Referral ID: ' + referral.id"
        >
          <div class="mt-4 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm text-gray-600">{{ 'referrals.patient' | translate }}</label>
                <p class="font-medium">{{ referral.patientName }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-600">{{ 'referrals.revenue' | translate }}</label>
                <p class="font-medium">{{ formatRevenue(referral.revenue) }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-600">{{ 'referrals.date' | translate }}</label>
                <p class="font-medium">{{ formatDate(referral.referralDate) }}</p>
              </div>
            </div>
          </div>
        </app-profile-card>
      } @else if (loading) {
        <div class="text-center py-12">
          <p>{{ 'common.loading' | translate }}</p>
        </div>
      } @else {
        <div class="text-center py-12">
          <p>{{ 'referrals.notFound' | translate }}</p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class ReferralDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private referralsService = inject(ReferralsService);
  router = inject(Router);

  referral: Referral | null = null;
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadReferral(id);
    }
  }

  loadReferral(id: string): void {
    this.loading = true;
    this.referralsService.getReferralById(id).subscribe({
      next: (referral) => {
        this.referral = referral;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  formatRevenue(revenue: number): string {
    return revenue.toFixed(2);
  }
}
