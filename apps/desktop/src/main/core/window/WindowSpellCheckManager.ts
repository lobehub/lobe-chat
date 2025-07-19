import { BrowserWindow } from 'electron';

import { createLogger } from '@/utils/logger';

import type { App } from '../App';

const logger = createLogger('core:WindowSpellCheckManager');

// Supported spell check language codes in Electron
const SUPPORTED_SPELL_CHECK_LANGUAGES = [
  'ar', // Arabic
  'bg', // Bulgarian
  'ca', // Catalan
  'cs', // Czech
  'da', // Danish
  'de-DE', // German (Germany)
  'el', // Greek
  'en-AU', // English (Australia)
  'en-CA', // English (Canada)
  'en-GB', // English (United Kingdom)
  'en-US', // English (United States)
  'es-ES', // Spanish (Spain)
  'es-MX', // Spanish (Mexico)
  'et', // Estonian
  'fa', // Persian
  'fo', // Faroese
  'fr-FR', // French (France)
  'he', // Hebrew
  'hi', // Hindi
  'hr', // Croatian
  'hu', // Hungarian
  'id', // Indonesian
  'it-IT', // Italian (Italy)
  'ja', // Japanese
  'ko', // Korean
  'lt', // Lithuanian
  'lv', // Latvian
  'nb', // Norwegian Bokmål
  'nl', // Dutch
  'pl', // Polish
  'pt-BR', // Portuguese (Brazil)
  'pt-PT', // Portuguese (Portugal)
  'ro', // Romanian
  'ru', // Russian
  'sk', // Slovak
  'sl', // Slovenian
  'sr', // Serbian
  'sv', // Swedish
  'ta', // Tamil
  'tg', // Tajik
  'tr', // Turkish
  'uk', // Ukrainian
  'vi', // Vietnamese
  'zh-CN', // Chinese (Simplified)
  'zh-TW', // Chinese (Traditional)
] as const;

export class WindowSpellCheckManager {
  private window: BrowserWindow;
  private identifier: string;
  private app: App;
  private languageChangeListener?: (language: string) => void;

  constructor(window: BrowserWindow, identifier: string, app: App) {
    this.window = window;
    this.identifier = identifier;
    this.app = app;
    this.setupSpellCheck();
    this.setupLanguageChangeListener();
  }

  /**
   * Setup spell check configuration
   */
  private setupSpellCheck(): void {
    try {
      // Get spell check configuration from store
      const enableSpellCheck = this.app.storeManager.get('enableSpellCheck', false);

      if (!enableSpellCheck) {
        logger.debug(`[${this.identifier}] Spell check is disabled`);
        return;
      }

      // Get configured languages, fallback to current i18n language if auto-sync is enabled
      let spellCheckLanguages = this.app.storeManager.get('spellCheckLanguages', [
        'en-US',
      ]) as string[];

      // Auto-sync with current i18n language if no specific languages configured
      const autoSyncLanguage = this.app.storeManager.get('autoSyncSpellCheckLanguage', true);
      if (autoSyncLanguage && this.app.i18n) {
        const currentLanguage = this.app.i18n.getCurrentLanguage();
        const mappedLanguages = this.mapLocaleToSpellCheckLanguages(currentLanguage);
        if (mappedLanguages.length > 0) {
          spellCheckLanguages = mappedLanguages;
          // Update store with auto-synced languages
          this.app.storeManager.set('spellCheckLanguages', spellCheckLanguages);
        }
      }

      if (spellCheckLanguages.length > 0) {
        logger.debug(
          `[${this.identifier}] Setting spell check languages: ${spellCheckLanguages.join(', ')}`,
        );
        this.window.webContents.session.setSpellCheckerLanguages(spellCheckLanguages);
        logger.info(
          `[${this.identifier}] Spell check enabled with languages: ${spellCheckLanguages.join(', ')}`,
        );
      } else {
        logger.warn(`[${this.identifier}] Spell check enabled but no languages configured`);
      }
    } catch (error) {
      logger.error(`[${this.identifier}] Failed to set spell check languages:`, error);
    }
  }

  /**
   * Setup language change listener to auto-sync spell check languages
   */
  private setupLanguageChangeListener(): void {
    if (!this.app.i18n) {
      logger.debug(
        `[${this.identifier}] I18nManager not available, skipping language listener setup`,
      );
      return;
    }

    // Listen for language changes from i18n
    this.languageChangeListener = (language: string) => {
      const enableSpellCheck = this.app.storeManager.get('enableSpellCheck', false);
      const autoSyncLanguage = this.app.storeManager.get('autoSyncSpellCheckLanguage', true);

      if (enableSpellCheck && autoSyncLanguage) {
        logger.debug(
          `[${this.identifier}] Language changed to: ${language}, auto-syncing spell check`,
        );
        const mappedLanguages = this.mapLocaleToSpellCheckLanguages(language);
        if (mappedLanguages.length > 0) {
          this.updateSpellCheck(true, mappedLanguages, false); // Don't save autoSyncSpellCheckLanguage setting
        }
      }
    };

    // Add listener to i18n instance
    this.app.i18n.getI18nInstance().on('languageChanged', this.languageChangeListener);
    logger.debug(`[${this.identifier}] Language change listener setup completed`);
  }

