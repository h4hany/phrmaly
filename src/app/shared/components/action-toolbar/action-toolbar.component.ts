import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-action-toolbar',
  standalone: true,
  imports: [CommonModule, ButtonComponent, TranslatePipe],
  template: `
    <div class="flex items-center justify-between gap-4 py-4 px-6" [style]="toolbarStyles">
      <div class="flex items-center gap-3 flex-1">
        @if (title) {
          <h3 class="text-lg font-semibold" [style]="titleStyles">{{ title | translate }}</h3>
        }
        @if (customActions) {
          <ng-container *ngTemplateOutlet="customActions"></ng-container>
        }
      </div>
      
      <div class="flex items-center gap-2">
        @if (showSearch) {
          <div class="relative">
            <input
              type="text"
              [placeholder]="searchPlaceholder | translate"
              [value]="searchQuery"
              (input)="handleSearch($event)"
              class="pl-10 pr-4 py-2 border rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-bg)]/20"
              style="background-color: white; border-color: #e5e7eb;"
            />
            <svg class="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        }
        
        @if (showFilter) {
          <app-button
            variant="outline"
            size="sm"
            (onClick)="onFilter.emit()"
          >
            {{ 'common.filter' | translate }}
          </app-button>
        }
        
        @if (primaryAction) {
          <app-button
            [variant]="primaryAction.variant || 'primary'"
            [size]="primaryAction.size || 'md'"
            (onClick)="primaryAction.onClick()"
          >
            {{ primaryAction.label | translate }}
          </app-button>
        }
      </div>
    </div>
  `,
  styles: []
})
export class ActionToolbarComponent {
  @Input() title = '';
  @Input() showSearch = false;
  @Input() showFilter = false;
  @Input() searchPlaceholder = 'common.search';
  @Input() primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
  };
  @ContentChild('customActions') customActions?: TemplateRef<any>;
  
  @Output() onSearch = new EventEmitter<string>();
  @Output() onFilter = new EventEmitter<void>();

  searchQuery = '';

  handleSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    this.onSearch.emit(this.searchQuery);
  }

  get toolbarStyles(): string {
    return 'background-color: var(--card-bg); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);';
  }

  get titleStyles(): string {
    return 'color: var(--card-text);';
  }
}

