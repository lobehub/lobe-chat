import { toolsClient } from '@/libs/trpc/client';

class SearchService {
  search(query: string, searchEngine?: string[]) {
    return toolsClient.search.query.query({ query, searchEngine });
  }
}

export const searchService = new SearchService();
