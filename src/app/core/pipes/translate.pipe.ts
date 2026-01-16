import { Pipe, PipeTransform, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { TranslationService } from '../services/translation.service';
import { Subscription, combineLatest } from 'rxjs';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Make impure so it re-evaluates when language changes
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private translationService = inject(TranslationService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private subscription?: Subscription;

  constructor() {
    // Subscribe to both language changes and translation loading to trigger change detection
    this.subscription = combineLatest([
      this.translationService.currentLang$,
      this.translationService.translationsLoaded$
    ]).subscribe(() => {
      this.changeDetectorRef.markForCheck();
    });
  }

  transform(key: string): string {
    if (!key) return key;
    return this.translationService.translate(key);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
