import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PharmacyContextService } from '../../core/services/pharmacy-context.service';
import { ThemeService } from '../../core/services/theme.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

interface NavGroup {
  label: string;
  icon: string;
  items: NavItem[];
  collapsed?: boolean;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    <div class="flex h-screen" style="background-color: var(--page-bg);">
      <!-- Sidebar Container with padding -->
      <div class="py-4 pl-4 flex-shrink-0">
        <aside class="w-64 h-full rounded-[var(--radius-lg)] flex flex-col relative overflow-hidden overflow-x-hidden" style="background-color: var(--sidebar-bg);">
          <!-- Logo -->
          <div class="p-6 border-b relative z-10" style="border-color: rgba(227, 244, 245, 0.1);">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background-color: var(--primary-bg);">
                <span class="text-xl font-bold" style="color: var(--primary-text);">P</span>
              </div>
              <span class="text-xl font-bold" style="color: var(--sidebar-text);">Pharmly</span>
            </div>
          </div>

          <!-- Navigation -->
          <nav class="flex-1 overflow-y-auto overflow-x-hidden p-4 relative z-10">
            <!-- Medicine Icon Pattern Background (3 patterns spread across nav area) -->
            <div class="absolute inset-0 pointer-events-none" style="opacity: 0.15;">
              <!-- Icon 1 - Top Left -->
              <div class="absolute" style="top: 15%; left: -5%;">
                <img src="/icons/medicine.svg" alt="" class="w-24 h-24" style="filter: brightness(0) invert(1); opacity: 0.4;" />
              </div>
              <!-- Icon 2 - Middle Right -->
              <div class="absolute" style="top: 50%; right: -5%;">
                <img src="/icons/medicine.svg" alt="" class="w-24 h-24" style="filter: brightness(0) invert(1); opacity: 0.4;" />
              </div>
              <!-- Icon 3 - Bottom Center -->
              <div class="absolute" style="bottom: 15%; left: 50%; transform: translateX(-50%);">
                <img src="/icons/medicine.svg" alt="" class="w-24 h-24" style="filter: brightness(0) invert(1); opacity: 0.4;" />
              </div>
            </div>
            <ul class="space-y-2 relative z-10">
              <!-- Single Items -->
              <li>
                <a
                  [routerLink]="'/dashboard'"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{exact: true}"
                  class="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] transition-colors"
                  style="color: var(--sidebar-text);"
                >
                  <img [src]="getIcon('grid')" alt="" class="w-5 h-5" style="filter: brightness(0) invert(1);" />
                  <span>{{ 'nav.overview' | translate }}</span>
                </a>
              </li>

              <!-- Drug Group (Products, Bundles, Inventory Alerts) -->
              <li>
                <button
                  type="button"
                  (click)="toggleGroup('drug')"
                  class="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-[var(--radius-md)] transition-colors hover:opacity-80"
                  style="color: var(--sidebar-text);"
                >
                  <div class="flex items-center gap-3">
                    <img [src]="getIcon('pill')" alt="" class="w-5 h-5" style="filter: brightness(0) invert(1);" />
                    <span>{{ 'nav.drug' | translate }}</span>
                  </div>
                  <svg 
                    class="w-4 h-4 transition-transform" 
                    [class.rotate-180]="!isGroupCollapsed('drug')"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                @if (!isGroupCollapsed('drug')) {
                  <ul class="mt-2 ml-4 space-y-1">
                    @for (item of navGroups['drug'].items; track item.path) {
                      <li>
                        <a
                          [routerLink]="item.path"
                          routerLinkActive="active"
                          [routerLinkActiveOptions]="{exact: false}"
                          class="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] transition-colors"
                          style="color: var(--sidebar-text);"
                        >
                          <img [src]="item.icon" alt="" class="w-5 h-5" style="filter: brightness(0) invert(1);" />
                          <span>{{ item.label | translate }}</span>
                        </a>
                      </li>
                    }
                  </ul>
                }
              </li>

              <!-- Suppliers/Orders Group -->
              <li>
                <button
                  type="button"
                  (click)="toggleGroup('suppliers')"
                  class="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-[var(--radius-md)] transition-colors hover:opacity-80"
                  style="color: var(--sidebar-text);"
                >
                  <div class="flex items-center gap-3">
                    <img [src]="getIcon('truck')" alt="" class="w-5 h-5" style="filter: brightness(0) invert(1);" />
                    <span>{{ 'nav.suppliers' | translate }}</span>
                  </div>
                  <svg 
                    class="w-4 h-4 transition-transform" 
                    [class.rotate-180]="!isGroupCollapsed('suppliers')"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                @if (!isGroupCollapsed('suppliers')) {
                  <ul class="mt-2 ml-4 space-y-1">
                    @for (item of navGroups['suppliers'].items; track item.path) {
                      <li>
                        <a
                          [routerLink]="item.path"
                          routerLinkActive="active"
                          [routerLinkActiveOptions]="{exact: false}"
                          class="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] transition-colors"
                          style="color: var(--sidebar-text);"
                        >
                          <img [src]="item.icon" alt="" class="w-5 h-5" style="filter: brightness(0) invert(1);" />
                          <span>{{ item.label | translate }}</span>
                        </a>
                      </li>
                    }
                  </ul>
                }
              </li>

