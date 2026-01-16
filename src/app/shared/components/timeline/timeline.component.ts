import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../badge/badge.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: Date;
  type?: 'info' | 'success' | 'warning' | 'danger';
  icon?: string;
  metadata?: { [key: string]: any };
}

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, BadgeComponent, TranslatePipe],
  template: `
    <div class="relative" [style]="containerStyles">
      <div class="space-y-6">
        @for (event of events; track event.id; let i = $index) {
          <div class="flex gap-4">
            <!-- Timeline Line -->
            <div class="flex flex-col items-center">
              <div 
                [class]="getIconContainerClasses(event.type)"
                [style]="getIconStyles(event.type)"
              >
                @if (event.icon) {
                  <img [src]="event.icon" alt="" class="w-5 h-5" />
                } @else {
                  <div [class]="getDefaultIconClasses(event.type)"></div>
                }
              </div>
              @if (i < events.length - 1) {
                <div class="flex-1 w-0.5 mt-2" [style]="getLineStyles(event.type)"></div>
              }
            </div>
            
            <!-- Event Content -->
            <div class="flex-1 pb-6">
              <div [class]="contentClasses">
                <div class="flex items-start justify-between gap-4 mb-2">
                  <h4 class="font-semibold text-base" [style]="titleStyles">{{ event.title }}</h4>
                  <span class="text-xs whitespace-nowrap" [style]="timeStyles">{{ formatTime(event.timestamp) }}</span>
                </div>
                @if (event.description) {
                  <p class="text-sm mb-2" [style]="descriptionStyles">{{ event.description }}</p>
                }
                @if (hasMetadata(event)) {
                  <div class="mt-3 flex flex-wrap gap-2">
                    @for (item of getMetadataEntries(event.metadata!); track item.key) {
                      <app-badge [variant]="getMetadataVariant(item.key)">
                        {{ item.key }}: {{ item.value }}
                      </app-badge>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        } @empty {
          <div class="text-center py-8" [style]="emptyStyles">
            <p>{{ emptyMessage | translate }}</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class TimelineComponent {
  @Input() events: TimelineEvent[] = [];
  @Input() emptyMessage = 'timeline.empty';
  @Input() variant: 'default' | 'compact' = 'default';

  get containerStyles(): string {
    return 'background-color: var(--card-bg); border-radius: var(--radius-lg); padding: 1.5rem;';
  }

  get contentClasses(): string {
    return this.variant === 'compact' ? '' : 'p-4 rounded-lg';
  }

  get titleStyles(): string {
    return 'color: var(--card-text);';
  }

  get timeStyles(): string {
    return 'color: var(--card-text); opacity: 0.7;';
  }

  get descriptionStyles(): string {
    return 'color: var(--card-text); opacity: 0.8;';
  }

  get emptyStyles(): string {
    return 'color: var(--card-text); opacity: 0.6;';
  }

  getIconContainerClasses(type?: string): string {
    const base = 'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0';
    return base;
  }

  getIconStyles(type?: string): string {
    const styles: { [key: string]: string } = {
      info: 'background-color: rgba(59, 130, 246, 0.1);',
      success: 'background-color: rgba(16, 185, 129, 0.1);',
      warning: 'background-color: rgba(245, 158, 11, 0.1);',
      danger: 'background-color: rgba(239, 68, 68, 0.1);'
    };
    return styles[type || 'info'] || styles['info'];
  }

  getDefaultIconClasses(type?: string): string {
    const base = 'w-3 h-3 rounded-full';
    const colors: { [key: string]: string } = {
      info: 'bg-blue-500',
      success: 'bg-green-500',
      warning: 'bg-amber-500',
      danger: 'bg-red-500'
    };
    return `${base} ${colors[type || 'info'] || colors['info']}`;
  }

  getLineStyles(type?: string): string {
    const colors: { [key: string]: string } = {
      info: 'background-color: rgba(59, 130, 246, 0.2);',
      success: 'background-color: rgba(16, 185, 129, 0.2);',
      warning: 'background-color: rgba(245, 158, 11, 0.2);',
      danger: 'background-color: rgba(239, 68, 68, 0.2);'
    };
    return colors[type || 'info'] || colors['info'];
  }

  hasMetadata(event: TimelineEvent): boolean {
    return event.metadata !== undefined && Object.keys(event.metadata).length > 0;
  }

  formatTime(date: Date): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  }

  getMetadataEntries(metadata: { [key: string]: any }): Array<{ key: string; value: any }> {
    return Object.entries(metadata).map(([key, value]) => ({ key, value }));
  }

  getMetadataVariant(key: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    const lower = key.toLowerCase();
    if (lower.includes('risk') || lower.includes('alert')) return 'danger';
    if (lower.includes('warning')) return 'warning';
    if (lower.includes('success') || lower.includes('completed')) return 'success';
    return 'info';
  }
}

