import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { InvoicesService } from '../../../../core/services/invoices.service';
import { ChartComponent } from '../../../../shared/components/chart/chart.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { Invoice } from '../../../../core/models/invoice.model';

@Component({
  selector: 'patient-revenue-tab',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, ChartComponent, StatCardComponent, TranslatePipe],
  template: `
    <div class="space-y-6">
      <!-- Revenue Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-stat-card
          [label]="'patient.revenue.totalRevenue' | translate"
          [value]="totalRevenue | currency:'USD':'symbol':'1.2-2'"
          [icon]="moneyIcon"
        />
        <app-stat-card
          [label]="'patient.revenue.avgOrderValue' | translate"
          [value]="avgOrderValue | currency:'USD':'symbol':'1.2-2'"
          [icon]="chartIcon"
        />
        <app-stat-card
          [label]="'patient.revenue.totalOrders' | translate"
          [value]="totalOrders"
          [icon]="ordersIcon"
        />
        <app-stat-card
          [label]="'patient.revenue.lastOrderDate' | translate"
          [value]="lastOrderDate | date:'shortDate'"
          [icon]="calendarIcon"
        />
      </div>

      <!-- Revenue Chart -->
      <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
        <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'patient.revenue.chartTitle' | translate }}</h3>
        <app-chart
          type="line"
          [data]="chartData"
          [options]="chartOptions"
          [height]="300"
        />
      </div>
    </div>
  `,
  styles: []
})
export class PatientRevenueTabComponent implements OnInit {
  @Input() patientId!: string;
  private invoicesService = inject(InvoicesService);

  totalRevenue = 0;
  avgOrderValue = 0;
  totalOrders = 0;
  lastOrderDate: Date = new Date();

  // Icons
  moneyIcon = '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
  chartIcon = '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>';
  ordersIcon = '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>';
  calendarIcon = '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';

  chartData: any = {
    labels: [],
    datasets: [{
      label: 'Revenue',
      data: [],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.1
    }]
  };

  chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        enabled: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '$' + value.toFixed(2);
          }
        }
      }
    }
  };

  ngOnInit(): void {
    this.loadRevenueData();
  }

  loadRevenueData(): void {
    this.invoicesService.getAll({ page: 1, pageSize: 100 }).subscribe({
      next: (response) => {
        const patientInvoices = response.data.filter(inv => inv.patientId === this.patientId);
        
        this.totalOrders = patientInvoices.length;
        this.totalRevenue = patientInvoices.reduce((sum, inv) => sum + inv.total, 0);
        this.avgOrderValue = this.totalOrders > 0 ? this.totalRevenue / this.totalOrders : 0;
        
        if (patientInvoices.length > 0) {
          const sorted = patientInvoices.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          this.lastOrderDate = sorted[0].createdAt;
        }

        // Prepare chart data (last 6 months)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const revenueByMonth = months.map((month, index) => {
          const monthInvoices = patientInvoices.filter(inv => {
            const invDate = new Date(inv.createdAt);
            return invDate.getMonth() === index;
          });
          return monthInvoices.reduce((sum, inv) => sum + inv.total, 0);
        });

        this.chartData = {
          labels: months,
          datasets: [{
            label: 'Revenue',
            data: revenueByMonth,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1
          }]
        };
      }
    });
  }
}

