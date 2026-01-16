import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { ActionToolbarComponent } from '../../../shared/components/action-toolbar/action-toolbar.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { ProfileCardComponent } from '../../../shared/components/profile-card/profile-card.component';
import { ReferralsService } from './referrals.service';
import { Doctor, Referral } from '../../../core/models/referral.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-referrals-list',
  standalone: true,
  imports: [CommonModule, TableComponent, ActionToolbarComponent, StatCardComponent, ProfileCardComponent, TranslatePipe],
  template: `
    <div class="space-y-6">
      <app-action-toolbar
        title="referrals.title"
        [showSearch]="true"
        (onSearch)="handleSearch($event)"
      ></app-action-toolbar>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <app-stat-card
          label="referrals.totalReferrals"
          [value]="totalReferrals"
        ></app-stat-card>
        <app-stat-card
          label="referrals.totalRevenue"
          [value]="formatRevenue(totalRevenue)"
        ></app-stat-card>
        <app-stat-card
          label="referrals.totalDoctors"
          [value]="doctors.length"
        ></app-stat-card>
      </div>

      <!-- Top Doctors -->
      <div class="p-6 rounded-lg" style="background-color: var(--card-bg);">
        <h3 class="text-lg font-semibold mb-4">{{ 'referrals.topDoctors' | translate }}</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          @for (doctor of topDoctors; track doctor.id) {
            <app-profile-card
              [title]="doctor.name"
              [subtitle]="doctor.specialty || 'General'"
            >
              <div class="mt-4 space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ 'referrals.referrals' | translate }}</span>
                  <span class="font-medium">{{ doctor.totalReferrals }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ 'referrals.revenue' | translate }}</span>
                  <span class="font-medium">{{ formatRevenue(doctor.totalRevenue) }}</span>
                </div>
              </div>
            </app-profile-card>
          }
        </div>
      </div>

      <!-- Referrals Table -->
      <app-table
        [columns]="columns"
        [data]="referrals"
        [pagination]="pagination"
        [loading]="loading"
        [emptyMessage]="'referrals.empty'"
        (onPageChange)="handlePageChange($event)"
      >
        <ng-template #actionTemplate let-referral>
          <div class="flex gap-2">
            <button
              (click)="viewDetail(referral.id)"
              class="text-sm px-3 py-1 rounded text-blue-600 hover:bg-blue-50"
            >
              {{ 'common.view' | translate }}
            </button>
          </div>
        </ng-template>
      </app-table>
    </div>
  `,
  styles: []
})
export class ReferralsListComponent implements OnInit {
  private referralsService = inject(ReferralsService);
  router = inject(Router);

  referrals: Referral[] = [];
  doctors: Doctor[] = [];
  topDoctors: Doctor[] = [];
  loading = false;
  pagination: any = null;
  totalReferrals = 0;
  totalRevenue = 0;

  columns: TableColumn[] = [
    { key: 'referralDate', label: 'referrals.date', sortable: true },
    { key: 'doctorName', label: 'referrals.doctor' },
    { key: 'patientName', label: 'referrals.patient' },
    { key: 'revenue', label: 'referrals.revenue', sortable: true }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.referralsService.getReferrals().subscribe({
      next: (referrals) => {
        this.referrals = referrals;
        this.totalReferrals = referrals.length;
        this.totalRevenue = referrals.reduce((sum, r) => sum + r.revenue, 0);
        this.loading = false;
      }
    });

    this.referralsService.getDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.topDoctors = [...doctors]
          .sort((a, b) => b.totalRevenue - a.totalRevenue)
          .slice(0, 3);
      }
    });
  }

  handlePageChange(page: number): void {
    if (this.pagination) {
      this.pagination.page = page;
      this.loadData();
    }
  }

  handleSearch(query: string): void {
    this.loadData();
  }

  viewDetail(id: string): void {
    this.router.navigate(['/growth/referrals', id]);
  }

  formatRevenue(revenue: number): string {
    return revenue.toFixed(2);
  }
}
