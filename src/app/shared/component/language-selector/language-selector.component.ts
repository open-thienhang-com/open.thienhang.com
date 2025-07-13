import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService, Language } from '../../../core/services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, TranslatePipe, DropdownModule, FormsModule],
  template: `
    <div class="language-selector">
      <label class="block text-sm font-medium text-slate-700 mb-2">
        {{ 'settings.language' | translate }}
      </label>
      <p-dropdown
        [(ngModel)]="selectedLanguage"
        [options]="languages"
        optionLabel="name"
        optionValue="code"
        (onChange)="onLanguageChange($event)"
        placeholder="{{ 'settings.selectLanguage' | translate }}"
        styleClass="w-full">
        <ng-template pTemplate="selectedItem">
          <div class="flex items-center space-x-2" *ngIf="selectedLanguageObj">
            <span class="text-lg">{{ selectedLanguageObj.flag }}</span>
            <span>{{ selectedLanguageObj.name }}</span>
          </div>
        </ng-template>
        <ng-template let-language pTemplate="item">
          <div class="flex items-center space-x-2">
            <span class="text-lg">{{ language.flag }}</span>
            <span>{{ language.name }}</span>
          </div>
        </ng-template>
      </p-dropdown>
    </div>
  `,
  styles: [`
    :host {
      .language-selector {
        min-width: 200px;
      }
    }
  `]
})
export class LanguageSelectorComponent implements OnInit {
  selectedLanguage: string = 'vi';
  languages: Language[] = [];
  selectedLanguageObj: Language | undefined;

  constructor(private i18nService: I18nService) {}

  ngOnInit(): void {
    this.languages = this.i18nService.availableLanguages;
    this.selectedLanguage = this.i18nService.getCurrentLanguage();
    this.updateSelectedLanguageObj();
    
    // Subscribe to language changes
    this.i18nService.currentLanguage$.subscribe(lang => {
      this.selectedLanguage = lang;
      this.updateSelectedLanguageObj();
    });
  }

  onLanguageChange(event: any): void {
    this.i18nService.setLanguage(event.value);
    this.updateSelectedLanguageObj();
  }

  private updateSelectedLanguageObj(): void {
    this.selectedLanguageObj = this.languages.find(lang => lang.code === this.selectedLanguage);
  }
}
