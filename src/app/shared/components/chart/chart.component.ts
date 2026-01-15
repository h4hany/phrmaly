import { Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      height: 300px;
      width: 100%;
    }
  `]
})
export class ChartComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() type: ChartType = 'bar';
  @Input() data: any;
  @Input() options: any = {};
  @Input() height: number = 300;

  private chart: Chart | null = null;

  ngOnInit(): void {
    // Options initialization
  }

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chart && (changes['data'] || changes['options'] || changes['type'])) {
      this.updateChart(changes);
    }
  }

  private createChart(): void {
    if (!this.chartCanvas?.nativeElement) return;

    const config: ChartConfiguration = {
      type: this.type,
      data: this.data || { labels: [], datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            enabled: true,
          }
        },
        ...this.options
      }
    };

    this.chart = new Chart(this.chartCanvas.nativeElement, config);
  }

  private updateChart(changes: SimpleChanges): void {
    if (!this.chart) return;

    // Destroy and recreate chart if type changed
    if (changes['type']?.previousValue !== this.type) {
      this.chart.destroy();
      this.createChart();
      return;
    }

    if (this.data) {
      this.chart.data = this.data;
    }
    if (this.options) {
      this.chart.options = { ...this.chart.options, ...this.options };
    }
    this.chart.update();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}