              <!-- Single Items (Sales, Customers, Payments, Staff) -->
              <li>
                <a
                  [routerLink]="'/invoices'"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{exact: false}"
                  class="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] transition-colors"
                  style="color: var(--sidebar-text);"
                >
                  <img [src]="getIcon('chart')" alt="" class="w-5 h-5" style="filter: brightness(0) invert(1);" />
                  <span>{{ 'nav.sales' | translate }}</span>
                </a>
              </li>

              <li>
                <a
                  [routerLink]="'/patients'"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{exact: false}"
                  class="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] transition-colors"
                  style="color: var(--sidebar-text);"
                >
                  <img [src]="getIcon('users')" alt="" class="w-5 h-5" style="filter: brightness(0) invert(1);" />
                  <span>{{ 'nav.customers' | translate }}</span>
                </a>
              </li>

              <li>
                <a
                  [routerLink]="'/payments'"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{exact: false}"
                  class="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] transition-colors"
                  style="color: var(--sidebar-text);"
                >
                  <img [src]="getIcon('card')" alt="" class="w-5 h-5" style="filter: brightness(0) invert(1);" />
                  <span>{{ 'nav.payments' | translate }}</span>
                </a>
              </li>

              <li>
                <a
                  [routerLink]="'/pharmacy-staff'"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{exact: false}"
                  class="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] transition-colors"
                  style="color: var(--sidebar-text);"
                >
                  <img [src]="getIcon('staff')" alt="" class="w-5 h-5" style="filter: brightness(0) invert(1);" />
                  <span>{{ 'nav.pharmacyStaff' | translate }}</span>
                </a>
              </li>

              <li>
                <a
                  [routerLink]="'/audit-logs'"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{exact: false}"
                  class="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] transition-colors"
                  style="color: var(--sidebar-text);"
                >
                  <img [src]="getIcon('chart')" alt="" class="w-5 h-5" style="filter: brightness(0) invert(1);" />
                  <span>{{ 'nav.auditLogs' | translate }}</span>
                </a>
              </li>
            </ul>
          </nav>

          <!-- Help & Support and Settings -->
          <div class="px-4 pb-4 border-t relative z-10" style="border-color: rgba(227, 244, 245, 0.1); padding-top: 1rem;">
            <ul class="space-y-2">
              <li>
                <a
                  [routerLink]="'/reports'"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{exact: false}"
                  class="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] transition-colors"
                  style="color: var(--sidebar-text);"
                >
                  <img [src]="getIcon('help')" alt="" class="w-5 h-5" style="filter: brightness(0) invert(1);" />
                  <span>{{ 'nav.helpSupport' | translate }}</span>
                </a>
              </li>

              <li>
                <a
                  [routerLink]="'/settings'"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{exact: false}"
                  class="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] transition-colors"
                  style="color: var(--sidebar-text);"
                >
                  <img [src]="getIcon('settings')" alt="" class="w-5 h-5" style="filter: brightness(0) invert(1);" />
                  <span>{{ 'nav.settings' | translate }}</span>
                </a>
              </li>
            </ul>
          </div>

