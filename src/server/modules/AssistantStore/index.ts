import urlJoin from 'url-join';

import { appEnv } from '@/config/app';
import { DEFAULT_LANG, isLocaleNotSupport } from '@/const/locale';
import { Locales, normalizeLocale } from '@/locales/resources';
import { EdgeConfig } from '@/server/modules/EdgeConfig';
import { AgentStoreIndex } from '@/types/discover';

export class AssistantStore {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || appEnv.AGENTS_INDEX_URL;
  }

  private getAgentIndexUrl = (lang: Locales = DEFAULT_LANG) => {
    if (isLocaleNotSupport(lang)) return this.baseUrl;

    return urlJoin(this.baseUrl, `index.${normalizeLocale(lang)}.json`);
  };

  getAgentUrl = (identifier: string, lang: Locales = DEFAULT_LANG) => {
    if (isLocaleNotSupport(lang)) return urlJoin(this.baseUrl, `${identifier}.json`);

    return urlJoin(this.baseUrl, `${identifier}.${normalizeLocale(lang)}.json`);
  };

  getAgentIndex = async (locale: Locales = DEFAULT_LANG, revalidate?: number) => {
    try {
      let res: Response;

      res = await fetch(this.getAgentIndexUrl(locale as any), { next: { revalidate } });

      if (res.status === 404) {
        res = await fetch(this.getAgentIndexUrl(DEFAULT_LANG), { next: { revalidate } });
      }

      if (!res.ok) {
        console.error('fetch agent index error:', await res.text());
        return [];
      }

      const data: AgentStoreIndex = await res.json();

      // Get the assistant whitelist from Edge Config
      const edgeConfig = new EdgeConfig();

      if (!!appEnv.VERCEL_EDGE_CONFIG) {
        const assistantWhitelist = await edgeConfig.getAgentWhitelist();

        if (assistantWhitelist && assistantWhitelist?.length > 0) {
          data.agents = data.agents.filter((item) => assistantWhitelist.includes(item.identifier));
        }
      }

      return data;
    } catch (e) {
      console.error('fetch agent index error:', e);

      throw e;
    }
  };
}
