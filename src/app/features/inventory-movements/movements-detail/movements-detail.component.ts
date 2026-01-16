import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RiskBadgeComponent } from '../../../shared/components/risk-badge/risk-badge.component';
import { TimelineComponent, TimelineEvent } from '../../../shared/components/timeline/timeline.component';
import { MovementEngineService } from '../../../core/engines/movement-engine.service';
import { DrugMovement } from '../../../core/models/movement.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-movements-detail',
  standalone: true,
  imports: [CommonModule, RiskBadgeComponent, TimelineComponent, TranslatePipe],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <button (click)="router.navigate(['/inventory/movements'])" class="text-sm text-gray-600 hover:text-gray-900">
          ← {{ 'common.back' | translate }}
        </button>
      </div>

      @if (movement) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <div class="p-6 rounded-lg" style="background-color: var(--card-bg);">
              <h2 class="text-xl font-bold mb-2">{{ movement.drugName || 'Unknown Drug' }}</h2>
              <p class="text-sm text-gray-600 mb-4">Movement ID: {{ movement.id }}</p>
              <div class="mt-4 space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm text-gray-600">{{ 'movements.type' | translate }}</label>
                    <p class="font-medium">{{ movement.movementType }}</p>
                  </div>
                  <div>
                    <label class="text-sm text-gray-600">{{ 'movements.quantity' | translate }}</label>
                    <p class="font-medium">{{ movement.quantity > 0 ? '+' : '' }}{{ movement.quantity }}</p>
                  </div>
                  <div>
                    <label class="text-sm text-gray-600">{{ 'movements.staff' | translate }}</label>
                    <p class="font-medium">{{ movement.staffName }}</p>
                  </div>
                  <div>
                    <label class="text-sm text-gray-600">{{ 'movements.risk' | translate }}</label>
                    <app-risk-badge [level]="movement.riskLevel" [score]="movement.riskScore"></app-risk-badge>
                  </div>
                </div>
                @if (movement.reason) {
                  <div>
                    <label class="text-sm text-gray-600">{{ 'movements.reason' | translate }}</label>
                    <p class="font-medium">{{ movement.reason }}</p>
                  </div>
                }
              </div>
            </div>

            <div class="p-6 rounded-lg" style="background-color: var(--card-bg);">
              <h3 class="text-lg font-semibold mb-4">{{ 'movements.timeline' | translate }}</h3>
              <app-timeline [events]="timelineEvents"></app-timeline>
            </div>
          </div>

          <div class="space-y-6">
            <div class="p-6 rounded-lg" style="background-color: var(--card-bg);">
              <h3 class="text-lg font-semibold mb-4">{{ 'movements.details' | translate }}</h3>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ 'movements.previousQuantity' | translate }}</span>
                  <span class="font-medium">{{ movement.previousQuantity }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ 'movements.newQuantity' | translate }}</span>
                  <span class="font-medium">{{ movement.newQuantity }}</span>
                </div>
                @if (movement.unitCost) {
                  <div class="flex justify-between">
                    <span class="text-gray-600">{{ 'movements.unitCost' | translate }}</span>
                    <span class="font-medium">{{ formatCost(movement.unitCost) }}</span>
                  </div>
                }
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ 'movements.timestamp' | translate }}</span>
                  <span class="font-medium">{{ formatDate(movement.timestamp) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      } @else if (loading) {
        <div class="text-center py-12">
          <p>{{ 'common.loading' | translate }}</p>
        </div>
      } @else {
        <div class="text-center py-12">
          <p>{{ 'movements.notFound' | translate }}</p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class MovementsDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private movementEngine = inject(MovementEngineService);
  private translationService = inject(TranslationService);
  router = inject(Router);

  movement: DrugMovement | null = null;
  loading = false;
  timelineEvents: TimelineEvent[] = [];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMovement(id);
    }
  }

  loadMovement(id: string): void {
    this.loading = true;
    this.movementEngine.getMovementById(id).subscribe({
      next: (movement) => {
        this.movement = movement;
        if (movement) {
          this.timelineEvents = [
            {
              id: '1',
              title: this.translationService.translate('movements.movementRecorded'),
              description: `${movement.movementType} - ${movement.quantity} units`,
              timestamp: movement.timestamp,
              type: movement.riskLevel === 'critical' || movement.riskLevel === 'high' ? 'danger' : 'info',
              metadata: {
                [this.translationService.translate('movements.staff')]: movement.staffName || this.translationService.translate('movements.unknown'),
                [this.translationService.translate('movements.risk')]: movement.riskLevel
              }
            }
          ];
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString();
  }

  formatCost(cost: number): string {
    return cost.toFixed(2);
  }
}

