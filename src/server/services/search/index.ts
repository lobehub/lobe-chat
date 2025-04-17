import { CrawlImplType, Crawler } from '@lobechat/web-crawler';
import { TRPCError } from '@trpc/server';
import pMap from 'p-map';

import { toolsEnv } from '@/config/tools';
import { SearXNGClient } from '@/server/modules/SearXNG';
import { SEARCH_SEARXNG_NOT_CONFIG } from '@/types/tool/search';

export class SearchService {
  private get crawlerImpls() {
    const envString = toolsEnv.CRAWLER_IMPLS || '';
    // 处理全角逗号和多余空格
    let envValue = envString.replaceAll('，', ',').trim();
    return envValue.split(',').filter(Boolean);
  }

  async crawlPages(input: { impls?: CrawlImplType[]; urls: string[] }) {
    const crawler = new Crawler({ impls: this.crawlerImpls });

    const results = await pMap(
      input.urls,
      async (url) => {
        return await crawler.crawl({ impls: input.impls, url });
      },
      { concurrency: 3 },
    );

    return { results };
  }

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

      throw new TRPCError({
        code: 'SERVICE_UNAVAILABLE',
        message: (e as Error).message,
      });
    }
  }
}

// 添加一个默认导出的实例，方便使用
export const searchService = new SearchService();
