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

import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../../../core/services/theme.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PharmacyContextService } from '../../../../core/services/pharmacy-context.service';
import { PharmacyAuthService } from '../../../../core/services/pharmacy-auth.service';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, IconComponent],
  templateUrl: './header.component.html',
  styles: []
})
export class HeaderComponent implements OnInit {
  private themeService = inject(ThemeService);
  private translationService = inject(TranslationService);
  private authService = inject(AuthService);
  private pharmacyContextService = inject(PharmacyContextService);
  private pharmacyAuthService = inject(PharmacyAuthService);

  @Input() title: string = 'nav.dashboard';
  @Input() subtitle?: string;

  selectedPharmacyId: string = '';

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get userDisplayName(): string {
    const user = this.currentUser;
    return user?.fullName || user?.email || 'User';
  }

  get userDisplayEmail(): string {
    const user = this.currentUser;
    return user?.email || user?.username || '';
  }

  get userDisplayUsername(): string {
    const email = this.userDisplayEmail;
    if (!email) return '';
    const parts = email.split('@');
    return parts[0] || email;
  }

  get isAccountOwner(): boolean {
    const user = this.currentUser;
    return user?.role === 'account_owner';
  }

  get availablePharmacies() {
    const user = this.currentUser;
    return user?.pharmacies || [];
  }

  get currentPharmacy() {
    return this.pharmacyContextService.getCurrentPharmacy();
  }

  ngOnInit(): void {
    const currentPharmacy = this.pharmacyContextService.getCurrentPharmacy();
    if (currentPharmacy) {
      this.selectedPharmacyId = currentPharmacy.id;
    }
  }

  onPharmacyChange(pharmacyId: string): void {
    if (!pharmacyId) return;
    
    const pharmacy = this.availablePharmacies.find(p => p.id === pharmacyId);
    if (!pharmacy) return;

    this.pharmacyContextService.setCurrentPharmacy({
      id: pharmacy.id,
      name: pharmacy.name,
      primaryColor: '#166534',
      secondaryColor: '#22c55e',
      sidebarColor: '#14532d'
    });

    // Switch pharmacy via API
    this.pharmacyAuthService.switchPharmacy(pharmacyId).subscribe({
      next: (user) => {
        // User is already updated in auth service, reload page to refresh permissions and context
        if (user) {
          window.location.reload();
        }
      },
      error: (error) => {
        console.error('Failed to switch pharmacy:', error);
      }
    });
  }

  toggleLanguage(): void {
    this.themeService.toggleLanguage();
  }

  get currentLanguage(): string {
    return this.themeService.getCurrentLanguage();
  }
}





