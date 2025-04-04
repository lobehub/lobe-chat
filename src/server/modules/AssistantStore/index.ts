import urlJoin from 'url-join';

import { appEnv } from '@/config/app';
import { DEFAULT_LANG, isLocaleNotSupport } from '@/const/locale';
import { Locales, normalizeLocale } from '@/locales/resources';
import { EdgeConfig } from '@/server/modules/EdgeConfig';
import { AgentStoreIndex } from '@/types/discover';
import { RevalidateTag } from '@/types/requestCache';

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

      res = await fetch(this.getAgentIndexUrl(locale as any), {
        next: { revalidate, tags: [RevalidateTag.AgentIndex] },
      });

      if (res.status === 404) {
        res = await fetch(this.getAgentIndexUrl(DEFAULT_LANG), {
          next: { revalidate, tags: [RevalidateTag.AgentIndex] },
        });
      }

      if (!res.ok) {
        console.warn('fetch agent index error:', await res.text());
        return [];
      }

      const data: AgentStoreIndex = await res.json();

      if (EdgeConfig.isEnabled()) {
        // Get the assistant whitelist from Edge Config
        const edgeConfig = new EdgeConfig();

        const { whitelist, blacklist } = await edgeConfig.getAgentRestrictions();

        // use whitelist mode first
        if (whitelist && whitelist?.length > 0) {
          data.agents = data.agents.filter((item) => whitelist.includes(item.identifier));
        }

        // if no whitelist, use blacklist mode
        else if (blacklist && blacklist?.length > 0) {
          data.agents = data.agents.filter((item) => !blacklist.includes(item.identifier));
        }
      }

      return data;
    } catch (e) {
      // it means failed to fetch
      if ((e as Error).message.includes('fetch failed')) {
        return {
          agents: [],
          schemaVersion: 1,
        };
      }

      console.error('[AgentIndexFetchError] failed to fetch agent index, error detail:');
      console.error(e);

      throw e;
    }
  };
}
