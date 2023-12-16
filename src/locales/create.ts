import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { getClientConfig } from '@/config/client';
import { DEFAULT_LANG, LOBE_LOCALE_COOKIE } from '@/const/locale';
import { COOKIE_CACHE_DAYS } from '@/const/settings';
import type { Namespaces } from '@/types/locale';
import { isOnServerSide } from '@/utils/env';

import { resources } from './options';

const { I18N_DEBUG, I18N_DEBUG_BROWSER, I18N_DEBUG_SERVER } = getClientConfig();
const debugMode = I18N_DEBUG ?? isOnServerSide ? I18N_DEBUG_SERVER : I18N_DEBUG_BROWSER;

export const createI18nNext = (lang?: string) => {
  const ns: Namespaces[] = [
    'error',
    'common',
    'empty',
    'error',
    'market',
    'plugin',
    'setting',
    'welcome',
  ];

  const instance = i18n.use(initReactI18next).use(LanguageDetector);
  //  not find a good way to handle suspense loading
  // .use(
  //   resourcesToBackend(
  //     isDev ? resources : (lng: string, ns: string) => import(`../../locales/${lng}/${ns}.json`),
  //   ),
  // )

  return {
    init: () =>
      instance.init({
        debug: debugMode,
        defaultNS: ['error', 'common'],
        detection: {
          caches: ['cookie'],
          cookieMinutes: 60 * 24 * COOKIE_CACHE_DAYS,
          lookupCookie: LOBE_LOCALE_COOKIE,
        },
        fallbackLng: DEFAULT_LANG,
        interpolation: {
          escapeValue: false,
        },
        lng: lang,
        ns,
        resources,
      }),
    instance,
  };
};
