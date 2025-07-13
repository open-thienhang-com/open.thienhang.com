import { Pipe, PipeTransform, OnDestroy } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'translate',
  pure: false,
  standalone: true
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private langChangeSubscription: Subscription;
  private lastKey: string = '';
  private lastValue: string = '';

  constructor(private i18nService: I18nService) {
    this.langChangeSubscription = this.i18nService.currentLanguage$.subscribe(() => {
      // Reset cache when language changes
      this.lastKey = '';
      this.lastValue = '';
    });
  }

  transform(key: string): string {
    if (!key) return '';
    
    // Simple caching to avoid unnecessary translations
    if (this.lastKey === key) {
      return this.lastValue;
    }

    this.lastKey = key;
    this.lastValue = this.i18nService.translate(key);
    return this.lastValue;
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }
}
