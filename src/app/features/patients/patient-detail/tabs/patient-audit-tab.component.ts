import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableComponent, TableColumn } from '../../../../shared/components/table/table.component';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

interface AuditLog {
  id: string;
  timestamp: Date | string;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  details?: string;
}

@Component({
  selector: 'patient-audit-tab',
  standalone: true,
  imports: [CommonModule, TableComponent, TranslatePipe],
  template: `
    <div class="space-y-6">
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
        <h2 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'patient.audit.title' | translate }}</h2>
        <app-table
          [columns]="columns"
          [data]="formattedAuditLogs"
          [pagination]="pagination"
          [emptyMessage]="'patient.audit.noLogs' | translate"
        />
      </div>
    </div>
  `,
  styles: []
})
export class PatientAuditTabComponent {
  @Input() patientId!: string;

  // Mock data
  auditLogs: AuditLog[] = [
    {
      id: '1',
      timestamp: new Date('2024-11-27T10:30:00'),
      user: 'John Doe',
      action: 'Updated',
      entity: 'Patient',
      entityId: this.patientId,
      details: 'Updated phone number'
    },
    {
      id: '2',
      timestamp: new Date('2024-11-25T14:20:00'),
      user: 'Jane Smith',
      action: 'Created',
      entity: 'Invoice',
      entityId: 'INV001',
      details: 'Created new invoice'
    },
    {
      id: '3',
      timestamp: new Date('2024-11-20T09:15:00'),
      user: 'John Doe',
      action: 'Viewed',
      entity: 'Patient',
      entityId: this.patientId,
      details: 'Viewed patient profile'
    }
  ];

  columns: TableColumn[] = [
    { key: 'timestamp', label: 'patient.audit.timestamp', sortable: true },
    { key: 'user', label: 'patient.audit.user', sortable: true },
    { key: 'action', label: 'patient.audit.action', sortable: true },
    { key: 'entity', label: 'patient.audit.entity', sortable: true },
    { key: 'entityId', label: 'patient.audit.entityId', sortable: false },
    { key: 'details', label: 'patient.audit.details', sortable: false }
  ];

  pagination = {
    page: 1,
    pageSize: 10,
    total: 3,
    totalPages: 1
  };

  get formattedAuditLogs(): AuditLog[] {
    return this.auditLogs.map(log => ({
      ...log,
      timestamp: this.formatDate(log.timestamp as Date)
    }));
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    const day = d.getDate();
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    return `${day}, ${month}, ${year}`;
  }
}

