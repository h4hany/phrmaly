import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShelfMapComponent, ShelfLocation } from '../../shared/components/shelf-map/shelf-map.component';
import { ActionToolbarComponent } from '../../shared/components/action-toolbar/action-toolbar.component';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
  selector: 'app-inventory-map',
  standalone: true,
  imports: [CommonModule, ShelfMapComponent, ActionToolbarComponent],
  template: `
    <div class="space-y-6">
      <app-action-toolbar
        title="shelfMap.title"
        [showSearch]="true"
        (onSearch)="handleSearch($event)"
      ></app-action-toolbar>

      <app-shelf-map
        [locations]="shelfLocations"
        [title]="'shelfMap.pharmacyLayout'"
        [subtitle]="'shelfMap.subtitle'"
        [columns]="8"
        [showLegend]="true"
        [highlightDrugId]="highlightedDrugId"
        (locationClick)="onLocationClick($event)"
      ></app-shelf-map>
    </div>
  `
})
export class InventoryMapComponent implements OnInit {
  shelfLocations: ShelfLocation[] = [];
  highlightedDrugId?: string;

  ngOnInit(): void {
    this.loadShelfLocations();
  }

  loadShelfLocations(): void {
    // Mock shelf locations
    const locations: ShelfLocation[] = [];
    const shelves = ['A', 'B', 'C', 'D'];
    const drugs = [
      { id: 'PDRG001', name: 'Paracetamol 500mg', quantity: 150 },
      { id: 'PDRG002', name: 'Ibuprofen 200mg', quantity: 100 },
      { id: 'PDRG003', name: 'Amoxicillin 250mg', quantity: 25 }
    ];

    shelves.forEach((shelf, sIdx) => {
      for (let row = 1; row <= 4; row++) {
        for (let col = 1; col <= 8; col++) {
          const drugIndex = (sIdx * 32 + (row - 1) * 8 + col - 1) % drugs.length;
          const drug = drugs[drugIndex];
          const hasDrug = Math.random() > 0.3; // 70% occupied

          locations.push({
            id: `${shelf}-${row}-${col}`,
            shelf,
            row,
            column: col,
            drugId: hasDrug ? drug.id : undefined,
            drugName: hasDrug ? drug.name : undefined,
            quantity: hasDrug ? Math.floor(Math.random() * drug.quantity) : undefined,
            status: hasDrug 
              ? (Math.random() > 0.7 ? 'low_stock' : 'occupied')
              : 'empty'
          });
        }
      }
    });

    this.shelfLocations = locations;
  }

  handleSearch(query: string): void {
    // Filter or highlight based on search
    if (query) {
      const found = this.shelfLocations.find(l => 
        l.drugName?.toLowerCase().includes(query.toLowerCase())
      );
      this.highlightedDrugId = found?.drugId;
    } else {
      this.highlightedDrugId = undefined;
    }
  }

  onLocationClick(location: ShelfLocation): void {
    console.log('Location clicked:', location);
    // Could navigate to drug detail or show location info
  }
}

