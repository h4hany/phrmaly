import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientsService } from '../../../core/services/patients.service';
import { Patient } from '../../../core/models/patient.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { PharmacyContextService } from '../../../core/services/pharmacy-context.service';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, ButtonComponent, AlertComponent, TranslatePipe],
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

          <!-- Patient Card and Personal Information -->
          <div class="mb-6 pb-6 border-b border-[var(--border-color)]">
            <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'patient.personalInfo' | translate }}</h2>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Personal Information - 2 columns -->
              <div class="lg:col-span-2">
                <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'patient.fullName' | translate }}</label>
                <p class="text-[var(--text-primary)] font-medium">{{ patient.fullName }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'patient.dateOfBirth' | translate }}</label>
                <p class="text-[var(--text-primary)]">{{ patient.dateOfBirth | date:'mediumDate' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'patient.gender' | translate }}</label>
                <p class="text-[var(--text-primary)] capitalize">{{ patient.gender }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'patient.phone' | translate }}</label>
                <p class="text-[var(--text-primary)]">{{ patient.phone }}</p>
              </div>
              @if (patient.email) {
                <div>
                  <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'patient.email' | translate }}</label>
                  <p class="text-[var(--text-primary)]">{{ patient.email }}</p>
                </div>
              }
              @if (patient.occupation) {
                <div>
                  <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'patient.occupation' | translate }}</label>
                  <p class="text-[var(--text-primary)]">{{ patient.occupation }}</p>
                </div>
              }
                </div>
              </div>
              
              <!-- Patient Card -->
              @if (patient.cardId) {
                <div class="lg:col-span-1">
                  <div class="relative rounded-2xl p-8 shadow-xl overflow-hidden" style="background-color: var(--sidebar-bg); min-height: 220px;">
                    <!-- Circle Pattern Background -->
                    <div class="absolute inset-0 opacity-[0.15] pointer-events-none" style="color: var(--sidebar-text);">
                      <!-- Circle 1 - Top Left -->
                      <div class="absolute rounded-full" style="top: -10%; left: -5%; width: 120px; height: 120px; background-color: currentColor;"></div>
                      <!-- Circle 2 - Top Right -->
                      <div class="absolute rounded-full" style="top: 10%; right: -8%; width: 80px; height: 80px; background-color: currentColor;"></div>
                      <!-- Circle 3 - Bottom Right -->
                      <div class="absolute rounded-full" style="bottom: -5%; right: 10%; width: 100px; height: 100px; background-color: currentColor;"></div>
                      <!-- Circle 4 - Bottom Left -->
                      <div class="absolute rounded-full" style="bottom: 15%; left: -5%; width: 60px; height: 60px; background-color: currentColor;"></div>
                      <!-- Circle 5 - Middle Left -->
                      <div class="absolute rounded-full" style="top: 50%; left: -8%; width: 70px; height: 70px; background-color: currentColor; transform: translateY(-50%);"></div>
                    </div>
                    
                    <div class="relative z-10 flex flex-col justify-between h-full" style="color: var(--sidebar-text);">
                      <!-- Top Section -->
                      <div>
                        <div class="text-lg font-semibold mb-6">{{ patient.fullName }}</div>
                        <div class="text-sm opacity-90 mb-3">CARD NUMBER</div>
                        <div class="text-xl font-mono tracking-wider mb-8">
                          {{ patient.cardId }}
                        </div>
                      </div>
                      
                      <!-- Bottom Section -->
                      <div class="flex items-end justify-between">
                        <div class="flex gap-6">
                          <div>
                            <div class="text-xs opacity-80 mb-1">VALID</div>
                            <div class="text-sm font-semibold">
                              @if (patient.validUntil) {
                                {{ patient.validUntil | date:'MM/yy' }}
                              } @else {
                                -
                              }
                            </div>
                          </div>
                          <div>
                            <div class="text-xs opacity-80 mb-1">{{ 'patient.issuedDate' | translate }}</div>
                            <div class="text-sm font-semibold">
                              @if (patient.issuedDate) {
                                {{ patient.issuedDate | date:'MM/yy' }}
                              } @else {
                                -
                              }
                            </div>
                          </div>
                        </div>
                        
                        <!-- Pharmacy Logo -->
                        <div class="flex items-center justify-center">
                          @if (getPharmacyLogo()) {
                            <img [src]="getPharmacyLogo()" alt="Pharmacy Logo" class="h-10 w-auto object-contain" />
                          } @else {
                            <!-- Fallback: Pharmacy Initials -->
                            <div class="w-16 h-10 rounded-lg flex items-center justify-center" style="background-color: rgba(227, 244, 245, 0.2);">
                              <span class="font-bold text-lg" style="color: var(--sidebar-text);">{{ getPharmacyInitials() }}</span>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Address Information -->
          <div class="mb-6 pb-6 border-b border-[var(--border-color)]">
            <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'patient.addressInfo' | translate }}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'patient.city' | translate }}</label>
                <p class="text-[var(--text-primary)]">{{ patient.address.city }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'patient.area' | translate }}</label>
                <p class="text-[var(--text-primary)]">{{ patient.address.area }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'patient.street' | translate }}</label>
                <p class="text-[var(--text-primary)]">{{ patient.address.street }}</p>
              </div>
              @if (patient.address.notes) {
                <div class="md:col-span-2 lg:col-span-3">
                  <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'patient.notes' | translate }}</label>
                  <p class="text-[var(--text-primary)]">{{ patient.address.notes }}</p>
                </div>
              }
            </div>
          </div>

          <!-- Medical Information -->
          @if (patient.medicalNotes) {
            <div class="mb-6">
              <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'patient.medicalInfo' | translate }}</h2>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'patient.medicalNotes' | translate }}</label>
                <p class="text-[var(--text-primary)] whitespace-pre-wrap">{{ patient.medicalNotes }}</p>
              </div>
            </div>
          }

          <!-- Metadata -->
          <div class="pt-6 border-t border-[var(--border-color)]">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'invoice.createdAt' | translate }}</label>
                <p class="text-[var(--text-primary)]">{{ patient.createdAt | date:'medium' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--card-text)] mb-1">{{ 'common.lastUpdated' | translate }}</label>
                <p class="text-[var(--text-primary)]">{{ patient.updatedAt | date:'medium' }}</p>
              </div>
            </div>
          </div>
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
  private pharmacyContext = inject(PharmacyContextService);

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

  getPharmacyLogo(): string | null {
    const pharmacy = this.pharmacyContext.getCurrentPharmacy();
    return pharmacy?.logoUrl || null;
  }

  getPharmacyInitials(): string {
    const pharmacy = this.pharmacyContext.getCurrentPharmacy();
    if (pharmacy?.name) {
      return pharmacy.name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'PH';
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
