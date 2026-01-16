import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of, forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Translations {
  [key: string]: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private http = inject(HttpClient);
  
  private translations: { en: Translations; ar: Translations } = {
    en: {},
    ar: {}
  };
  
  private translationsLoaded = new BehaviorSubject<boolean>(false);
  public translationsLoaded$ = this.translationsLoaded.asObservable();
  
  private currentLangSubject = new BehaviorSubject<'en' | 'ar'>('en');
  public currentLang$ = this.currentLangSubject.asObservable();

  constructor() {
    this.loadTranslations();
    const savedLang = localStorage.getItem('language') as 'en' | 'ar' | null;
    if (savedLang) {
      this.setLanguage(savedLang);
    }
  }

  private loadTranslations(): void {
    forkJoin({
      en: this.http.get<Translations>('i18n/en.json').pipe(
        catchError(error => {
          console.error('Error loading English translations:', error);
          return of({});
        })
      ),
      ar: this.http.get<Translations>('i18n/ar.json').pipe(
        catchError(error => {
          console.error('Error loading Arabic translations:', error);
          return of({});
        })
      )
    }).subscribe({
      next: (translations) => {
        this.translations.en = translations.en || {};
        this.translations.ar = translations.ar || {};
        this.translationsLoaded.next(true);
        // Trigger change detection by emitting language change
        const currentLang = this.currentLangSubject.value;
        this.currentLangSubject.next(currentLang);
        console.log('Translations loaded successfully:', {
          en: Object.keys(this.translations.en).length,
          ar: Object.keys(this.translations.ar).length
        });
      },
      error: (error) => {
        console.error('Error loading translations:', error);
        this.translationsLoaded.next(true); // Still mark as loaded to prevent infinite waiting
      }
    });
  }

  translate(key: string): string {
    const lang = this.currentLangSubject.value;
    const translation = this.translations[lang]?.[key];
    if (!translation) {
      // Only warn if translations have been loaded (to avoid warnings during initial load)
      if (this.translationsLoaded.value) {
        console.warn(`Translation missing for key: ${key}`);
      }
      return key;
    }
    return translation;
  }

  setLanguage(lang: 'en' | 'ar'): void {
    localStorage.setItem('language', lang);
    this.currentLangSubject.next(lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }

  getCurrentLanguage(): 'en' | 'ar' {
    return this.currentLangSubject.value;
  }

  toggleLanguage(): void {
    const newLang = this.currentLangSubject.value === 'en' ? 'ar' : 'en';
    this.setLanguage(newLang);
  }
}
