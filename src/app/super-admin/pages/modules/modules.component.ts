import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModernFormWrapperComponent } from '../../../shared/components/modern-form-wrapper/modern-form-wrapper.component';
import { FormSectionComponent } from '../../../shared/components/form-section/form-section.component';
import { TextInputComponent } from '../../../shared/components/input/text-input.component';
import { TextareaInputComponent } from '../../../shared/components/input/textarea-input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

interface Module {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  capabilities: string;
  capabilities_ar: string;
  pricePerMonth: number;
}

@Component({
  selector: 'app-modules',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModernFormWrapperComponent,
    FormSectionComponent,
    TextInputComponent,
    TextareaInputComponent,
    ButtonComponent,
    ModalComponent,
    TranslatePipe
  ],
  template: `
    <app-modern-form-wrapper
      [title]="'modules.title'"
      [description]="'modules.description'"
      [errorMessage]="errorMessage"
    >
      <div class="p-8">
        <!-- Header with Create Button -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">{{ 'modules.listTitle' | translate }}</h2>
          <app-button variant="primary" (onClick)="openCreateModal()">
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ 'modules.createModule' | translate }}
          </app-button>
        </div>

        <!-- Modules Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (module of modules; track module.id) {
            <div class="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-gray-900">{{ module.name }}</h3>
              </div>
              <p class="text-gray-600 mb-4">{{ module.description }}</p>
              <div class="space-y-2 mb-4">
                <div class="text-sm text-gray-700">
                  <span class="font-semibold">{{ 'modules.capabilities' | translate }}:</span>
                  <p class="mt-1">{{ module.capabilities }}</p>
                </div>
              </div>
              <div class="flex items-center justify-between pt-4 border-t border-gray-200">
                <div class="text-2xl font-bold text-gray-900">
                  {{ module.pricePerMonth }}<span class="text-sm font-normal text-gray-600">/{{ 'modules.perMonth' | translate }}</span>
                </div>
              </div>
            </div>
          }
        </div>

        @if (modules.length === 0) {
          <div class="text-center py-12">
            <p class="text-gray-500">{{ 'modules.noModules' | translate }}</p>
          </div>
        }
      </div>
    </app-modern-form-wrapper>

    <!-- Create Module Modal -->
    <app-modal
      #createModuleModal
      [title]="'modules.createModule' | translate"
      [showFooter]="false"
      [size]="'large'"
    >
      <form [formGroup]="moduleForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <app-form-section [title]="'modules.basicInfo'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <app-text-input
              formControlName="name"
              [label]="'modules.name'"
              [required]="true"
              [placeholder]="'modules.namePlaceholder'"
            />

            <app-text-input
              formControlName="name_ar"
              [label]="'modules.nameAr'"
              [required]="true"
              [placeholder]="'modules.nameArPlaceholder'"
            />
          </div>
        </app-form-section>

        <app-form-section [title]="'modules.description'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <app-textarea-input
              formControlName="description"
              [label]="'modules.description'"
              [required]="true"
              [placeholder]="'modules.descriptionPlaceholder'"
              [rows]="4"
            />

            <app-textarea-input
              formControlName="description_ar"
              [label]="'modules.descriptionAr'"
              [required]="true"
              [placeholder]="'modules.descriptionArPlaceholder'"
              [rows]="4"
            />
          </div>
        </app-form-section>

        <app-form-section [title]="'modules.capabilities'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <app-textarea-input
              formControlName="capabilities"
              [label]="'modules.capabilities'"
              [required]="true"
              [placeholder]="'modules.capabilitiesPlaceholder'"
              [rows]="4"
            />

            <app-textarea-input
              formControlName="capabilities_ar"
              [label]="'modules.capabilitiesAr'"
              [required]="true"
              [placeholder]="'modules.capabilitiesArPlaceholder'"
              [rows]="4"
            />
          </div>
        </app-form-section>

        <app-form-section [title]="'modules.pricing'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <app-text-input
              formControlName="pricePerMonth"
              type="number"
              [label]="'modules.pricePerMonth'"
              [required]="true"
              [placeholder]="'modules.pricePerMonthPlaceholder'"
              [min]="0"
              [step]="0.01"
            />
          </div>
        </app-form-section>

        <!-- Form Actions -->
        <div class="flex items-center justify-end gap-4 pt-8 border-t-2 border-gray-100">
          <app-button variant="outline" type="button" (onClick)="closeCreateModal()">
            {{ 'common.cancel' | translate }}
          </app-button>
          <app-button
            variant="primary"
            type="submit"
            [disabled]="moduleForm.invalid || loading"
            [loading]="loading"
          >
            {{ 'common.create' | translate }}
          </app-button>
        </div>
      </form>
    </app-modal>
  `,
  styles: []
})
export class ModulesComponent implements OnInit {
  private fb = inject(FormBuilder);

  @ViewChild('createModuleModal') createModuleModal!: ModalComponent;

  modules: Module[] = [];
  loading = false;
  errorMessage = '';
  moduleForm!: FormGroup;

  ngOnInit(): void {
    this.initializeForm();
    this.loadModules();
  }

