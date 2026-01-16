import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineComponent, TimelineEvent } from '../../../../shared/components/timeline/timeline.component';
import { PatientEngagementEngineService } from '../../../../core/engines/patient-engagement-engine.service';

@Component({
  selector: 'patient-timeline-tab',
  standalone: true,
  imports: [CommonModule, TimelineComponent],
  template: `
    <div class="space-y-6">
      <app-timeline
        [events]="timelineEvents"
        [emptyMessage]="'timeline.empty'"
      ></app-timeline>
    </div>
  `,
  styles: []
})
export class PatientTimelineTabComponent implements OnInit {
  @Input() patientId!: string;
  private engagementEngine = inject(PatientEngagementEngineService);

  timelineEvents: TimelineEvent[] = [];

  ngOnInit(): void {
    this.loadTimeline();
  }

  loadTimeline(): void {
    this.engagementEngine.getPatientTimeline(this.patientId).subscribe({
      next: (events) => {
        this.timelineEvents = events;
      }
    });
  }
}