          <!-- Upgrade Section -->
          <div class="p-4 border-t relative z-10" style="border-color: rgba(227, 244, 245, 0.1);">
            <div class="rounded-[var(--radius-md)] p-4" style="background-color: rgba(227, 244, 245, 0.1);">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-5 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--sidebar-text);">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span class="font-semibold text-sm" style="color: var(--sidebar-text);">{{ 'upgrade.title' | translate }}</span>
              </div>
              <p class="text-xs mb-3" style="color: var(--sidebar-text); opacity: 0.8;">
                {{ 'upgrade.description' | translate }}
              </p>
              <button class="w-full rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90" style="background-color: var(--primary-bg); color: var(--primary-text);">
                {{ 'upgrade.button' | translate }}
              </button>
            </div>
          </div>

          <!-- Logout -->
          <div class="p-4 border-t relative z-10" style="border-color: rgba(227, 244, 245, 0.1);">
            <button
              (click)="logout()"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] transition-colors hover:opacity-80"
              style="color: var(--sidebar-text);"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>{{ 'nav.logout' | translate }}</span>
            </button>
          </div>
        </aside>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Header Container -->
        <div class="pt-4" style="padding-left: var(--spacing-page); padding-right: var(--spacing-page);">
          <header class="bg-white rounded-[var(--radius-lg)] px-6 py-4">
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-2xl font-bold text-gray-900">{{ currentTitle | translate }}</h1>
                <p class="text-sm text-gray-600 mt-1">{{ 'dashboard.subtitle' | translate }}</p>
              </div>
              <div class="flex items-center gap-4">
                <!-- Language Selector -->
                <div class="relative">
                  <button
                    type="button"
                    (click)="toggleLanguage()"
                    class="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-[var(--radius-md)] text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <span>{{ currentLanguage() === 'en' ? 'EN' : 'AR' }}</span>
                  </button>
                </div>
                <!-- Search -->
                <div class="relative">
                  <input
                    type="text"
                    [placeholder]="'header.search' | translate"
                    class="pl-10 pr-4 py-2 border border-gray-300 rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-bg)]/20 focus:border-[var(--primary-bg)]"
                    style="background-color: white;"
                  />
                  <svg class="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <!-- Notifications -->
                <button class="relative p-2 text-gray-600 hover:text-gray-900">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <!-- User Profile -->
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div class="text-left">
                    <div class="text-sm font-medium text-gray-900">James Bond</div>
                    <div class="text-xs text-gray-500">&#64;james.bond</div>
                  </div>
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </header>
        </div>

        <!-- Content Area -->
        <main class="flex-1 overflow-y-auto" style="padding: var(--spacing-page); background-color: var(--page-bg);">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
    
    <style>
      .active {
        background-color: var(--sidebar-active-bg) !important;
        color: var(--sidebar-active-text) !important;
      }
      .active img {
        filter: none !important;
      }
    </style>
  `,
  styles: []
})
export class MainLayoutComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private pharmacyContextService = inject(PharmacyContextService);
  private themeService = inject(ThemeService);
  private translationService = inject(TranslationService);

  currentTitle = 'nav.dashboard';

  collapsedGroups = signal<{ [key: string]: boolean }>({
    drug: true,
    suppliers: true
  });

  navGroups: { [key: string]: NavGroup } = {};
  
  constructor() {
    this.navGroups = {
      drug: {
        label: 'nav.drug',
        icon: this.getIcon('box'),
        items: [
          { path: '/drugs', label: 'nav.products', icon: this.getIcon('box') },
          { path: '/bundles', label: 'nav.bundles', icon: this.getIcon('bundle') },
          { path: '/inventory/alerts', label: 'nav.inventoryAlerts', icon: this.getIcon('alert') }
        ]
      },
      suppliers: {
        label: 'nav.suppliers',
        icon: this.getIcon('truck'),
        items: [
          { path: '/suppliers', label: 'nav.suppliers', icon: this.getIcon('truck') },
          { path: '/purchases', label: 'nav.orders', icon: this.getIcon('cart') }
        ]
      }
    };
  }

  ngOnInit(): void {
    this.updateTitle();
    this.router.events.subscribe(() => {
      this.updateTitle();
    });
  }

  private updateTitle(): void {
    const route = this.router.url.split('/')[1] || 'dashboard';
    const titleMap: { [key: string]: string } = {
      dashboard: 'nav.dashboard',
      patients: 'patient.list',
      drugs: 'drug.list',
      purchases: 'nav.orders',
      invoices: 'nav.sales',
      payments: 'nav.payments',
      suppliers: 'nav.suppliers',
      reports: 'nav.helpSupport',
      settings: 'nav.settings',
      inventory: 'inventory.alerts',
      bundles: 'nav.bundles',
      'pharmacy-staff': 'nav.pharmacyStaff',
      'audit-logs': 'audit.title'
    };
    this.currentTitle = titleMap[route] || 'nav.dashboard';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleLanguage(): void {
    this.themeService.toggleLanguage();
  }

  currentLanguage = this.themeService.getCurrentLanguage.bind(this.themeService);

  toggleGroup(groupKey: string): void {
    this.collapsedGroups.update(groups => ({
      ...groups,
      [groupKey]: !groups[groupKey]
    }));
  }

  isGroupCollapsed(groupKey: string): boolean {
    return this.collapsedGroups()[groupKey] ?? false;
  }

  getIcon(type: string): string {
    const iconPaths: { [key: string]: string } = {
      grid: '/icons/grid.svg',
      box: '/icons/box.svg',
      cart: '/icons/cart.svg',
      chart: '/icons/chart.svg',
      users: '/icons/users.svg',
      card: '/icons/card.svg',
      help: '/icons/help.svg',
      settings: '/icons/settings.svg',
      truck: '/icons/truck.svg',
      bundle: '/icons/bundle.svg',
      alert: '/icons/alert.svg',
      staff: '/icons/staff.svg',
      medicine: '/icons/medicine.svg',
      pill: '/icons/pill.svg'
    };
    return iconPaths[type] || '';
  }
}
