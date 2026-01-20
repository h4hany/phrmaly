import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../badge/badge.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

export interface ShelfLocation {
  id: string;
  shelf: string;
  row: number;
  column: number;
  drugId?: string;
  drugName?: string;
  quantity?: number;
  status?: 'occupied' | 'empty' | 'low_stock';
}

@Component({
  selector: 'app-shelf-map',
  standalone: true,
  imports: [CommonModule, BadgeComponent, TranslatePipe],
  template: `
    <div class="w-full" [style]="containerStyles">
      @if (title) {
        <div class="mb-4">
          <h3 class="text-lg font-semibold" [style]="titleStyles">{{ title | translate }}</h3>
          @if (subtitle) {
            <p class="text-sm mt-1" [style]="subtitleStyles">{{ subtitle | translate }}</p>
          }
        </div>
      }
      
      <div class="overflow-x-auto">
        <div class="inline-block min-w-full">
          <!-- Shelf Grid -->
          <div class="grid gap-2" [style]="gridStyles">
            @for (location of locations; track location.id) {
              <div
                [class]="getCellClasses(location)"
                [style]="getCellStyles(location)"
                (click)="onLocationClick(location)"
                (mouseenter)="hoveredLocation = location.id"
                (mouseleave)="hoveredLocation = null"
              >
                <div class="text-xs font-medium mb-1">{{ location.shelf }}-{{ location.row }}-{{ location.column }}</div>
                @if (location.drugName) {
                  <div class="text-xs truncate" [title]="location.drugName">
                    {{ location.drugName }}
                  </div>
                  @if (location.quantity !== undefined) {
                    <div class="text-xs mt-1" [style]="getQuantityStyles(location)">
                      Qty: {{ location.quantity }}
                    </div>
                  }
                } @else {
                  <div class="text-xs opacity-50">{{ 'shelf.empty' | translate }}</div>
                }
                @if (location.status === 'low_stock') {
                  <app-badge variant="warning" class="mt-1 text-xs">Low</app-badge>
                }
              </div>
            }
          </div>
        </div>
      </div>
      
      <!-- Legend -->
      @if (showLegend) {
        <div class="mt-4 flex flex-wrap gap-4 text-sm" [style]="legendStyles">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded" style="background-color: #10b981;"></div>
            <span>{{ 'shelf.occupied' | translate }}</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded" style="background-color: #f59e0b;"></div>
            <span>{{ 'shelf.lowStock' | translate }}</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded border-2" style="background-color: #f3f4f6; border-color: #d1d5db;"></div>
            <span>{{ 'shelf.empty' | translate }}</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class ShelfMapComponent {
  @Input() locations: ShelfLocation[] = [];
  @Input() title = '';
  @Input() subtitle = '';
  @Input() columns = 8;
  @Input() showLegend = true;
  @Input() highlightDrugId?: string;
  @Output() locationClick = new EventEmitter<ShelfLocation>();

  hoveredLocation: string | null = null;

  get containerStyles(): string {
    return 'background-color: var(--card-bg); border-radius: var(--radius-lg); padding: 1.5rem;';
  }

  get gridStyles(): string {
    return `grid-template-columns: repeat(${this.columns}, minmax(0, 1fr));`;
  }

  get titleStyles(): string {
    return 'color: var(--card-text);';
  }

  get subtitleStyles(): string {
    return 'color: var(--card-text); opacity: 0.7;';
  }

  get legendStyles(): string {
    return 'color: var(--card-text);';
  }

  getCellClasses(location: ShelfLocation): string {
    const base = 'p-2 rounded border-2 cursor-pointer transition-all min-h-[80px]';
    const isHighlighted = this.highlightDrugId === location.drugId;
    const isHovered = this.hoveredLocation === location.id;
    
    if (isHighlighted) {
      return `${base} ring-2 ring-offset-2`;
    }
    if (isHovered) {
      return `${base} transform scale-105`;
    }
    return base;
  }

  getCellStyles(location: ShelfLocation): string {
    const isHighlighted = this.highlightDrugId === location.drugId;
    
    if (location.status === 'low_stock') {
      return 'background-color: #fef3c7; border-color: #f59e0b; color: #92400e;';
    }
    if (location.drugId) {
      if (isHighlighted) {
        return 'background-color: #dbeafe; border-color: #3b82f6; color: #1e40af; ring-color: #3b82f6;';
      }
      return 'background-color: #d1fae5; border-color: #10b981; color: #065f46;';
    }
    return 'background-color: #f3f4f6; border-color: #d1d5db; color: #6b7280;';
  }

  getQuantityStyles(location: ShelfLocation): string {
    if (location.status === 'low_stock') {
      return 'color: #92400e; font-weight: 600;';
    }
    return 'color: inherit; opacity: 0.8;';
  }

  onLocationClick(location: ShelfLocation): void {
    this.locationClick.emit(location);
  }
}



