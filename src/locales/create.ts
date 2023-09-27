import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { isArray } from 'lodash-es';
import { initReactI18next } from 'react-i18next';

import type { Namespaces } from '@/types/locale';

import resources from './resources';

const isDev = process.env.NODE_ENV === 'development';

export const createI18nNext = (params: { namespace?: Namespaces[] | Namespaces } = {}) => {
  const { namespace } = params;

  const ns: Namespaces[] = isArray(namespace)
    ? ['error', 'common', ...namespace]
    : (['error', 'common', namespace].filter(Boolean) as Namespaces[]);

  return i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      debug: isDev,
      defaultNS: ns,
      detection: {
        caches: [],
      },
      fallbackLng: isDev ? 'zh-CN' : 'en-US',
      interpolation: {
        escapeValue: false,
      },
      lng: isDev ? 'zh-CN' : 'en-US',
      ns,
      resources,
    });
};
