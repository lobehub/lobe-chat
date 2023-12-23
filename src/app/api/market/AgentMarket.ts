import urlJoin from 'url-join';

import { getServerConfig } from '@/config/server';
import { DEFAULT_LANG, checkLang } from '@/const/locale';
import { Locales } from '@/locales/resources';

export class AgentMarket {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || getServerConfig().AGENTS_INDEX_URL;
  }

  getAgentIndexUrl = (lang: Locales = DEFAULT_LANG) => {
    if (checkLang(lang)) return this.baseUrl;

    return urlJoin(this.baseUrl, `index.${lang}.json`);
  };

  getAgentUrl = (identifier: string, lang: Locales = DEFAULT_LANG) => {
    if (checkLang(lang)) return urlJoin(this.baseUrl, `${identifier}.json`);

    return urlJoin(this.baseUrl, `${identifier}.${lang}.json`);
  };
}