  initializeForm(): void {
    this.moduleForm = this.fb.group({
      name: ['', [Validators.required]],
      name_ar: ['', [Validators.required]],
      description: ['', [Validators.required]],
      description_ar: ['', [Validators.required]],
      capabilities: ['', [Validators.required]],
      capabilities_ar: ['', [Validators.required]],
      pricePerMonth: [0, [Validators.required, Validators.min(0)]]
    });
  }

  loadModules(): void {
    // Mock data
    this.modules = [
      {
        id: '1',
        name: 'Inventory Management',
        name_ar: 'إدارة المخزون',
        description: 'Comprehensive inventory management system with real-time tracking, stock alerts, and automated reordering.',
        description_ar: 'نظام شامل لإدارة المخزون مع التتبع في الوقت الفعلي وتنبيهات المخزون وإعادة الطلب التلقائية.',
        capabilities: 'Real-time stock tracking, Automated reorder points, Batch and expiry management, Multi-location inventory, Stock movement history',
        capabilities_ar: 'تتبع المخزون في الوقت الفعلي، نقاط إعادة الطلب التلقائية، إدارة الدفعات وانتهاء الصلاحية، مخزون متعدد المواقع، سجل حركة المخزون',
        pricePerMonth: 150
      },
      {
        id: '2',
        name: 'HR & People',
        name_ar: 'الموارد البشرية والأشخاص',
        description: 'Complete human resources management including employee records, scheduling, attendance, and payroll integration.',
        description_ar: 'إدارة كاملة للموارد البشرية تشمل سجلات الموظفين والجدولة والحضور وتكامل الرواتب.',
        capabilities: 'Employee management, Shift scheduling, Attendance tracking, Payroll integration, Performance reviews',
        capabilities_ar: 'إدارة الموظفين، جدولة الورديات، تتبع الحضور، تكامل الرواتب، مراجعات الأداء',
        pricePerMonth: 200
      },
      {
        id: '3',
        name: 'Finance',
        name_ar: 'المالية',
        description: 'Financial management tools for accounting, invoicing, payments, and comprehensive financial reporting.',
        description_ar: 'أدوات إدارة مالية للمحاسبة والفواتير والمدفوعات والتقارير المالية الشاملة.',
        capabilities: 'Accounting & bookkeeping, Invoice generation, Payment processing, Financial reports, Tax management',
        capabilities_ar: 'المحاسبة والمسك الدفاتر، إنشاء الفواتير، معالجة المدفوعات، التقارير المالية، إدارة الضرائب',
        pricePerMonth: 180
      },
      {
        id: '4',
        name: 'Automation',
        name_ar: 'الأتمتة',
        description: 'Automate repetitive tasks, workflows, and business processes to increase efficiency and reduce manual work.',
        description_ar: 'أتمتة المهام المتكررة وسير العمل والعمليات التجارية لزيادة الكفاءة وتقليل العمل اليدوي.',
        capabilities: 'Workflow automation, Task scheduling, Rule-based actions, Notification automation, Integration automation',
        capabilities_ar: 'أتمتة سير العمل، جدولة المهام، الإجراءات القائمة على القواعد، أتمتة الإشعارات، أتمتة التكامل',
        pricePerMonth: 120
      },
      {
        id: '5',
        name: 'Loyalty',
        name_ar: 'الولاء',
        description: 'Customer loyalty program management with points, rewards, discounts, and customer engagement tools.',
        description_ar: 'إدارة برنامج ولاء العملاء مع النقاط والمكافآت والخصومات وأدوات تفاعل العملاء.',
        capabilities: 'Points system, Rewards management, Customer segmentation, Promotional campaigns, Loyalty analytics',
        capabilities_ar: 'نظام النقاط، إدارة المكافآت، تجزئة العملاء، الحملات الترويجية، تحليلات الولاء',
        pricePerMonth: 100
      },
      {
        id: '6',
        name: 'API Access',
        name_ar: 'الوصول إلى API',
        description: 'Full API access for custom integrations, third-party connections, and advanced system integrations.',
        description_ar: 'وصول كامل إلى API للتكاملات المخصصة والاتصالات مع الأطراف الثالثة وتكاملات النظام المتقدمة.',
        capabilities: 'RESTful API access, Webhook support, API documentation, Rate limiting, Custom integrations',
        capabilities_ar: 'الوصول إلى RESTful API، دعم Webhook، توثيق API، تحديد معدل الاستخدام، التكاملات المخصصة',
        pricePerMonth: 250
      }
    ];
  }

  openCreateModal(): void {
    this.moduleForm.reset();
    this.moduleForm.patchValue({
      pricePerMonth: 0
    });
    this.createModuleModal.open();
  }

  closeCreateModal(): void {
    this.createModuleModal.close();
    this.moduleForm.reset();
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (this.moduleForm.invalid) {
      this.moduleForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formValue = this.moduleForm.value;
    const newModule: Module = {
      id: Date.now().toString(),
      name: formValue.name,
      name_ar: formValue.name_ar,
      description: formValue.description,
      description_ar: formValue.description_ar,
      capabilities: formValue.capabilities,
      capabilities_ar: formValue.capabilities_ar,
      pricePerMonth: parseFloat(formValue.pricePerMonth)
    };

    // Simulate API call
    setTimeout(() => {
      this.modules.push(newModule);
      this.loading = false;
      this.closeCreateModal();
    }, 1000);
  }
}

