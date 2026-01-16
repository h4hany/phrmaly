/**
 * Attendance & Shift System Component
 * 
 * Classification: NEW PAGE + SYSTEM EXTENSION
 * 
 * Business Purpose: Replace external attendance machines and track actual working hours vs sales performance
 */

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../../core/services/attendance.service';
import { AttendanceRecord, Shift } from '../../../core/models/hr.model';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { AttendanceStatusTagComponent } from '../../../shared/components/attendance-status-tag/attendance-status-tag.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { ChartComponent } from '../../../shared/components/chart/chart.component';
import { PharmacyStaffService } from '../../../core/services/pharmacy-staff.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableComponent,
    ButtonComponent,
    TranslatePipe,
    StatCardComponent,
    ChartComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-[var(--text-primary)]">{{ 'hr.attendance.title' | translate }}</h1>
        <app-button variant="primary" (onClick)="showCheckInModal = true">
          <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ 'hr.attendance.checkIn' | translate }}
        </app-button>
      </div>

      <!-- Today's Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <app-stat-card
          [label]="'hr.attendance.onShift'"
          [value]="todayStats.onShift"
          [icon]="'users'"
        />
        <app-stat-card
          [label]="'hr.attendance.late'"
          [value]="todayStats.late"
          [icon]="'clock'"
        />
        <app-stat-card
          [label]="'hr.attendance.absent'"
          [value]="todayStats.absent"
          [icon]="'x-circle'"
        />
        <app-stat-card
          [label]="'hr.attendance.present'"
          [value]="todayStats.present"
          [icon]="'check-circle'"
        />
      </div>

      <!-- Filters -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'hr.attendance.staff' | translate }}</label>
            <select
              [(ngModel)]="filters.staffId"
              class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
            >
              <option value="">{{ 'common.all' | translate }}</option>
              @for (staff of staffList; track staff.id) {
                <option [value]="staff.id">{{ staff.fullName }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'hr.attendance.startDate' | translate }}</label>
            <input
              type="date"
              [(ngModel)]="filters.startDate"
              class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'hr.attendance.endDate' | translate }}</label>
            <input
              type="date"
              [(ngModel)]="filters.endDate"
              class="w-full px-4 py-2 border border-[var(--border-color)] rounded-[var(--radius-md)] text-sm bg-[var(--card-bg)] text-[var(--text-primary)]"
            />
          </div>
          <div class="flex items-end">
            <app-button variant="primary" size="sm" (onClick)="applyFilters()">
              {{ 'common.search' | translate }}
            </app-button>
          </div>
        </div>
      </div>

      <!-- Attendance Table -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
        <app-table
          [columns]="columns"
          [data]="attendanceRecords"
          [pagination]="pagination"
          [loading]="loading"
          [emptyMessage]="'hr.attendance.noRecords' | translate"
          (onPageChange)="onPageChange($event)"
        />
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
          <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'hr.attendance.trend' | translate }}</h3>
          <app-chart [type]="'line'" [data]="attendanceTrendData" [options]="chartOptions" />
        </div>
        <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
          <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'hr.attendance.lateByStaff' | translate }}</h3>
          <app-chart [type]="'bar'" [data]="lateByStaffData" [options]="chartOptions" />
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AttendanceComponent implements OnInit {
  private attendanceService = inject(AttendanceService);
  private staffService = inject(PharmacyStaffService);

  loading = false;
  showCheckInModal = false;
  attendanceRecords: AttendanceRecord[] = [];
  staffList: any[] = [];

  filters = {
    staffId: '',
    startDate: '',
    endDate: ''
  };

  todayStats = {
    onShift: 0,
    late: 0,
    absent: 0,
    present: 0
  };

  pagination = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  };

  columns: TableColumn[] = [
    { key: 'date', label: 'hr.attendance.date', sortable: true },
    { key: 'staffName', label: 'hr.attendance.staff', sortable: true },
    { key: 'checkInTime', label: 'hr.attendance.checkIn', sortable: true },
    { key: 'checkOutTime', label: 'hr.attendance.checkOut', sortable: true },
    { key: 'totalHours', label: 'hr.attendance.hours', sortable: true },
    { key: 'status', label: 'hr.attendance.status', sortable: true }
  ];

  attendanceTrendData: any = {};
  lateByStaffData: any = {};
  chartOptions: any = {};

  ngOnInit(): void {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    this.filters.startDate = startOfMonth.toISOString().split('T')[0];
    this.filters.endDate = today.toISOString().split('T')[0];

    this.loadStaff();
    this.loadAttendance();
    this.loadTodayStats();
  }

  loadStaff(): void {
    this.staffService.getAll({ page: 1, pageSize: 100 }).subscribe({
      next: (response) => {
        this.staffList = response.data;
      }
    });
  }

  loadAttendance(): void {
    this.loading = true;
    const params: any = {
      page: this.pagination.page,
      pageSize: this.pagination.pageSize
    };

    if (this.filters.staffId) {
      params.staffId = this.filters.staffId;
    }

    if (this.filters.startDate) {
      params.startDate = new Date(this.filters.startDate);
    }

    if (this.filters.endDate) {
      params.endDate = new Date(this.filters.endDate);
    }

    this.attendanceService.getAttendanceRecords(params).subscribe({
      next: (response) => {
        this.attendanceRecords = response.data.map((record: any) => ({
          ...record,
          date: new Date(record.date).toLocaleDateString(),
          checkInTime: record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-',
          checkOutTime: record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '-',
          totalHours: record.totalHours ? `${record.totalHours}h` : '-',
          status: record.status
        }));
        this.pagination = {
          page: response.page,
          pageSize: response.pageSize,
          total: response.total,
          totalPages: response.totalPages
        };
        this.loading = false;
        this.loadCharts();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadTodayStats(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.attendanceService.getAttendanceRecords({
      startDate: today,
      endDate: today,
      page: 1,
      pageSize: 100
    }).subscribe({
      next: (response) => {
        const records = response.data;
        this.todayStats = {
          onShift: records.filter((r: any) => r.status === 'present' && !r.checkOutTime).length,
          late: records.filter((r: any) => r.status === 'late').length,
          absent: records.filter((r: any) => r.status === 'absent').length,
          present: records.filter((r: any) => r.status === 'present').length
        };
      }
    });
  }

  loadCharts(): void {
    // Mock chart data - in real app, aggregate from records
    this.attendanceTrendData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Attendance %',
        data: [95, 98, 97, 96, 99, 85, 90],
        borderColor: 'var(--primary-color)',
        backgroundColor: 'rgba(22, 101, 52, 0.1)'
      }]
    };

    this.lateByStaffData = {
      labels: this.staffList.slice(0, 5).map(s => s.fullName),
      datasets: [{
        label: 'Late Arrivals',
        data: [2, 5, 1, 3, 0],
        backgroundColor: 'rgba(245, 158, 11, 0.8)'
      }]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false
    };
  }

  applyFilters(): void {
    this.pagination.page = 1;
    this.loadAttendance();
  }

  onPageChange(page: number): void {
    this.pagination.page = page;
    this.loadAttendance();
  }
}

