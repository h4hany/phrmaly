/**
 * Header Component
 * 
 * Reusable header with:
 * - Page title display
 * - Search input
 * - Language switcher
 * - Notifications
 * - User profile
 */

import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../../core/services/theme.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, TranslatePipe, IconComponent],
  templateUrl: './header.component.html',
  styles: []
})
export class HeaderComponent {
  private themeService = inject(ThemeService);
  private translationService = inject(TranslationService);

  @Input() title: string = 'nav.dashboard';
  @Input() subtitle?: string;

  toggleLanguage(): void {
    this.themeService.toggleLanguage();
  }

  get currentLanguage(): string {
    return this.themeService.getCurrentLanguage();
  }
}





