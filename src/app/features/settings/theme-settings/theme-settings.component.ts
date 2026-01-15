import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ThemeService, ThemeColors } from '../../../core/services/theme.service';
import { FormWrapperComponent } from '../../../shared/components/form-wrapper/form-wrapper.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-theme-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormWrapperComponent,
    ButtonComponent,
    AlertComponent
  ],
  template: `
    <app-form-wrapper title="Theme Settings" subtitle="Customize the appearance of your application">
      <form [formGroup]="themeForm" (ngSubmit)="onSubmit()" class="space-y-8">
        
        <!-- Primary Colors -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Primary Colors</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Primary Background</label>
              <div class="flex items-center gap-3">
                <input type="color" formControlName="primaryBg" class="w-16 h-10 rounded cursor-pointer border border-gray-300" />
                <input type="text" formControlName="primaryBg" class="flex-1 px-4 py-2 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-bg)]" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Primary Text</label>
              <div class="flex items-center gap-3">
                <input type="color" formControlName="primaryText" class="w-16 h-10 rounded cursor-pointer border border-gray-300" />
                <input type="text" formControlName="primaryText" class="flex-1 px-4 py-2 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-bg)]" />
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Colors -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Sidebar Colors</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Sidebar Background</label>
              <div class="flex items-center gap-3">
                <input type="color" formControlName="sidebarBg" class="w-16 h-10 rounded cursor-pointer border border-gray-300" />
                <input type="text" formControlName="sidebarBg" class="flex-1 px-4 py-2 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-bg)]" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Sidebar Text</label>
              <div class="flex items-center gap-3">
                <input type="color" formControlName="sidebarText" class="w-16 h-10 rounded cursor-pointer border border-gray-300" />
                <input type="text" formControlName="sidebarText" class="flex-1 px-4 py-2 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-bg)]" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Sidebar Active Background</label>
              <div class="flex items-center gap-3">
                <input type="color" formControlName="sidebarActiveBg" class="w-16 h-10 rounded cursor-pointer border border-gray-300" />
                <input type="text" formControlName="sidebarActiveBg" class="flex-1 px-4 py-2 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-bg)]" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Sidebar Active Text</label>
              <div class="flex items-center gap-3">
                <input type="color" formControlName="sidebarActiveText" class="w-16 h-10 rounded cursor-pointer border border-gray-300" />
                <input type="text" formControlName="sidebarActiveText" class="flex-1 px-4 py-2 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-bg)]" />
              </div>
            </div>
          </div>
        </div>

        <!-- Card Colors -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Card Colors</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Card Background</label>
              <div class="flex items-center gap-3">
                <input type="color" formControlName="cardBg" class="w-16 h-10 rounded cursor-pointer border border-gray-300" />
                <input type="text" formControlName="cardBg" class="flex-1 px-4 py-2 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-bg)]" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Card Text</label>
              <div class="flex items-center gap-3">
                <input type="color" formControlName="cardText" class="w-16 h-10 rounded cursor-pointer border border-gray-300" />
                <input type="text" formControlName="cardText" class="flex-1 px-4 py-2 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-bg)]" />
              </div>
            </div>
          </div>
        </div>

        <!-- Page Colors -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Page Colors</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Page Background</label>
              <div class="flex items-center gap-3">
                <input type="color" formControlName="pageBg" class="w-16 h-10 rounded cursor-pointer border border-gray-300" />
                <input type="text" formControlName="pageBg" class="flex-1 px-4 py-2 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-bg)]" />
              </div>
            </div>
          </div>
        </div>

        <!-- Status Colors -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Status Colors</h3>
          
          <!-- Success -->
          <div class="space-y-3">
            <h4 class="text-md font-medium text-gray-800">Success</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div class="flex items-center gap-3">
                  <input type="color" formControlName="successColor" class="w-16 h-10 rounded cursor-pointer border border-gray-300" />
                  <input type="text" formControlName="successColor" class="flex-1 px-4 py-2 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-bg)]" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Background</label>
                <div class="flex items-center gap-3">
                  <input type="color" formControlName="successBg" class="w-16 h-10 rounded cursor-pointer border border-gray-300" />
                  <input type="text" formControlName="successBg" class="flex-1 px-4 py-2 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-bg)]" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Text</label>
                <div class="flex items-center gap-3">
                  <input type="color" formControlName="successText" class="w-16 h-10 rounded cursor-pointer border border-gray-300" />
                  <input type="text" formControlName="successText" class="flex-1 px-4 py-2 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-bg)]" />
                </div>
              </div>
            </div>
          </div>

          <!-- Warning -->
          <div class="space-y-3">
            <h4 class="text-md font-medium text-gray-800">Warning</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div class="flex items-center gap-3">
                  <input type="color" formControlName="warningColor" class="w-16 h-10 rounded cursor-pointer border border-gray-300" />
                  <input type="text" formControlName="warningColor" class="flex-1 px-4 py-2 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-bg)]" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Background</label>
                <div class="flex items-center gap-3">
                  <input type="color" formControlName="warningBg" class="w-16 h-10 rounded cursor-pointer border border-gray-300" />
                  <input type="text" formControlName="warningBg" class="flex-1 px-4 py-2 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-bg)]" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Text</label>
                <div class="flex items-center gap-3">
                  <input type="color" formControlName="warningText" class="w-16 h-10 rounded cursor-pointer border border-gray-300" />
                  <input type="text" formControlName="warningText" class="flex-1 px-4 py-2 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-bg)]" />
                </div>
              </div>
            </div>
          </div>

          <!-- Danger -->
          <div class="space-y-3">
            <h4 class="text-md font-medium text-gray-800">Danger</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div class="flex items-center gap-3">
                  <input type="color" formControlName="dangerColor" class="w-16 h-10 rounded cursor-pointer border border-gray-300" />
                  <input type="text" formControlName="dangerColor" class="flex-1 px-4 py-2 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-bg)]" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Background</label>
                <div class="flex items-center gap-3">
                  <input type="color" formControlName="dangerBg" class="w-16 h-10 rounded cursor-pointer border border-gray-300" />
                  <input type="text" formControlName="dangerBg" class="flex-1 px-4 py-2 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-bg)]" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Text</label>
                <div class="flex items-center gap-3">
                  <input type="color" formControlName="dangerText" class="w-16 h-10 rounded cursor-pointer border border-gray-300" />
                  <input type="text" formControlName="dangerText" class="flex-1 px-4 py-2 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-bg)]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Other Colors -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Other Colors</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Patient Card Background</label>
              <div class="flex items-center gap-3">
                <input type="color" formControlName="patientCardBg" class="w-16 h-10 rounded cursor-pointer border border-gray-300" />
                <input type="text" formControlName="patientCardBg" class="flex-1 px-4 py-2 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-bg)]" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Patient Card Text</label>
              <div class="flex items-center gap-3">
                <input type="color" formControlName="patientCardText" class="w-16 h-10 rounded cursor-pointer border border-gray-300" />
                <input type="text" formControlName="patientCardText" class="flex-1 px-4 py-2 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-bg)]" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Scrollbar Background</label>
              <div class="flex items-center gap-3">
                <input type="color" formControlName="scrollbarBg" class="w-16 h-10 rounded cursor-pointer border border-gray-300" />
                <input type="text" formControlName="scrollbarBg" class="flex-1 px-4 py-2 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-bg)]" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Scrollbar Thumb</label>
              <div class="flex items-center gap-3">
                <input type="color" formControlName="scrollbarThumb" class="w-16 h-10 rounded cursor-pointer border border-gray-300" />
                <input type="text" formControlName="scrollbarThumb" class="flex-1 px-4 py-2 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-bg)]" />
              </div>
            </div>
          </div>
        </div>

        @if (successMessage) {
          <app-alert type="success" [title]="successMessage" />
        }

        <!-- Form Actions -->
        <div class="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
          <app-button variant="outline" (onClick)="resetTheme()" type="button">
            Reset to Default
          </app-button>
          <app-button variant="primary" type="submit" [loading]="saving">
            Save Changes
          </app-button>
        </div>
      </form>
    </app-form-wrapper>
  `,
  styles: []
})
export class ThemeSettingsComponent implements OnInit {
  private themeService = inject(ThemeService);
  private fb = inject(FormBuilder);

