import { TRPCError } from '@trpc/server';

import { toolsEnv } from '@/config/tools';
import { SearXNGClient } from '@/server/modules/SearXNG';
import { SEARCH_SEARXNG_NOT_CONFIG } from '@/types/tool/search';

import { SearchServiceImpl } from './type';

/**
 * SearXNG implementation of the search service
 */
export class SearXNGImpl implements SearchServiceImpl {
  async query(
    query: string,
    params?: {
      searchCategories?: string[];
      searchEngines?: string[];
      searchTimeRange?: string;
    },
  ) {
    if (!toolsEnv.SEARXNG_URL) {
      throw new TRPCError({ code: 'NOT_IMPLEMENTED', message: SEARCH_SEARXNG_NOT_CONFIG });
    }

    const client = new SearXNGClient(toolsEnv.SEARXNG_URL);

    try {
      return await client.search(query, {
        categories: params?.searchCategories,
        engines: params?.searchEngines,
        time_range: params?.searchTimeRange,
      });
    } catch (e) {
      console.error(e);

      throw e;
    }
  }
}
