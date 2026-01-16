import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { ChartComponent } from '../../../shared/components/chart/chart.component';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { RiskBadgeComponent } from '../../../shared/components/risk-badge/risk-badge.component';
import { MovementEngineService } from '../../../core/engines/movement-engine.service';
import { StaffRiskScore } from '../../../core/models/movement.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-movements-risk-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent, ChartComponent, TableComponent, TranslatePipe],
  template: `
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <app-stat-card
          label="movements.totalMovements"
          [value]="totalMovements"
          [trend]="'+12%'"
          [trendPositive]="true"
        ></app-stat-card>
        <app-stat-card
          label="movements.suspiciousMovements"
          [value]="suspiciousMovements"
          [trend]="'-3'"
          [trendPositive]="true"
        ></app-stat-card>
        <app-stat-card
          label="movements.highRiskStaff"
          [value]="highRiskStaffCount"
        ></app-stat-card>
        <app-stat-card
          label="movements.avgRiskScore"
          [value]="avgRiskScore.toFixed(1)"
        ></app-stat-card>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="p-6 rounded-lg" style="background-color: var(--card-bg);">
          <h3 class="text-lg font-semibold mb-4">{{ 'movements.riskByType' | translate }}</h3>
          <app-chart [type]="'bar'" [data]="riskByTypeData" [options]="chartOptions"></app-chart>
        </div>
        <div class="p-6 rounded-lg" style="background-color: var(--card-bg);">
          <h3 class="text-lg font-semibold mb-4">{{ 'movements.dailyTrend' | translate }}</h3>
          <app-chart [type]="'line'" [data]="dailyTrendData" [options]="chartOptions"></app-chart>
        </div>
      </div>

      <div class="p-6 rounded-lg" style="background-color: var(--card-bg);">
        <h3 class="text-lg font-semibold mb-4">{{ 'movements.staffRiskScores' | translate }}</h3>
        <app-table
          [columns]="staffColumns"
          [data]="staffRiskScores"
          [emptyMessage]="'movements.noStaffData'"
        ></app-table>
      </div>
    </div>
  `,
  styles: []
})
export class MovementsRiskDashboardComponent implements OnInit {
  private movementEngine = inject(MovementEngineService);
  private translationService = inject(TranslationService);

  totalMovements = 0;
  suspiciousMovements = 0;
  highRiskStaffCount = 0;
  avgRiskScore = 0;
  staffRiskScores: StaffRiskScore[] = [];

  riskByTypeData: any = {
    labels: [
      this.translationService.translate('movements.type.sale'),
      this.translationService.translate('movements.type.purchase'),
      this.translationService.translate('movements.type.adjustment'),
      this.translationService.translate('movements.type.theft')
    ],
    datasets: [{
      label: this.translationService.translate('movements.chart.riskScore'),
      data: [15, 10, 75, 100]
    }]
  };

  dailyTrendData: any = {
    labels: [
      this.translationService.translate('common.days.mon'),
      this.translationService.translate('common.days.tue'),
      this.translationService.translate('common.days.wed'),
      this.translationService.translate('common.days.thu'),
      this.translationService.translate('common.days.fri'),
      this.translationService.translate('common.days.sat'),
      this.translationService.translate('common.days.sun')
    ],
    datasets: [{
      label: this.translationService.translate('movements.chart.dailyVariance'),
      data: [5, 12, 8, 15, 20, 10, 7]
    }]
  };

  chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false
  };

  staffColumns: TableColumn[] = [
    { key: 'staffName', label: 'movements.staff' },
    { key: 'totalMovements', label: 'movements.totalMovements' },
    { key: 'suspiciousMovements', label: 'movements.suspiciousMovements' },
    { key: 'riskScore', label: 'movements.riskScore' },
    { key: 'riskLevel', label: 'movements.riskLevel' }
  ];

  ngOnInit(): void {
    this.loadStaffRiskScores();
  }

  loadStaffRiskScores(): void {
    this.movementEngine.getStaffRiskScores().subscribe({
      next: (scores) => {
        this.staffRiskScores = scores;
        this.totalMovements = scores.reduce((sum, s) => sum + s.totalMovements, 0);
        this.suspiciousMovements = scores.reduce((sum, s) => sum + s.suspiciousMovements, 0);
        this.highRiskStaffCount = scores.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical').length;
        this.avgRiskScore = scores.length > 0 
          ? scores.reduce((sum, s) => sum + s.riskScore, 0) / scores.length 
          : 0;
      }
    });
  }
}

