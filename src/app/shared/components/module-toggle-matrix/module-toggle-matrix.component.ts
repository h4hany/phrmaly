import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformModule } from '../../../core/models/platform.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-module-toggle-matrix',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="bg-[var(--card-bg)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
      <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-4">{{ 'platform.modules.title' | translate }}</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        @for (module of allModules; track module) {
          <label class="flex items-center gap-3 p-4 border border-[var(--border-color)] rounded-[var(--radius-md)] cursor-pointer hover:bg-[var(--page-bg)] transition-colors"
                 [class.bg-green-50]="isEnabled(module)"
                 [class.border-green-500]="isEnabled(module)">
            <input
              type="checkbox"
              [checked]="isEnabled(module)"
              (change)="toggleModule(module)"
              class="w-5 h-5 text-[var(--primary-color)] rounded focus:ring-2 focus:ring-[var(--primary-color)]"
            />
            <span class="text-sm font-medium text-[var(--text-primary)]">{{ 'platform.modules.' + module | translate }}</span>
          </label>
        }
      </div>
    </div>
  `,
  styles: []
})
export class ModuleToggleMatrixComponent {
  @Input() enabledModules: PlatformModule[] = [];
  @Output() modulesChange = new EventEmitter<PlatformModule[]>();

  allModules: PlatformModule[] = [
    'inventory',
    'hr',
    'finance',
    'automation',
    'loyalty',
    'api_access',
    'ai_features',
    'analytics',
    'reports',
    'multi_branch'
  ];

  isEnabled(module: PlatformModule): boolean {
    return this.enabledModules.includes(module);
  }

  toggleModule(module: PlatformModule): void {
    const updated = this.isEnabled(module)
      ? this.enabledModules.filter(m => m !== module)
      : [...this.enabledModules, module];
    this.modulesChange.emit(updated);
  }
}



