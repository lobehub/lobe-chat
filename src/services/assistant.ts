import { cloneDeep, merge } from 'lodash-es';
import qs from 'query-string';
import urlJoin from 'url-join';

import { appEnv } from '@/config/app';
import { DEFAULT_DISCOVER_AGENT_ITEM } from '@/const/discover';
import { DiscoverAssistantItem } from '@/types/discover';

import { API_ENDPOINTS } from './_url';

const revalidate: number = 3600;

class AssistantService {
  private _formatUrl = (url: string) => {
    return appEnv && appEnv?.APP_URL ? urlJoin(appEnv.APP_URL!, url) : url;
  };

  getAssistantList = async (locale: string): Promise<DiscoverAssistantItem[]> => {
    const res = await fetch(
      qs.stringifyUrl({
        query: { locale },
        url: this._formatUrl(API_ENDPOINTS.assistantStore),
      }),
      {
        next: { revalidate },
      },
    );

    const json = await res.json();

    return json.agents;
  };

  getAssistantById = async (locale: string, identifier: string): Promise<DiscoverAssistantItem> => {
    const res = await fetch(
      qs.stringifyUrl({
        query: { locale },
        url: this._formatUrl(API_ENDPOINTS.assistant(identifier)),
      }),
      {
        next: { revalidate: 12 * revalidate },
      },
    );

    const agent: DiscoverAssistantItem = await res.json();

    return merge(cloneDeep(DEFAULT_DISCOVER_AGENT_ITEM), agent);
  };
}
export const assistantService = new AssistantService();
