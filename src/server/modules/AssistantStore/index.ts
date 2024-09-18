import urlJoin from 'url-join';

import { appEnv } from '@/config/app';
import { DEFAULT_LANG, isLocaleNotSupport } from '@/const/locale';
import { Locales, normalizeLocale } from '@/locales/resources';

const checkSupportLocale = (lang: Locales) => {
  return isLocaleNotSupport(lang) || normalizeLocale(lang) !== 'zh-CN';
};

export class AssistantStore {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || appEnv.AGENTS_INDEX_URL;
  }

  getAgentIndexUrl = (lang: Locales = DEFAULT_LANG) => {
    if (checkSupportLocale(lang)) return this.baseUrl;

    return urlJoin(this.baseUrl, `index.${normalizeLocale(lang)}.json`);
  };

  getAgentUrl = (identifier: string, lang: Locales = DEFAULT_LANG) => {
    if (checkSupportLocale(lang)) return urlJoin(this.baseUrl, `${identifier}.json`);

    return urlJoin(this.baseUrl, `${identifier}.${normalizeLocale(lang)}.json`);
  };
}
