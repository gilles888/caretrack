import { Component, inject } from '@angular/core';
import { LanguageService, SupportedLang } from '../../core/services/language.service';
import { ButtonModule } from 'primeng/button';

interface LangOption {
  code: SupportedLang;
  label: string;
  flag: string;
}

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [ButtonModule],
  styles: [`
    :host { display: flex; align-items: center; }

    .lang-group {
      display: flex;
      gap: 4px;
      background: rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      padding: 3px;
    }

    .lang-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 5px 10px;
      border: none;
      border-radius: 7px;
      background: transparent;
      cursor: pointer;
      font-size: 0.75rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.75);
      transition: all 0.15s ease;
      letter-spacing: 0.04em;
      line-height: 1;
    }

    .lang-btn:hover {
      background: rgba(255, 255, 255, 0.18);
      color: white;
    }

    .lang-btn.active {
      background: white;
      color: #1565C0;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
    }

    .flag {
      font-size: 1rem;
      line-height: 1;
    }
  `],
  template: `
    <div class="lang-group" role="group" aria-label="Language selector">
      @for (lang of langs; track lang.code) {
        <button
          type="button"
          class="lang-btn"
          [class.active]="langService.currentLang() === lang.code"
          (click)="select(lang.code)"
          [attr.aria-label]="lang.label"
          [attr.aria-pressed]="langService.currentLang() === lang.code"
        >
          <span class="flag" aria-hidden="true">{{ lang.flag }}</span>
          <span>{{ lang.code.toUpperCase() }}</span>
        </button>
      }
    </div>
  `,
})
export class LanguageSwitcherComponent {
  protected readonly langService = inject(LanguageService);

  protected readonly langs: LangOption[] = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  ];

  select(lang: SupportedLang): void {
    this.langService.setLanguage(lang);
  }
}
