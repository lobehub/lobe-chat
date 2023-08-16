import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { isArray } from 'lodash-es';
import { initReactI18next } from 'react-i18next';

import type { Namespaces } from '@/types/locale';

import resources from './resources';

export const createI18nNext = (params: { namespace?: Namespaces[] | Namespaces } = {}) => {
  const { namespace } = params;

  const ns: Namespaces[] = isArray(namespace)
    ? ['error', 'common', ...namespace]
    : (['error', 'common', namespace].filter(Boolean) as Namespaces[]);

  return (
    i18n
      // detect user language
      // learn more: https://github.com/i18next/i18next-browser-languageDetector
      .use(LanguageDetector)
      // pass the i18n instance to react-i18next.
      .use(initReactI18next)
      // init i18next
      // for all options read: https://www.i18next.com/overview/configuration-options
      .init({
        debug: process.env.NODE_ENV === 'development',
        defaultNS: ns,
        // LanguageDetector config, refs: https://github.com/i18next/i18next-browser-languageDetector
        detection: {
          caches: [],
        },
        fallbackLng: 'zh-CN',
        interpolation: {
          escapeValue: false, // not needed for react as it escapes by default
        },
        ns,
        // resources: getRes(resources, ns),
        resources,
      })
  );
};
