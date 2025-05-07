import { CrawlImplType, Crawler } from '@lobechat/web-crawler';
import pMap from 'p-map';

import { toolsEnv } from '@/config/tools';
import { SearchParams } from '@/types/tool/search';

import { SearchImplType, SearchServiceImpl, createSearchServiceImpl } from './impls';

const parseImplEnv = (envString: string = '') => {
  // 处理全角逗号和多余空格
  const envValue = envString.replaceAll('，', ',').trim();
  return envValue.split(',').filter(Boolean);
};

/**
 * Search service class
 * Uses different implementations for different search operations
 */
export class SearchService {
  private searchImpl: SearchServiceImpl;

  private get crawlerImpls() {
    return parseImplEnv(toolsEnv.CRAWLER_IMPLS);
  }

  constructor() {
    const impls = this.searchImpls;
    // TODO: need use turn mode
    this.searchImpl = createSearchServiceImpl(impls.length > 0 ? impls[0] : undefined);
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

  private get searchImpls() {
    return parseImplEnv(toolsEnv.SEARCH_PROVIDERS) as SearchImplType[];
  }

  /**
   * Query for search results
   */
  async query(query: string, params?: SearchParams) {
    return this.searchImpl.query(query, params);
  }
}

// Add a default exported instance for convenience
export const searchService = new SearchService();
