import { supportLocales } from '@/mobile/i18n/resource';

export const DEFAULT_LANG = 'en-US';

/**
 * Check if the language is supported
 * @param locale
 */
export const isLocaleNotSupport = (locale: string) => !supportLocales.includes(locale);