  themeForm!: FormGroup;
  saving = false;
  successMessage = '';

  ngOnInit(): void {
    const currentTheme = this.themeService.getTheme();
    this.themeForm = this.fb.group({
      primaryBg: [currentTheme.primaryBg],
      primaryText: [currentTheme.primaryText],
      sidebarBg: [currentTheme.sidebarBg],
      sidebarText: [currentTheme.sidebarText],
      sidebarActiveBg: [currentTheme.sidebarActiveBg],
      sidebarActiveText: [currentTheme.sidebarActiveText],
      cardBg: [currentTheme.cardBg],
      cardText: [currentTheme.cardText],
      pageBg: [currentTheme.pageBg],
      successColor: [currentTheme.successColor],
      successBg: [currentTheme.successBg],
      successText: [currentTheme.successText],
      warningColor: [currentTheme.warningColor],
      warningBg: [currentTheme.warningBg],
      warningText: [currentTheme.warningText],
      dangerColor: [currentTheme.dangerColor],
      dangerBg: [currentTheme.dangerBg],
      dangerText: [currentTheme.dangerText],
      patientCardBg: [currentTheme.patientCardBg],
      patientCardText: [currentTheme.patientCardText],
      scrollbarBg: [currentTheme.scrollbarBg],
      scrollbarThumb: [currentTheme.scrollbarThumb]
    });

    // Apply changes in real-time as user types
    this.themeForm.valueChanges.subscribe(values => {
      this.themeService.applyTheme(values);
    });
  }

  onSubmit(): void {
    if (this.themeForm.valid) {
      this.saving = true;
      this.successMessage = '';
      
      const themeColors: Partial<ThemeColors> = this.themeForm.value;
      this.themeService.saveTheme(themeColors);
      
      setTimeout(() => {
        this.saving = false;
        this.successMessage = 'Theme settings saved successfully!';
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      }, 500);
    }
  }

  resetTheme(): void {
    const defaultTheme = this.themeService.getDefaultTheme();
    this.themeForm.patchValue(defaultTheme);
    this.themeService.resetTheme();
    this.successMessage = 'Theme reset to default values';
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }
}





