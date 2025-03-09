import { toolsClient } from '@/libs/trpc/client';

class SearchService {
  search(query: string, searchEngine?: string[], searchTimeRange?: string) {
    return toolsClient.search.query.query({ query, searchEngine, searchTimeRange });
  }

  crawlPage(url: string) {
    return toolsClient.search.crawlPages.mutate({ urls: [url] });
  }

  crawlPages(urls: string[]) {
    return toolsClient.search.crawlPages.mutate({ urls });
  }
}

export const searchService = new SearchService();
