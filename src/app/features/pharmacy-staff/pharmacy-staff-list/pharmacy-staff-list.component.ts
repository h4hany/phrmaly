import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PharmacyStaffService } from '../../../core/services/pharmacy-staff.service';
import { PharmacyStaff } from '../../../core/models/pharmacy-staff.model';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import { UserRole } from '../../../core/models/user.model';
import { ProfileCardComponent, ProfileBadge } from '../../../shared/components/profile-card/profile-card.component';

@Component({
  selector: 'app-pharmacy-staff-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent, ModalComponent, AlertComponent, TranslatePipe, ProfileCardComponent],
  template: `
    <div class="space-y-6">
      @if (errorMessage) {
        <app-alert type="error" [title]="errorMessage" />
      }

      <!-- Header Actions -->
      <div class="flex items-center justify-between gap-4">
        <div class="flex-1 max-w-lg">
          <div class="relative">
            <input
              type="text"
              [placeholder]="'common.search' | translate"
              [value]="searchQuery"
              (input)="searchQuery = $any($event.target).value; onSearch()"
              class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#166534] focus:border-[#166534]"
            />
            <svg class="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div class="flex gap-3">
          <app-button variant="outline">
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {{ 'common.filters' | translate }}
          </app-button>
          <app-button variant="outline">
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {{ 'common.export' | translate }}
          </app-button>
          <app-button variant="primary" (onClick)="navigateToNew()">
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ 'staff.addNew' | translate }}
          </app-button>
        </div>
      </div>

      <!-- Cards Grid -->
      @if (loading) {
        <div class="flex items-center justify-center py-12">
          <div class="text-gray-500">{{ 'staff.loading' | translate }}</div>
        </div>
      } @else if (staff.length === 0) {
        <div class="flex flex-col items-center justify-center py-12 text-gray-500">
          <svg class="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p class="text-lg font-medium">{{ 'staff.noMembers' | translate }}</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (member of staff; track member.id) {
            <app-profile-card
              [avatar]="member.avatarUrl"
              [name]="member.fullName"
              [role]="getRoleLabel(member.role)"
              [email]="member.email"
              [phone]="member.phone"
              [joinedAt]="member.createdAt"
              [badges]="getBadges(member)"
              [status]="member.status"
              (view)="viewStaff(member.id)"
              (edit)="editStaff(member.id)"
              (delete)="confirmDelete(member)"
            ></app-profile-card>
          }
        </div>
      }

      <!-- Delete Confirmation Modal -->
      <app-modal
        #deleteModal
        [title]="'staff.delete' | translate"
        [showFooter]="true"
        [confirmText]="'common.delete' | translate"
        [confirmLoading]="deleting"
        (confirmed)="deleteStaff()"
      >
        <p>{{ 'staff.deleteConfirm' | translate }} <strong>{{ selectedStaffName }}</strong>? {{ 'modal.cannotUndo' | translate }}</p>
      </app-modal>
    </div>
  `,
  styles: []
})
export class PharmacyStaffListComponent implements OnInit {
  private router = inject(Router);
  private pharmacyStaffService = inject(PharmacyStaffService);
  private translationService = inject(TranslationService);

  @ViewChild('deleteModal') deleteModal!: ModalComponent;

  staff: PharmacyStaff[] = [];
  loading = false;
  errorMessage = '';
  searchQuery = '';
  deleting = false;
  selectedStaffId: string | null = null;
  selectedStaffName = '';

  pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  };

  ngOnInit(): void {
    this.loadStaff();
  }

  loadStaff(): void {
    this.loading = true;
    this.pharmacyStaffService.getAll({
      page: this.pagination.page,
      pageSize: this.pagination.pageSize
    }).subscribe({
      next: (response) => {
        this.staff = response.data;
        this.pagination = {
          page: response.page,
          pageSize: response.pageSize,
          total: response.total,
          totalPages: response.totalPages
        };
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load staff members';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.pharmacyStaffService.search(this.searchQuery).subscribe({
        next: (results) => {
          this.staff = results;
          this.pagination = {
            page: 1,
            pageSize: 10,
            total: results.length,
            totalPages: Math.ceil(results.length / 10)
          };
        },
        error: () => {
          this.errorMessage = 'Search failed';
        }
      });
    } else {
      this.loadStaff();
    }
  }

  navigateToNew(): void {
    this.router.navigate(['/pharmacy-staff', 'new']);
  }

  viewStaff(id: string): void {
    this.router.navigate(['/pharmacy-staff', id]);
  }

  editStaff(id: string): void {
    this.router.navigate(['/pharmacy-staff', id, 'edit']);
  }

  confirmDelete(staff: PharmacyStaff): void {
    this.selectedStaffId = staff.id;
    this.selectedStaffName = staff.fullName;
    this.deleteModal.open();
  }

  deleteStaff(): void {
    if (!this.selectedStaffId) return;

    this.deleting = true;
    this.pharmacyStaffService.delete(this.selectedStaffId).subscribe({
      next: (success) => {
        if (success) {
          this.deleteModal.close();
          this.loadStaff();
          this.selectedStaffId = null;
          this.selectedStaffName = '';
        } else {
          this.errorMessage = 'Failed to delete staff member';
        }
        this.deleting = false;
      },
      error: () => {
        this.errorMessage = 'Failed to delete staff member';
        this.deleting = false;
      }
    });
  }

  getRoleLabel(role: UserRole): string {
    const roleMap: { [key: string]: string } = {
      'account_owner': 'staff.accountOwner',
      'pharmacy_manager': 'staff.pharmacyManager',
      'pharmacy_staff': 'staff.pharmacyStaff'
    };
    const key = roleMap[role] || role;
    return this.translationService.translate(key) || role;
  }

  getBadges(member: PharmacyStaff): ProfileBadge[] {
    const badges: ProfileBadge[] = [];
    
    // Add role badge
    if (member.role === UserRole.PHARMACY_MANAGER) {
      badges.push({ label: 'Manager', variant: 'info' });
    } else if (member.role === UserRole.ACCOUNT_OWNER) {
      badges.push({ label: 'Owner', variant: 'warning' });
    }
    
    return badges;
  }
}





