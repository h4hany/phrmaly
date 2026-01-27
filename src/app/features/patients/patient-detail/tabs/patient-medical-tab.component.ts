import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Patient } from '../../../../core/models/patient.model';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

@Component({
  selector: 'patient-medical-tab',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="space-y-6">
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'patient.medicalInfo' | translate }}</h2>
        @if (patient.medicalNotes) {
          <div>
            <label class="block text-sm font-medium text-[var(--card-text)] mb-2">{{ 'patient.medicalNotes' | translate }}</label>
            <div class="bg-[var(--page-bg)] rounded-[var(--radius-md)] p-4">
              <p class="text-[var(--text-primary)] whitespace-pre-wrap">{{ patient.medicalNotes }}</p>
            </div>
          </div>
        } @else {
          <div class="text-center py-12">
            <p class="text-[var(--card-text)]">{{ 'patient.medical.noNotes' | translate }}</p>
          </div>
        }
      </div>

      <!-- Additional Medical Information Section -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
        <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'patient.medical.additionalInfo' | translate }}</h3>
        <div class="text-center py-12">
          <p class="text-[var(--card-text)]">{{ 'patient.medical.comingSoon' | translate }}</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PatientMedicalTabComponent {
  @Input() patient!: Patient;
}






