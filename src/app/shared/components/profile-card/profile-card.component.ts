import {Component, inject, Input, output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslationService} from '../../../core/services/translation.service';

export interface ProfileBadge {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
}

@Component({
  selector: 'app-profile-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="profile-card group relative rounded-xl p-6 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 flex flex-col"
      [style.color]="'var(--sidebar-text, #E3F4F5)'"
      [style.min-height]="'320px'"
    >
      <!-- Medicine Icon Pattern Background -->
      <div class="medicine-pattern absolute inset-0 pointer-events-none overflow-visible rounded-xl">
        <div
          class="absolute medicine-icon"
          [style.right]="isRTL ? 'auto' : '1rem'"
          [style.left]="isRTL ? '1rem' : 'auto'"
          [style.top]="'50%'"
          [style.transform]="'translateY(-50%)'"
        >
          <img src="icons/medicine.svg" alt="" class="w-40 h-40"
               style="filter: brightness(0) invert(1); opacity: 0.15;"/>
        </div>
      </div>

      <!-- Hover Glow Effect -->
      <div
        class="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        [style.background]="'radial-gradient(circle at center, var(--sidebar-active-bg, #D9F275)15, transparent 70%)'"
        [style.box-shadow]="'0 0 40px rgba(217, 242, 117, 0.3)'"
      ></div>

      <!-- View Button (Positioned outside cutout) -->
      <button
        type="button"
        class="view-button"
        [class.rtl-position]="isRTL"
        (click)="onViewClick($event)"
        [title]="'View Details'"
      >
        <!-- LTR: Arrow pointing up-right -->
        <svg class="w-5 h-5 arrow-icon-ltr" [class.rotate-180]="isRTL"
             fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"
             [style.color]="'var(--primary-text, #003032)'">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
        </svg>
      </button>

      <!-- Content Container -->
      <div class="relative z-10 flex-1 flex flex-col">
        <!-- Top Section: Avatar -->
        <div class="flex items-start mb-5">
          <!-- Avatar -->
          <div class="relative flex-shrink-0">
            @if (avatar) {
              <img
                [src]="avatar"
                [alt]="name"
                class="w-16 h-16 rounded-full object-cover ring-2 transition-all duration-200"
                [style.border-color]="'rgba(255, 255, 255, 0.2)'"
              />
            } @else {
              <div
                class="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ring-2 transition-all duration-200 shadow-lg"
                [style.background]="'var(--sidebar-active-bg, #D9F275)'"
                [style.color]="'var(--sidebar-active-text, #003032)'"
                [style.border-color]="'rgba(255, 255, 255, 0.2)'"
              >
                {{ getInitials() }}
              </div>
            }
          </div>
        </div>

        <!-- Main Content -->
        <div class="mb-4 flex-1">
          <h3
            class="text-lg font-bold mb-1.5 group-hover:opacity-90 transition-opacity duration-200 leading-tight"
            [style.color]="'var(--sidebar-text, #E3F4F5)'"
          >
            {{ name }}
          </h3>
          @if (role) {
            <p
              class="text-sm mb-2 font-medium opacity-80"
              [style.color]="'var(--sidebar-text, #E3F4F5)'"
            >
              {{ role }}
            </p>
          }
          @if (email) {
            <p
              class="text-xs mb-1 opacity-60"
              [style.color]="'var(--sidebar-text, #E3F4F5)'"
            >
              {{ email }}
            </p>
          }
          @if (phone) {
            <p
              class="text-xs mb-1 opacity-60"
              [style.color]="'var(--sidebar-text, #E3F4F5)'"
            >
              {{ phone }}
            </p>
          }
          @if (joinedAt) {
            <p
              class="text-xs mt-2 opacity-50"
              [style.color]="'var(--sidebar-text, #E3F4F5)'"
            >
              Joined {{ formatDate(joinedAt) }}
            </p>
          }
        </div>

        <!-- Role and Status Badges (Same Row) -->
        <div class="flex items-center gap-2 flex-wrap mb-4">
          @if (badges && badges.length > 0) {
            @for (badge of badges; track $index) {
              <span [class]="getBadgeClasses(badge)">
                {{ badge.label }}
              </span>
            }
          }
          @if (status) {
            <span [class]="getStatusBadgeClasses()">
              <span [class]="getStatusDotClasses()"></span>
              {{ status === 'active' ? 'Active' : 'Inactive' }}
            </span>
          }
        </div>

        <!-- Action Buttons (Bottom Right, appear on hover) -->
        <div
          class="action-buttons absolute bottom-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0"
          [style.right]="isRTL ? 'auto' : '1rem'"
          [style.left]="isRTL ? '1rem' : 'auto'"
        >
          @if (showEdit) {
            <button
              type="button"
              class="p-2 rounded-lg backdrop-blur-sm transition-all duration-200 shadow-md opacity-80 hover:opacity-100"
              [style.background]="'rgba(255, 255, 255, 0.1)'"
              [style.color]="'var(--sidebar-text, #E3F4F5)'"
              (click)="onEditClick($event)"
              [title]="'Edit'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
          }
          @if (showDelete) {
            <button
              type="button"
              class="p-2 rounded-lg backdrop-blur-sm transition-all duration-200 shadow-md opacity-80 hover:opacity-100 hover:bg-red-500/20 hover:text-red-400"
              [style.background]="'rgba(255, 255, 255, 0.1)'"
              [style.color]="'var(--sidebar-text, #E3F4F5)'"
              (click)="onDeleteClick($event)"
              [title]="'Delete'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-card {
      position: relative;
      overflow: visible;
      contain: layout;

      /* Geometry variables for cutout */
      --w: 50px;
      --h: 50px;
      --outline: 20px;
      --radius: 20px;

      /* Derived values */
      --offset: calc(-1 * var(--outline));
      --size: calc(var(--radius) + var(--outline));

      /* 🔥 TOP-RIGHT CONCAVE NOTCH 🔥 */
      background:
        /* horizontal carve */
        calc(100% - var(--offset)) var(--h)
        radial-gradient(
          circle at left bottom,
          transparent var(--radius),
          #F7F7F7 var(--radius)
        ),
        /* vertical carve */
        calc(100% - var(--w)) var(--offset)
        radial-gradient(
          circle at left bottom,
          transparent var(--radius),
          #F7F7F7 var(--radius)
        ),
        /* Card background */
        var(--sidebar-bg, #003032);

      background-repeat: no-repeat;
      background-size: var(--size) var(--size),
                       var(--size) var(--size),
                       cover;
    }

    /* RTL: Flip cutout to top-left */
    [dir="rtl"] .profile-card,
    :host-context([dir="rtl"]) .profile-card,
    :host-context(html[dir="rtl"]) .profile-card {
      background:
        /* horizontal carve (top-left for RTL) */
        var(--offset) var(--h)
        radial-gradient(
          circle at right bottom,
          transparent var(--radius),
          #F7F7F7 var(--radius)
        ),
        /* vertical carve */
        var(--w) var(--offset)
        radial-gradient(
          circle at right bottom,
          transparent var(--radius),
          #F7F7F7 var(--radius)
        ),
        /* Card background */
        var(--sidebar-bg, #003032);

      background-repeat: no-repeat;
      background-size: var(--size) var(--size),
                       var(--size) var(--size),
                       cover;
    }

    /* ROUND BUTTON SLOT - positioned outside cutout */
    .view-button {
      position: absolute;
      top: 2px;
      right: 0;
      width: var(--w);
      height: var(--h);
      outline: var(--outline) solid #F7F7F7;
      border-radius: 50%;
      background: var(--primary-bg, #D9F275);
      border-color: var(--primary-bg);
      display: grid;
      place-items: center;
      cursor: pointer;
      transition: background 0.15s ease, transform 0.15s ease;
      z-index: 20;
      padding: 0;
      border: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .view-button:hover {
      /*background: var(--primary-bg-hover, #c9e265);*/
      transform: scale(1.05);
    }

    /* RTL: Position button on top-left */
    .view-button.rtl-position,
    [dir="rtl"] .view-button,
    :host-context([dir="rtl"]) .view-button,
    :host-context(html[dir="rtl"]) .view-button {
      right: auto;
      left: 0;
    }

    .profile-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      opacity: 0;
      transition: opacity 0.2s;
      z-index: 2;
    }

    .profile-card:hover::before {
      opacity: 1;
    }

    /* RTL Support */
    [dir="rtl"] .profile-card {
      direction: rtl;
    }

    /* RTL: Move action buttons to left - Must override Tailwind classes */
    :host-context([dir="rtl"]) .action-buttons,
    :host-context([dir="rtl"]) .action-buttons.right-4,
    :host-context([dir="rtl"]) .profile-card .action-buttons {
      right: auto !important;
      left: 1rem !important;
    }

    /* Global RTL support (for html element) */
    :host-context(html[dir="rtl"]) .action-buttons {
      right: auto !important;
      left: 1rem !important;
    }

    [dir="rtl"] .profile-card .absolute.bottom-0.right-0 {
      right: auto;
      left: 0;
    }


    /* Ensure LTR arrow is visible by default */
    .arrow-icon-ltr {
      display: block;
    }

  `]
})
export class ProfileCardComponent {
  private translationService = inject(TranslationService);

  @Input() avatar?: string;
  @Input() name: string = '';
  @Input() role?: string;
  @Input() email?: string;
  @Input() phone?: string;
  @Input() joinedAt?: Date | string;
  @Input() badges?: ProfileBadge[];
  @Input() status?: 'active' | 'inactive';
  @Input() showEdit: boolean = true;
  @Input() showDelete: boolean = true;

  view = output<void>();
  edit = output<void>();
  delete = output<void>();

  get isRTL(): boolean {
    return this.translationService.getCurrentLanguage() === 'ar';
  }

  getInitials(): string {
    if (!this.name) return '?';
    const parts = this.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return this.name.substring(0, 2).toUpperCase();
  }

  getBadgeClasses(badge: ProfileBadge): string {
    const base = 'px-2.5 py-1 rounded-full text-xs font-medium';
    const variant = badge.variant || 'default';

    const variants: { [key: string]: string } = {
      success: 'bg-green-500/20 text-green-400',
      warning: 'bg-amber-500/20 text-amber-400',
      danger: 'bg-red-500/20 text-red-400',
      info: 'bg-blue-500/20 text-blue-400',
      default: 'bg-white/10 text-white/80'
    };

    return `${base} ${variants[variant]}`;
  }

  getStatusBadgeClasses(): string {
    const base = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium';
    if (this.status === 'active') {
      return `${base} bg-green-500/20 text-green-400`;
    }
    return `${base} bg-white/10 text-white/60`;
  }

  getStatusDotClasses(): string {
    const base = 'w-1.5 h-1.5 rounded-full mr-2';
    if (this.status === 'active') {
      return `${base} bg-green-400`;
    }
    return `${base} bg-gray-400`;
  }

  onViewClick(event: Event): void {
    event.stopPropagation();
    this.view.emit();
  }

  onEditClick(event: Event): void {
    event.stopPropagation();
    this.edit.emit();
  }

  onDeleteClick(event: Event): void {
    event.stopPropagation();
    this.delete.emit();
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  }
}
