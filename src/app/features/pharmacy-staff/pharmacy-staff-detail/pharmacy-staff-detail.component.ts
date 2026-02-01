import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PharmacyStaffService, StaffPermissions } from '../../../core/services/pharmacy-staff.service';
import { PharmacyStaff } from '../../../core/models/pharmacy-staff.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { DateFormatPipe } from '../../../core/pipes/date-format.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import { UserRole } from '../../../core/models/user.model';
import { TabsComponent, TabComponent } from '../../../shared/components/tabs/tabs.component';
import { StaffKPICardComponent } from '../../../shared/components/staff-kpi-card/staff-kpi-card.component';
import { PerformanceScoreRingComponent } from '../../../shared/components/performance-score-ring/performance-score-ring.component';
import { TimelineComponent, TimelineEvent } from '../../../shared/components/timeline/timeline.component';
import { HRPerformanceService } from '../../../core/services/hr-performance.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { RiskBadgeComponent } from '../../../shared/components/risk-badge/risk-badge.component';
import { CheckboxInputComponent } from '../../../shared/components/input/checkbox-input.component';
import { AuthService } from '../../../core/services/auth.service';
import { PharmacyContextService } from '../../../core/services/pharmacy-context.service';

@Component({
  selector: 'app-pharmacy-staff-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent, 
    AlertComponent, 
    TranslatePipe,
    DateFormatPipe,
    TabsComponent,
    TabComponent,
    StaffKPICardComponent,
    PerformanceScoreRingComponent,
    TimelineComponent,
    RiskBadgeComponent,
    CheckboxInputComponent
  ],
  template: `
    <div class="space-y-[var(--spacing-gap)]">
      @if (errorMessage) {
        <app-alert type="error" [title]="errorMessage" />
      }

      @if (staff) {
        <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-[var(--spacing-card)]">
          <!-- Header Actions -->
          <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold text-[var(--text-primary)]">{{ 'staff.details' | translate }}</h1>
            <div class="flex gap-3">
              @if (canEditStaff()) {
                <app-button variant="outline" (onClick)="editStaff()">
                  <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {{ 'common.edit' | translate }}
                </app-button>
              }
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
            <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'staff.personalInfo' | translate }}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'staff.fullName' | translate }}</label>
                <p class="text-[var(--text-primary)] font-medium">{{ staff.fullName }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'staff.email' | translate }}</label>
                <p class="text-[var(--text-primary)]">{{ staff.email }}</p>
              </div>
              @if (staff.phone) {
                <div>
                  <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'staff.phone' | translate }}</label>
                  <p class="text-[var(--text-primary)]">{{ staff.phone }}</p>
                </div>
              }
              @if (staff.username) {
                <div>
                  <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'staff.username' | translate }}</label>
                  <p class="text-[var(--text-primary)]">{{ staff.username }}</p>
                </div>
              }
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'staff.role' | translate }}</label>
                <p class="text-[var(--text-primary)] capitalize">{{ getRoleLabel(staff.role) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'staff.status' | translate }}</label>
                <p class="text-[var(--text-primary)] capitalize">{{ (staff.status === 'active' ? 'staff.active' : 'staff.inactive') | translate }}</p>
              </div>
            </div>
          </div>

          <!-- Pharmacy Information -->
          @if (staff.pharmacyRoles && staff.pharmacyRoles.length > 0) {
            <div class="mb-6 pb-6 border-b border-[var(--border-color)]">
              <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'staff.pharmacies' | translate }}</h2>
              <div class="space-y-3">
                @for (pharmacyRole of staff.pharmacyRoles; track pharmacyRole.pharmacyId) {
                  <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div class="flex items-center gap-3">
                      <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <div>
                        <p class="text-[var(--text-primary)] font-medium">{{ pharmacyRole.pharmacyName }}</p>
                        <p class="text-sm text-[var(--card-text)]">{{ 'staff.role' | translate }}: {{ pharmacyRole.roleName }}</p>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Metadata -->
          <div class="pt-6 border-t border-[var(--border-color)]">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'staff.createdAt' | translate }}</label>
                <p class="text-[var(--text-primary)]">{{ staff.createdAt | dateFormat }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'staff.updatedAt' | translate }}</label>
                <p class="text-[var(--text-primary)]">{{ staff.updatedAt | dateFormat }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- HR Performance Dashboard -->
        @if (staff) {
          <app-tabs>
            <app-tab [title]="'staff.permissions' | translate" [active]="true">
              <div class="space-y-6 p-6">
                @if (loadingPermissions) {
                  <div class="text-center py-12">
                    <p class="text-[var(--card-text)]">{{ 'common.loading' | translate }}</p>
                  </div>
                } @else if (permissionsError) {
                  <app-alert type="error" [title]="permissionsError" />
                } @else if (staffPermissions) {
                  <form [formGroup]="permissionsForm" (ngSubmit)="savePermissions()">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      @for (module of staffPermissions.modules; track module.moduleCode) {
                        <div class="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                          <h4 class="text-lg font-semibold text-gray-800 mb-4">
                            {{ module.moduleName }}
                          </h4>
                          @for (group of getGroupedPermissions(module); track group.subResource) {
                            <div class="mb-6 last:mb-0">
                              @if (group.subResource !== 'General') {
                                <h5 class="text-sm font-medium text-gray-700 mb-3 capitalize">
                                  {{ group.subResource }}
                                </h5>
                              }
                              <div class="grid grid-cols-2 gap-2">
                                @for (permission of group.permissions; track permission.permissionId) {
                                  <app-checkbox-input
                                    [formControl]="getPermissionControl(permission.permissionId)"
                                    [checkboxOptions]="[{ value: true, label: getPermissionLabel(permission.permissionKey) }]"
                                    [label]="''"
                                  ></app-checkbox-input>
                                }
                              </div>
                            </div>
                          }
                        </div>
                      }
                    </div>
                    <div class="flex items-center justify-end gap-4 pt-8 border-t-2 border-gray-100 mt-6">
                      <app-button
                        type="button"
                        variant="outline"
                        size="lg"
                        (onClick)="cancelPermissionsEdit()"
                      >
                        {{ 'common.cancel' | translate }}
                      </app-button>
                      <app-button
                        type="submit"
                        variant="primary"
                        size="lg"
                        [disabled]="permissionsForm.invalid || savingPermissions"
                        [loading]="savingPermissions"
                      >
                        {{ 'common.save' | translate }}
                      </app-button>
                    </div>
                  </form>
                }
              </div>
            </app-tab>
            <app-tab [title]="'hr.performance.title' | translate">
              <div class="space-y-6 p-6">
                <!-- Performance KPIs -->
                @if (performanceMetrics) {
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <app-staff-kpi-card
                      [label]="'hr.performance.salesRevenue'"
                      [value]="performanceMetrics.sales.totalRevenue"
                      [unit]="'USD'"
                      [icon]="'chart'"
                      [trend]="performanceMetrics.sales.growthPercentage"
                    />
                    <app-staff-kpi-card
                      [label]="'hr.performance.totalInvoices'"
                      [value]="performanceMetrics.sales.totalInvoices"
                      [icon]="'receipt'"
                    />
                    <app-staff-kpi-card
                      [label]="'hr.performance.attendance'"
                      [value]="performanceMetrics.attendance.percentage"
                      [unit]="'%'"
                      [icon]="'calendar'"
                    />
                    <app-staff-kpi-card
                      [label]="'hr.performance.errors'"
                      [value]="performanceMetrics.errors.totalErrors"
                      [icon]="'alert'"
                    />
                  </div>

                  <!-- Performance Score & Risk -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
                      <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'hr.performance.overallScore' | translate }}</h3>
                      <div class="flex items-center justify-center">
                        <app-performance-score-ring
                          [score]="performanceMetrics.overallScore"
                          [label]="'hr.performance.grade'"
                        />
                      </div>
                      <div class="text-center mt-4">
                        <p class="text-2xl font-bold text-[var(--text-primary)]">{{ performanceMetrics.performanceGrade }}</p>
                      </div>
                    </div>

                    <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
                      <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'hr.performance.riskAssessment' | translate }}</h3>
                      <div class="flex items-center justify-center mb-4">
                        <app-risk-badge
                          [level]="performanceMetrics.riskLevel"
                          [score]="performanceMetrics.riskScore"
                        />
                      </div>
                      <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                          <span class="text-[var(--card-text)]">{{ 'hr.performance.suspiciousMovements' | translate }}</span>
                          <span class="font-medium text-[var(--text-primary)]">{{ performanceMetrics.inventory.suspiciousMovements }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-[var(--card-text)]">{{ 'hr.performance.totalMovements' | translate }}</span>
                          <span class="font-medium text-[var(--text-primary)]">{{ performanceMetrics.inventory.movements }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Activity Timeline -->
                  <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
                    <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'hr.performance.activityTimeline' | translate }}</h3>
                    <app-timeline [events]="timelineEvents" />
                  </div>
                } @else if (loadingPerformance) {
                  <div class="text-center py-12">
                    <p class="text-[var(--card-text)]">{{ 'common.loading' | translate }}</p>
                  </div>
                }
              </div>
            </app-tab>
          </app-tabs>
        }
      } @else if (loading) {
        <div class="text-center py-12">
          <p class="text-[var(--card-text)]">{{ 'staff.loadingDetails' | translate }}</p>
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
  private translationService = inject(TranslationService);
  private hrPerformanceService = inject(HRPerformanceService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private pharmacyContextService = inject(PharmacyContextService);

  staff: PharmacyStaff | null = null;
  loading = true;
  errorMessage = '';
  loadingPerformance = false;
  performanceMetrics: any = null;
  timelineEvents: TimelineEvent[] = [];
  
  // Permissions
  staffPermissions: StaffPermissions | null = null;
  loadingPermissions = false;
  permissionsError = '';
  permissionsForm!: FormGroup;
  savingPermissions = false;

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
        } else {
          this.loadPerformanceData(id);
          this.loadPermissions(id);
        }
      },
      error: (error) => {
        // Handle 403 Forbidden (access denied due to role hierarchy)
        if (error.status === 403 || error.message?.includes('ACCESS_DENIED')) {
          this.errorMessage = 'You do not have permission to view this staff member due to role hierarchy restrictions.';
        } else {
          this.errorMessage = error.message || 'Failed to load staff member details';
        }
        this.loading = false;
        console.error('Error loading staff:', error);
      }
    });
  }

  loadPerformanceData(staffId: string): void {
    if (!this.staff) {
      // Staff is still loading, performance data will be loaded after staff loads
      return;
    }

    // Use the staff member's pharmacyId instead of current pharmacy context
    const pharmacyId = this.staff.pharmacyId || 
                      (this.staff.pharmacyRoles && this.staff.pharmacyRoles.length > 0 
                        ? this.staff.pharmacyRoles[0].pharmacyId 
                        : null);
    
    if (!pharmacyId) {
      console.error('Staff member has no pharmacy assigned');
      this.loadingPerformance = false;
      return;
    }

    this.loadingPerformance = true;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    this.hrPerformanceService.getPerformanceMetrics(staffId, startDate, endDate, pharmacyId).subscribe({
      next: (metrics) => {
        this.performanceMetrics = metrics;
        this.loadingPerformance = false;
        this.loadActivityTimeline(staffId, pharmacyId);
      },
      error: (error) => {
        console.error('Error loading performance metrics:', error);
        this.loadingPerformance = false;
      }
    });
  }

  loadActivityTimeline(staffId: string, pharmacyId?: string): void {
    this.hrPerformanceService.getStaffActivities(staffId, 20, pharmacyId).subscribe({
      next: (activities) => {
        this.timelineEvents = activities.map(activity => ({
          id: activity.id,
          title: activity.description,
          timestamp: activity.timestamp,
          type: activity.type === 'sale' ? 'success' : activity.type === 'audit' ? 'warning' : 'info',
          metadata: activity.metadata
        }));
      },
      error: (error) => {
        console.error('Error loading activities:', error);
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

  canEditStaff(): boolean {
    if (!this.staff) return false;
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;

    const hierarchyLevels: { [key: string]: number } = {
      'account_owner': 100,
      'ACCOUNT_OWNER': 100,
      'pharmacy_manager': 50,
      'PHARMACY_MANAGER': 50,
      'pharmacy_inventory_manager': 40,
      'PHARMACY_INVENTORY_MANAGER': 40,
      'pharmacy_staff': 10,
      'PHARMACY_STAFF': 10
    };

    const currentUserRole = currentUser.role?.toLowerCase() || '';
    const currentUserHierarchy = hierarchyLevels[currentUserRole] || 0;

    let targetStaffMaxHierarchy = 0;
    if (this.staff.pharmacyRoles && this.staff.pharmacyRoles.length > 0) {
      targetStaffMaxHierarchy = Math.max(
        ...this.staff.pharmacyRoles.map(pr => {
          const roleName = pr.roleName?.toUpperCase() || '';
          return hierarchyLevels[roleName] || 0;
        })
      );
    } else {
      const memberRole = this.staff.role?.toLowerCase() || '';
      targetStaffMaxHierarchy = hierarchyLevels[memberRole] || 0;
    }

    return currentUserHierarchy >= targetStaffMaxHierarchy;
  }

  editStaff(): void {
    if (this.staff) {
      this.router.navigate(['/pharmacy-staff', this.staff.id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/pharmacy-staff']);
  }

  loadPermissions(staffId: string): void {
    if (!this.staff) {
      this.permissionsError = 'Staff member not loaded';
      return;
    }

    // Use the staff member's pharmacyId instead of current pharmacy context
    // This ensures we're viewing permissions for the correct pharmacy
    const pharmacyId = this.staff.pharmacyId || 
                      (this.staff.pharmacyRoles && this.staff.pharmacyRoles.length > 0 
                        ? this.staff.pharmacyRoles[0].pharmacyId 
                        : null);
    
    if (!pharmacyId) {
      this.permissionsError = 'Staff member has no pharmacy assigned';
      return;
    }

    this.loadingPermissions = true;
    this.permissionsError = '';
    
    this.pharmacyStaffService.getPermissions(staffId, pharmacyId).subscribe({
      next: (permissions) => {
        this.staffPermissions = permissions;
        this.initializePermissionsForm(permissions);
        this.loadingPermissions = false;
      },
      error: (error) => {
        this.permissionsError = error.message || 'Failed to load permissions';
        this.loadingPermissions = false;
      }
    });
  }

  initializePermissionsForm(permissions: StaffPermissions): void {
    const formControls: { [key: string]: FormControl } = {};
    
    permissions.modules.forEach(module => {
      module.permissions.forEach(permission => {
        formControls[permission.permissionId] = new FormControl(permission.isGranted);
      });
    });

    this.permissionsForm = this.fb.group(formControls);
  }

  getPermissionControl(permissionId: string): FormControl {
    return this.permissionsForm.get(permissionId) as FormControl;
  }

  savePermissions(): void {
    if (!this.staff || !this.staffPermissions) return;

    // Use the staff member's pharmacyId instead of current pharmacy context
    const pharmacyId = this.staff.pharmacyId || 
                      (this.staff.pharmacyRoles && this.staff.pharmacyRoles.length > 0 
                        ? this.staff.pharmacyRoles[0].pharmacyId 
                        : null);
    
    if (!pharmacyId) {
      this.permissionsError = 'Staff member has no pharmacy assigned';
      return;
    }

    const selectedPermissionIds: string[] = [];
    Object.keys(this.permissionsForm.controls).forEach(permissionId => {
      if (this.permissionsForm.get(permissionId)?.value) {
        selectedPermissionIds.push(permissionId);
      }
    });

    this.savingPermissions = true;
    this.permissionsError = '';

    this.pharmacyStaffService.updatePermissions(this.staff.id, pharmacyId, selectedPermissionIds).subscribe({
      next: () => {
        this.savingPermissions = false;
        // Reload permissions to reflect changes
        this.loadPermissions(this.staff!.id);
      },
      error: (error) => {
        this.permissionsError = error.message || 'Failed to update permissions';
        this.savingPermissions = false;
      }
    });
  }

  cancelPermissionsEdit(): void {
    if (this.staffPermissions) {
      this.initializePermissionsForm(this.staffPermissions);
    }
  }

  getPermissionLabel(permissionKey: string): string {
    // Extract action from permission key (e.g., "dashboard.read" -> "read")
    const parts = permissionKey.split('.');
    if (parts.length > 1) {
      return parts[parts.length - 1]; // Return the last part (action)
    }
    return permissionKey;
  }

  // Group permissions by sub-resource
  getGroupedPermissions(module: { moduleCode: string; moduleName: string; permissions: Array<{ permissionId: string; resource: string; action: string; permissionKey: string; isGranted: boolean }> }): Array<{ subResource: string; permissions: Array<{ permissionId: string; resource: string; action: string; permissionKey: string; isGranted: boolean }> }> {
    const groups: { [key: string]: Array<{ permissionId: string; resource: string; action: string; permissionKey: string; isGranted: boolean }> } = {};
    
    module.permissions.forEach(permission => {
      // Parse permission key: e.g., "inventory.alerts.view" -> module: inventory, subResource: alerts, action: view
      // Or "inventory.view" -> module: inventory, subResource: "", action: view
      const parts = permission.permissionKey.split('.');
      
      // If there are 3+ parts, the middle part(s) is the sub-resource
      // e.g., "inventory.alerts.view" -> subResource = "alerts"
      // e.g., "inventory.view" -> subResource = "" (general permissions)
      let subResource = '';
      if (parts.length > 2) {
        // Join all parts except first (module) and last (action) as sub-resource
        subResource = parts.slice(1, -1).join('.');
      }
      
      if (!groups[subResource]) {
        groups[subResource] = [];
      }
      groups[subResource].push(permission);
    });
    
    // Convert to array and sort: general permissions (empty string) first, then alphabetically
    return Object.keys(groups)
      .sort((a, b) => {
        if (a === '') return -1;
        if (b === '') return 1;
        return a.localeCompare(b);
      })
      .map(subResource => ({
        subResource: subResource || 'General',
        permissions: groups[subResource]
      }));
  }
}





