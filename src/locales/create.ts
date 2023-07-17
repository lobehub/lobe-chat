import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { isArray } from 'lodash-es';
import { initReactI18next } from 'react-i18next';

import type { Namespaces, Resources } from '@/types/locale';

import resources from './resources';

const getRes = (res: Resources, namespace: Namespaces[]) => {
  const newRes: any = {};
  for (const [locale, value] of Object.entries(res)) {
    newRes[locale] = {};
    for (const ns of namespace) {
      newRes[locale][ns] = value[ns];
    }
  }
  return newRes;
};

export const createI18nNext = (namespace?: Namespaces[] | Namespaces) => {
  const ns: Namespaces[] = namespace
    ? isArray(namespace)
      ? ['common', ...namespace]
      : ['common', namespace]
    : ['common'];
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
        // @ts-ignore
        debug: process.env.NODE_ENV === 'development',
        defaultNS: ns,
        fallbackLng: 'zh-CN',
        interpolation: {
          escapeValue: false, // not needed for react as it escapes by default
        },
        ns,
        resources: getRes(resources, ns),
      })
  );
};
