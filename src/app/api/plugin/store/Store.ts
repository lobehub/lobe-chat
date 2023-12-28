import urlJoin from 'url-join';

import { getServerConfig } from '@/config/server';
import { DEFAULT_LANG, isLocaleNotSupport } from '@/const/locale';
import { Locales } from '@/locales/resources';

export class PluginStore {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || getServerConfig().PLUGINS_INDEX_URL;
  }

  getPluginIndexUrl = (lang: Locales = DEFAULT_LANG) => {
    if (isLocaleNotSupport(lang)) return this.baseUrl;

    return urlJoin(this.baseUrl, `index.${lang}.json`);
  };
}
