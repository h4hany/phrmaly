import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PharmacyStaffService } from '../../../core/services/pharmacy-staff.service';
import { PharmacyStaff } from '../../../core/models/pharmacy-staff.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-pharmacy-staff-detail',
  standalone: true,
  imports: [CommonModule, ButtonComponent, AlertComponent, TranslatePipe],
  template: `
    <div class="space-y-[var(--spacing-gap)]">
      @if (errorMessage) {
        <app-alert type="error" [title]="errorMessage" />
      }

      @if (staff) {
        <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-[var(--spacing-card)]">
          <!-- Header Actions -->
          <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold text-[var(--text-primary)]">Staff Member Details</h1>
            <div class="flex gap-3">
              <app-button variant="outline" (onClick)="editStaff()">
                <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {{ 'common.edit' | translate }}
              </app-button>
              <app-button variant="outline" (onClick)="goBack()">
                <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {{ 'common.back' | translate }}
              </app-button>
            </div>
          </div>

          <!-- Personal Information -->
          <div class="mb-6 pb-6 border-b border-[var(--border-color)]">
            <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">Personal Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">Full Name</label>
                <p class="text-[var(--text-primary)] font-medium">{{ staff.fullName }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">Email</label>
                <p class="text-[var(--text-primary)]">{{ staff.email }}</p>
              </div>
              @if (staff.phone) {
                <div>
                  <label class="block text-sm font-medium text-[var(--card-text)] mb-1">Phone</label>
                  <p class="text-[var(--text-primary)]">{{ staff.phone }}</p>
                </div>
              }
              @if (staff.username) {
                <div>
                  <label class="block text-sm font-medium text-[var(--card-text)] mb-1">Username</label>
                  <p class="text-[var(--text-primary)]">{{ staff.username }}</p>
                </div>
              }
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">Role</label>
                <p class="text-[var(--text-primary)] capitalize">{{ getRoleLabel(staff.role) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">Status</label>
                <p class="text-[var(--text-primary)] capitalize">{{ staff.status }}</p>
              </div>
            </div>
          </div>

          <!-- Metadata -->
          <div class="pt-6 border-t border-[var(--border-color)]">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">Created At</label>
                <p class="text-[var(--text-primary)]">{{ staff.createdAt | date:'medium' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">Last Updated</label>
                <p class="text-[var(--text-primary)]">{{ staff.updatedAt | date:'medium' }}</p>
              </div>
            </div>
          </div>
        </div>
      } @else if (loading) {
        <div class="text-center py-12">
          <p class="text-[var(--card-text)]">Loading staff member details...</p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class PharmacyStaffDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pharmacyStaffService = inject(PharmacyStaffService);

  staff: PharmacyStaff | null = null;
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadStaff(id);
    } else {
      this.errorMessage = 'Staff member ID is required';
      this.loading = false;
    }
  }

  loadStaff(id: string): void {
    this.loading = true;
    this.errorMessage = '';
    this.pharmacyStaffService.getById(id).subscribe({
      next: (staff) => {
        this.staff = staff;
        this.loading = false;
        if (!staff) {
          this.errorMessage = 'Staff member not found';
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load staff member details';
        this.loading = false;
        console.error('Error loading staff:', error);
      }
    });
  }

  getRoleLabel(role: UserRole): string {
    const roleMap: { [key: string]: string } = {
      'account_owner': 'Account Owner',
      'pharmacy_manager': 'Pharmacy Manager',
      'pharmacy_staff': 'Pharmacy Staff'
    };
    return roleMap[role] || role;
  }

  editStaff(): void {
    if (this.staff) {
      this.router.navigate(['/pharmacy-staff', this.staff.id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/pharmacy-staff']);
  }
}





