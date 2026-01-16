import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileCardComponent } from '../../../shared/components/profile-card/profile-card.component';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TransferEngineService } from '../../../core/engines/transfer-engine.service';
import { TransferRequest } from '../../../core/models/transfer.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-transfer-detail',
  standalone: true,
  imports: [CommonModule, TableComponent, BadgeComponent, TranslatePipe],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <button (click)="router.navigate(['/inventory/transfers'])" class="text-sm text-gray-600 hover:text-gray-900">
          ← {{ 'common.back' | translate }}
        </button>
      </div>

      @if (transfer) {
        <div class="p-6 rounded-lg" style="background-color: var(--card-bg);">
          <h2 class="text-xl font-bold mb-2">Transfer {{ transfer.id }}</h2>
          <p class="text-sm text-gray-600 mb-4">{{ transfer.status }}</p>
          <div class="mt-4 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm text-gray-600">{{ 'transfers.fromBranch' | translate }}</label>
                <p class="font-medium">{{ transfer.fromBranchName }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-600">{{ 'transfers.toBranch' | translate }}</label>
                <p class="font-medium">{{ transfer.toBranchName }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-600">{{ 'transfers.requestedBy' | translate }}</label>
                <p class="font-medium">{{ transfer.requestedByName }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-600">{{ 'transfers.status' | translate }}</label>
                <app-badge [variant]="getStatusVariant(transfer.status)">
                  {{ transfer.status }}
                </app-badge>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6 rounded-lg" style="background-color: var(--card-bg);">
          <h3 class="text-lg font-semibold mb-4">{{ 'transfers.items' | translate }}</h3>
          <app-table
            [columns]="itemColumns"
            [data]="transfer.items"
            [emptyMessage]="'transfers.noItems'"
          ></app-table>
        </div>
      } @else if (loading) {
        <div class="text-center py-12">
          <p>{{ 'common.loading' | translate }}</p>
        </div>
      } @else {
        <div class="text-center py-12">
          <p>{{ 'transfers.notFound' | translate }}</p>
        </div>
      }
    </div>
  `,
  styles: []
})
export class TransferDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private transferEngine = inject(TransferEngineService);
  router = inject(Router);

  transfer: TransferRequest | null = null;
  loading = false;

  itemColumns: TableColumn[] = [
    { key: 'drugName', label: 'transfers.drug' },
    { key: 'requestedQuantity', label: 'transfers.quantity' },
    { key: 'approvedQuantity', label: 'transfers.approvedQuantity' }
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTransfer(id);
    }
  }

  loadTransfer(id: string): void {
    this.loading = true;
    this.transferEngine.getTransferById(id).subscribe({
      next: (transfer) => {
        this.transfer = transfer;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    const variants: { [key: string]: 'success' | 'warning' | 'danger' | 'info' | 'default' } = {
      pending: 'warning',
      approved: 'info',
      in_transit: 'info',
      received: 'success',
      rejected: 'danger'
    };
    return variants[status] || 'default';
  }
}
