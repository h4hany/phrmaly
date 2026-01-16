import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WizardStepperComponent, WizardStep } from '../../../shared/components/wizard-stepper/wizard-stepper.component';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TransferEngineService } from '../../../core/engines/transfer-engine.service';
import { TransferItem } from '../../../core/models/transfer.model';
import { DrugsService } from '../../../core/services/drugs.service';
import { PharmacyDrug } from '../../../core/models/drug.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-transfer-wizard',
  standalone: true,
  imports: [CommonModule, WizardStepperComponent, TableComponent, ButtonComponent, TranslatePipe],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <button (click)="router.navigate(['/inventory/transfers'])" class="text-sm text-gray-600 hover:text-gray-900">
          ← {{ 'common.back' | translate }}
        </button>
      </div>

      <app-wizard-stepper
        [steps]="steps"
        [currentStep]="currentStep"
        (stepChange)="currentStep = $event"
      ></app-wizard-stepper>

      <div class="p-6 rounded-lg" style="background-color: var(--card-bg);">
        @if (currentStep === 0) {
          <!-- Step 1: Select Branches -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold mb-4">{{ 'transfers.selectBranches' | translate }}</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">{{ 'transfers.fromBranch' | translate }}</label>
                <select [value]="fromBranchId" (change)="fromBranchId = $any($event.target).value" class="w-full px-3 py-2 border rounded-md">
                  <option value="">{{ 'common.all' | translate }}</option>
                  <option value="branch1">Main Branch</option>
                  <option value="branch2">North Branch</option>
                  <option value="branch3">South Branch</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">{{ 'transfers.toBranch' | translate }}</label>
                <select [value]="toBranchId" (change)="toBranchId = $any($event.target).value" class="w-full px-3 py-2 border rounded-md">
                  <option value="">{{ 'common.all' | translate }}</option>
                  <option value="branch1">Main Branch</option>
                  <option value="branch2">North Branch</option>
                  <option value="branch3">South Branch</option>
                </select>
              </div>
            </div>
          </div>
        } @else if (currentStep === 1) {
          <!-- Step 2: Add Items -->
          <div class="space-y-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold">{{ 'transfers.addItems' | translate }}</h3>
              <app-button (onClick)="showAddItem = true">{{ 'common.add' | translate }}</app-button>
            </div>
            
            @if (items.length > 0) {
              <app-table
                [columns]="itemColumns"
                [data]="items"
                [emptyMessage]="'transfers.noItems'"
              >
                <ng-template #actionTemplate let-item let-i="index">
                  <button
                    (click)="removeItem(i)"
                    class="text-sm px-3 py-1 rounded text-red-600 hover:bg-red-50"
                  >
                    {{ 'common.delete' | translate }}
                  </button>
                </ng-template>
              </app-table>
            } @else {
              <p class="text-center py-8 text-gray-500">{{ 'transfers.noItems' | translate }}</p>
            }
          </div>
        } @else if (currentStep === 2) {
          <!-- Step 3: Review -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold mb-4">{{ 'transfers.review' | translate }}</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">{{ 'transfers.fromBranch' | translate }}</span>
                <span class="font-medium">{{ getBranchName(fromBranchId) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ 'transfers.toBranch' | translate }}</span>
                <span class="font-medium">{{ getBranchName(toBranchId) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ 'transfers.items' | translate }}</span>
                <span class="font-medium">{{ items.length }} {{ 'transfers.items' | translate }}</span>
              </div>
            </div>
          </div>
        }

        <div class="flex justify-between mt-6 pt-6 border-t">
          <app-button
            variant="outline"
            [disabled]="currentStep === 0"
            (onClick)="currentStep = currentStep - 1"
          >
            {{ 'common.previous' | translate }}
          </app-button>
          @if (currentStep < steps.length - 1) {
            <app-button
              variant="primary"
              [disabled]="!canProceed()"
              (onClick)="currentStep = currentStep + 1"
            >
              {{ 'common.next' | translate }}
            </app-button>
          } @else {
            <app-button
              variant="primary"
              [disabled]="!canSubmit()"
              (onClick)="submitTransfer()"
            >
              {{ 'transfers.submit' | translate }}
            </app-button>
          }
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class TransferWizardComponent implements OnInit {
  private transferEngine = inject(TransferEngineService);
  private drugsService = inject(DrugsService);
  router = inject(Router);

  currentStep = 0;
  fromBranchId = '';
  toBranchId = '';
  items: TransferItem[] = [];
  showAddItem = false;
  availableDrugs: PharmacyDrug[] = [];

  steps: WizardStep[] = [
    { id: 'branches', label: 'transfers.selectBranches', description: 'transfers.selectBranchesDesc' },
    { id: 'items', label: 'transfers.addItems', description: 'transfers.addItemsDesc' },
    { id: 'review', label: 'transfers.review', description: 'transfers.reviewDesc' }
  ];

  itemColumns: TableColumn[] = [
    { key: 'drugName', label: 'transfers.drug' },
    { key: 'requestedQuantity', label: 'transfers.quantity' }
  ];

  ngOnInit(): void {
    this.loadDrugs();
  }

  loadDrugs(): void {
    this.drugsService.getPharmacyDrugs().subscribe({
      next: (response) => {
        this.availableDrugs = response.data;
      }
    });
  }

  canProceed(): boolean {
    if (this.currentStep === 0) {
      return !!this.fromBranchId && !!this.toBranchId && this.fromBranchId !== this.toBranchId;
    }
    if (this.currentStep === 1) {
      return this.items.length > 0;
    }
    return true;
  }

  canSubmit(): boolean {
    return this.items.length > 0 && !!this.fromBranchId && !!this.toBranchId;
  }

  removeItem(index: number): void {
    this.items.splice(index, 1);
  }

  getBranchName(branchId: string): string {
    const names: { [key: string]: string } = {
      branch1: 'Main Branch',
      branch2: 'North Branch',
      branch3: 'South Branch'
    };
    return names[branchId] || branchId;
  }

  submitTransfer(): void {
    const transfer = {
      fromBranchId: this.fromBranchId,
      toBranchId: this.toBranchId,
      items: this.items,
      requestedBy: 'current-user-id',
      notes: '',
      createdBy: 'current-user-id'
    };

    this.transferEngine.createTransfer(transfer).subscribe({
      next: () => {
        this.router.navigate(['/inventory/transfers']);
      }
    });
  }
}
