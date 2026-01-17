import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientsService } from '../../../core/services/patients.service';
import { Patient } from '../../../core/models/patient.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TabsComponent, TabComponent } from '../../../shared/components/tabs/tabs.component';
import { CanAccessDirective } from '../../../shared/directives/can-access.directive';
import { PatientOverviewTabComponent } from './tabs/patient-overview-tab.component';
import { PatientOrdersTabComponent } from './tabs/patient-orders-tab.component';
import { PatientLoyaltyTabComponent } from './tabs/patient-loyalty-tab.component';
import { PatientRevenueTabComponent } from './tabs/patient-revenue-tab.component';
import { PatientMedicalTabComponent } from './tabs/patient-medical-tab.component';
import { PatientTimelineTabComponent } from './tabs/patient-timeline-tab.component';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    AlertComponent,
    TranslatePipe,
    TabsComponent,
    TabComponent,
    CanAccessDirective,
    PatientOverviewTabComponent,
    PatientOrdersTabComponent,
    PatientLoyaltyTabComponent,
    PatientRevenueTabComponent,
    PatientMedicalTabComponent,
    PatientTimelineTabComponent
  ],
  template: `
    <div class="space-y-[var(--spacing-gap)]">
      @if (errorMessage) {
        <app-alert type="error" [title]="errorMessage" />
      }

      @if (patient) {
        <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-[var(--spacing-card)]">
          <!-- Header Actions -->
          <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold text-[var(--text-primary)]">{{ 'patient.details' | translate }}</h1>
            <div class="flex gap-3">
              <app-button variant="outline" (onClick)="editPatient()">
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

          <!-- Tabs -->
          <app-tabs>
            <app-tab [title]="'patient.tabs.overview' | translate" [active]="true">
              <patient-overview-tab [patient]="patient!" />
            </app-tab>
            <app-tab *appCanAccess="'patient.tabs.orders'" [title]="'patient.tabs.orders' | translate" [active]="false">
              <patient-orders-tab [patientId]="patient!.id" />
            </app-tab>
            <app-tab *appCanAccess="'patient.tabs.loyalty'" [title]="'patient.tabs.loyalty' | translate" [active]="false">
              <patient-loyalty-tab [patientId]="patient!.id" />
            </app-tab>
            <app-tab *appCanAccess="'patient.tabs.revenue'" [title]="'patient.tabs.revenue' | translate" [active]="false">
              <patient-revenue-tab [patientId]="patient!.id" />
            </app-tab>
            <app-tab [title]="'patient.tabs.medical' | translate" [active]="false">
              <patient-medical-tab [patient]="patient!" />
            </app-tab>
            <app-tab [title]="'patient.tabs.timeline' | translate" [active]="false">
              <patient-timeline-tab [patientId]="patient!.id" />
            </app-tab>
          </app-tabs>
        </div>
      } @else if (loading) {
        <div class="text-center py-12">
          <p class="text-[var(--card-text)]">Loading patient details...</p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class PatientDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private patientsService = inject(PatientsService);

  patient: Patient | null = null;
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPatient(id);
    } else {
      this.errorMessage = 'Patient ID is required';
      this.loading = false;
    }
  }

  loadPatient(id: string): void {
    this.loading = true;
    this.errorMessage = '';
    this.patientsService.getById(id).subscribe({
      next: (patient) => {
        this.patient = patient;
        this.loading = false;
        if (!patient) {
          this.errorMessage = 'Patient not found';
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load patient details';
        this.loading = false;
        console.error('Error loading patient:', error);
      }
    });
  }

  editPatient(): void {
    if (this.patient) {
      this.router.navigate(['/patients', this.patient.id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/patients']);
  }
}
