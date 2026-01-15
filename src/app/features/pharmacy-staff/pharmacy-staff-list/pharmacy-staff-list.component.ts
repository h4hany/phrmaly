import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PharmacyStaffService } from '../../../core/services/pharmacy-staff.service';
import { PharmacyStaff } from '../../../core/models/pharmacy-staff.model';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-pharmacy-staff-list',
  standalone: true,
  imports: [CommonModule, ButtonComponent, TableComponent, ModalComponent, AlertComponent, TranslatePipe],
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
            Add New Staff
          </app-button>
        </div>
      </div>

      <!-- Table -->
      <app-table
        [columns]="columns"
        [data]="staff"
        [pagination]="pagination"
        emptyMessage="No staff members found"
        [loading]="loading"
        rowIdKey="id"
      >
        <ng-template #actionTemplate let-row>
          <div class="flex items-center gap-2">
            <button
              class="p-1 text-gray-600 hover:text-gray-900"
              [title]="'common.view' | translate"
              (click)="viewStaff(row.id)"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              class="p-1 text-gray-600 hover:text-red-600"
              [title]="'common.delete' | translate"
              (click)="confirmDelete(row)"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button
              class="p-1 text-gray-600 hover:text-gray-900"
              [title]="'common.edit' | translate"
              (click)="editStaff(row.id)"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </ng-template>
      </app-table>

      <!-- Delete Confirmation Modal -->
      <app-modal
        #deleteModal
        title="Delete Staff Member"
        [showFooter]="true"
        [confirmText]="'common.delete' | translate"
        [confirmLoading]="deleting"
        (confirmed)="deleteStaff()"
      >
        <p>Are you sure you want to delete <strong>{{ selectedStaffName }}</strong>? This action cannot be undone.</p>
      </app-modal>
    </div>
  `,
  styles: []
})
export class PharmacyStaffListComponent implements OnInit {
  private router = inject(Router);
  private pharmacyStaffService = inject(PharmacyStaffService);

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

  columns: TableColumn[] = [
    { key: 'fullName', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone', sortable: false },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
  ];

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
      'account_owner': 'Account Owner',
      'pharmacy_manager': 'Manager',
      'pharmacy_staff': 'Staff'
    };
    return roleMap[role] || role;
  }
}





