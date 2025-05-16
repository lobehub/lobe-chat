import urlJoin from 'url-join';

import { DEFAULT_LANG, isLocaleNotSupport } from '@/const/locale';
import { appEnv } from '@/envs/app';
import { Locales, normalizeLocale } from '@/locales/resources';
import { DiscoverPlugintem } from '@/types/discover';

const revalidate: number = 3600;

export class PluginStore {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || appEnv.PLUGINS_INDEX_URL;
  }

  getPluginIndexUrl = (lang: Locales = DEFAULT_LANG) => {
    if (isLocaleNotSupport(lang)) return this.baseUrl;

    return urlJoin(this.baseUrl, `index.${normalizeLocale(lang)}.json`);
  };

  getPluginList = async (locale?: string): Promise<DiscoverPlugintem[]> => {
    try {
      let res = await fetch(this.getPluginIndexUrl(locale as Locales), {
        next: { revalidate: 12 * revalidate },
      });

      if (!res.ok) {
        res = await fetch(this.getPluginIndexUrl(DEFAULT_LANG), {
          next: { revalidate: 12 * revalidate },
        });
      }

      if (!res.ok) return [];

      const json = await res.json();

      return json.plugins ?? [];
    } catch (e) {
      console.error('[getPluginListError] failed to fetch plugin list, error detail:');
      console.error(e);
      return [];
    }
  };
}