  /**
   * Map i18n locale to spell check language codes using dynamic matching
   */
  private mapLocaleToSpellCheckLanguages(locale: string): string[] {
    if (!locale) return ['en-US'];

    // Handle special cases
    if (locale.startsWith('ar')) return ['ar'];
    if (locale.startsWith('fa')) return ['fa'];
    if (locale.startsWith('cn') || locale === 'zh-CN') return ['zh-CN'];

    // Try exact match first
    const exactMatch = SUPPORTED_SPELL_CHECK_LANGUAGES.find((lang) => lang === locale);
    if (exactMatch) return [exactMatch];

    // Try prefix match (e.g., 'en' matches 'en-US', 'en-GB', etc.)
    const baseLocale = locale.split('-')[0];
    const prefixMatches = SUPPORTED_SPELL_CHECK_LANGUAGES.filter((lang) =>
      lang.startsWith(baseLocale),
    );
    if (prefixMatches.length > 0) {
      // Prefer the most common variant or the first match
      const preferredVariants: Record<string, string> = {
        en: 'en-US',
        es: 'es-ES',
        pt: 'pt-BR',
        zh: 'zh-CN',
      };
      const preferred = preferredVariants[baseLocale];
      if (preferred && prefixMatches.includes(preferred as any)) {
        return [preferred];
      }
      return [prefixMatches[0]];
    }

    // Default fallback
    logger.debug(
      `[${this.identifier}] No spell check mapping found for locale: ${locale}, using fallback`,
    );
    return ['en-US'];
  }

  /**
   * Update spell check configuration
   */
  updateSpellCheck(enabled: boolean, languages?: string[], updateAutoSync: boolean = true): void {
    try {
      // Save to store
      this.app.storeManager.set('enableSpellCheck', enabled);

      if (languages) {
        this.app.storeManager.set('spellCheckLanguages', languages);
      }

      // Update auto-sync setting if specified
      if (updateAutoSync && !enabled) {
        // When disabling spell check, also disable auto-sync
        this.app.storeManager.set('autoSyncSpellCheckLanguage', false);
      }

      if (enabled && languages && languages.length > 0) {
        logger.debug(
          `[${this.identifier}] Updating spell check languages: ${languages.join(', ')}`,
        );
        this.window.webContents.session.setSpellCheckerLanguages(languages);
        logger.info(
          `[${this.identifier}] Spell check updated with languages: ${languages.join(', ')}`,
        );
      } else {
        logger.debug(`[${this.identifier}] Spell check disabled or no languages provided`);
        // Disable spell check by setting empty array
        this.window.webContents.session.setSpellCheckerLanguages([]);
      }
    } catch (error) {
      logger.error(`[${this.identifier}] Failed to update spell check:`, error);
    }
  }

  /**
   * Toggle auto-sync spell check language with i18n
   */
  setAutoSyncSpellCheckLanguage(autoSync: boolean): void {
    this.app.storeManager.set('autoSyncSpellCheckLanguage', autoSync);

    if (autoSync && this.app.i18n) {
      // Immediately sync with current language
      const currentLanguage = this.app.i18n.getCurrentLanguage();
      const mappedLanguages = this.mapLocaleToSpellCheckLanguages(currentLanguage);
      if (mappedLanguages.length > 0) {
        const enableSpellCheck = this.app.storeManager.get('enableSpellCheck', false);
        if (enableSpellCheck) {
          this.updateSpellCheck(true, mappedLanguages, false);
        }
      }
    }

    logger.info(
      `[${this.identifier}] Auto-sync spell check language: ${autoSync ? 'enabled' : 'disabled'}`,
    );
  }

  /**
   * Get current spell check configuration
   */
  getSpellCheckConfig(): {
    autoSync: boolean;
    availableLanguages: readonly string[];
    enabled: boolean;
    languages: string[];
  } {
    return {
      autoSync: this.app.storeManager.get('autoSyncSpellCheckLanguage', true),
      availableLanguages: SUPPORTED_SPELL_CHECK_LANGUAGES,
      enabled: this.app.storeManager.get('enableSpellCheck', false),
      languages: this.app.storeManager.get('spellCheckLanguages', ['en-US']) as string[],
    };
  }

  /**
   * Clean up spell check manager
   */
  cleanup(): void {
    // Remove language change listener
    if (this.languageChangeListener && this.app.i18n) {
      this.app.i18n.getI18nInstance().off('languageChanged', this.languageChangeListener);
      this.languageChangeListener = undefined;
    }

    logger.debug(`[${this.identifier}] WindowSpellCheckManager cleanup completed`);
  }
}
