import { inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type SupportedLang = 'fr' | 'en' | 'nl';

const SUPPORTED: SupportedLang[] = ['fr', 'en', 'nl'];
const STORAGE_KEY = 'caretrack_lang';

function detectBrowserLang(): SupportedLang {
  const nav = navigator.language?.split('-')[0] as SupportedLang;
  return SUPPORTED.includes(nav) ? nav : 'fr';
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);

  readonly currentLang = signal<SupportedLang>(this.resolveInitialLang());

  init(): void {
    const lang = this.currentLang();
    this.translate.addLangs(SUPPORTED);
    this.translate.setDefaultLang('fr');
    this.translate.use(lang);
  }

  setLanguage(lang: SupportedLang): void {
    this.translate.use(lang);
    this.currentLang.set(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }

  private resolveInitialLang(): SupportedLang {
    const stored = localStorage.getItem(STORAGE_KEY) as SupportedLang | null;
    if (stored && SUPPORTED.includes(stored)) {
      return stored;
    }
    return detectBrowserLang();
  }
}
