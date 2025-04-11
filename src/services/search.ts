import { toolsClient } from '@/libs/trpc/client';

class SearchService {
  search(query: string, optionalParams?: object) {
    return toolsClient.search.query.query({ optionalParams, query });
  }

  crawlPage(url: string) {
    return toolsClient.search.crawlPages.mutate({ urls: [url] });
  }

  crawlPages(urls: string[]) {
    return toolsClient.search.crawlPages.mutate({ urls });
  }
}

export const searchService = new SearchService();
