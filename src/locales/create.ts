import i18n from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';
import { isRtlLang } from 'rtl-detect';

import { getDebugConfig } from '@/config/debug';
import { DEFAULT_LANG } from '@/const/locale';
import { normalizeLocale } from '@/locales/resources';
import { isDev, isOnServerSide } from '@/utils/env';

const { I18N_DEBUG, I18N_DEBUG_BROWSER, I18N_DEBUG_SERVER } = getDebugConfig();
const debugMode = (I18N_DEBUG ?? isOnServerSide) ? I18N_DEBUG_SERVER : I18N_DEBUG_BROWSER;

export const createI18nNext = (lang?: string) => {
  const instance = i18n.use(initReactI18next).use(
    resourcesToBackend(async (lng: string, ns: string) => {
      if (isDev && lng === 'zh-CN') return import(`./default/${ns}`);

      return import(`@/../locales/${normalizeLocale(lng)}/${ns}.json`);
    }),
  );
  // Dynamically set HTML direction on language change
  instance.on('languageChanged', (lng) => {
    if (typeof window !== 'undefined') {
      const direction = isRtlLang(lng) ? 'rtl' : 'ltr';
      document.documentElement.dir = direction;
    }
  });
  return {
    init: () =>
      instance.init({
        debug: debugMode,
        defaultNS: ['error', 'common', 'chat'],
        fallbackLng: DEFAULT_LANG,
        interpolation: {
          escapeValue: false,
        },
        lng: lang,
      }),
    instance,
  };
};
