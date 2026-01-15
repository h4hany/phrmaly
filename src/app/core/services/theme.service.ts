import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Pharmacy } from '../models/user.model';
import { PharmacyContextService } from './pharmacy-context.service';
import { TranslationService } from './translation.service';

export interface ThemeColors {
  // Primary
  primaryBg: string;
  primaryText: string;
  
  // Sidebar
  sidebarBg: string;
  sidebarText: string;
  sidebarActiveBg: string;
  sidebarActiveText: string;
  
  // Card
  cardBg: string;
  cardText: string;
  
  // Page
  pageBg: string;
  
  // Status Colors
  successColor: string;
  successBg: string;
  successText: string;
  warningColor: string;
  warningBg: string;
  warningText: string;
  dangerColor: string;
  dangerBg: string;
  dangerText: string;
  
  // Other
  patientCardBg: string;
  patientCardText: string;
  scrollbarBg: string;
  scrollbarThumb: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private pharmacyContext = inject(PharmacyContextService);
  private translationService = inject(TranslationService);
  
  private currentLangSubject = new BehaviorSubject<'en' | 'ar'>('en');
  public currentLang$ = this.currentLangSubject.asObservable();

  private readonly STORAGE_KEY = 'theme_colors';

  constructor() {
    // Subscribe to pharmacy changes to update theme
    this.pharmacyContext.currentPharmacy$.subscribe(pharmacy => {
      if (pharmacy) {
        this.applyPharmacyTheme(pharmacy);
      }
    });

    // Initialize language from translation service
    const savedLang = localStorage.getItem('language') as 'en' | 'ar' | null;
    if (savedLang) {
      this.setLanguage(savedLang);
    } else {
      this.setLanguage('en');
    }

    // Load saved theme colors on initialization
    this.loadTheme();
  }

  applyPharmacyTheme(pharmacy: Pharmacy): void {
    const root = document.documentElement;
    
    if (pharmacy.primaryColor) {
      root.style.setProperty('--primary-color', pharmacy.primaryColor);
    }
    if (pharmacy.secondaryColor) {
      root.style.setProperty('--secondary-color', pharmacy.secondaryColor);
    }
    if (pharmacy.sidebarColor) {
      root.style.setProperty('--sidebar-color', pharmacy.sidebarColor);
    }

    // Apply RTL if enabled
    if (pharmacy.rtlEnabled) {
      document.documentElement.setAttribute('dir', 'rtl');
      this.setLanguage('ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }

  getDefaultTheme(): ThemeColors {
    return {
      primaryBg: '#D9F275',
      primaryText: '#003032',
      sidebarBg: '#003032',
      sidebarText: '#E3F4F5',
      sidebarActiveBg: '#D9F275',
      sidebarActiveText: '#003032',
      cardBg: '#FFFFFF',
      cardText: '#697579',
      pageBg: '#F7F7F7',
      successColor: '#10b981',
      successBg: '#d1fae5',
      successText: '#065f46',
      warningColor: '#f59e0b',
      warningBg: '#fef3c7',
      warningText: '#92400e',
      dangerColor: '#ef4444',
      dangerBg: '#fee2e2',
      dangerText: '#991b1b',
      patientCardBg: '#003032',
      patientCardText: '#D9F275',
      scrollbarBg: '#003032',
      scrollbarThumb: '#D9F275'
    };
  }

  getTheme(): ThemeColors {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return this.getDefaultTheme();
      }
    }
    return this.getDefaultTheme();
  }

  saveTheme(colors: Partial<ThemeColors>): void {
    const currentTheme = this.getTheme();
    const updatedTheme = { ...currentTheme, ...colors };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedTheme));
    this.applyTheme(updatedTheme);
  }

  applyTheme(colors: Partial<ThemeColors>): void {
    const root = document.documentElement;
    const theme = { ...this.getDefaultTheme(), ...this.getTheme(), ...colors };

    // Apply all CSS variables
    root.style.setProperty('--primary-bg', theme.primaryBg);
    root.style.setProperty('--primary-text', theme.primaryText);
    root.style.setProperty('--sidebar-bg', theme.sidebarBg);
    root.style.setProperty('--sidebar-text', theme.sidebarText);
    root.style.setProperty('--sidebar-active-bg', theme.sidebarActiveBg);
    root.style.setProperty('--sidebar-active-text', theme.sidebarActiveText);
    root.style.setProperty('--card-bg', theme.cardBg);
    root.style.setProperty('--card-text', theme.cardText);
    root.style.setProperty('--page-bg', theme.pageBg);
    root.style.setProperty('--success-color', theme.successColor);
    root.style.setProperty('--success-bg', theme.successBg);
    root.style.setProperty('--success-text', theme.successText);
    root.style.setProperty('--warning-color', theme.warningColor);
    root.style.setProperty('--warning-bg', theme.warningBg);
    root.style.setProperty('--warning-text', theme.warningText);
    root.style.setProperty('--danger-color', theme.dangerColor);
    root.style.setProperty('--danger-bg', theme.dangerBg);
    root.style.setProperty('--danger-text', theme.dangerText);
    root.style.setProperty('--patient-card-bg', theme.patientCardBg);
    root.style.setProperty('--patient-card-text', theme.patientCardText);
    root.style.setProperty('--scrollbar-bg', theme.scrollbarBg);
    root.style.setProperty('--scrollbar-thumb', theme.scrollbarThumb);

    // Update legacy variables for backward compatibility
    root.style.setProperty('--primary-color', theme.primaryBg);
    root.style.setProperty('--secondary-color', theme.primaryBg);
    root.style.setProperty('--sidebar-color', theme.sidebarBg);
  }

  loadTheme(): void {
    const theme = this.getTheme();
    this.applyTheme(theme);
  }

  resetTheme(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.applyTheme(this.getDefaultTheme());
  }

  setLanguage(lang: 'en' | 'ar'): void {
    this.translationService.setLanguage(lang);
    this.currentLangSubject.next(lang);
  }

  getCurrentLanguage(): 'en' | 'ar' {
    return this.translationService.getCurrentLanguage();
  }

  toggleLanguage(): void {
    this.translationService.toggleLanguage();
    this.currentLangSubject.next(this.translationService.getCurrentLanguage());
  }
}
