import { Search1APIImpl } from './search1api';
import { SearXNGImpl } from './searxng';
import { SearchServiceImpl } from './type';

/**
 * Available search service implementations
 */
export enum SearchImplType {
  SearXNG = 'searxng',
  Search1API = 'search1api',
}

/**
 * Create a search service implementation instance
 */
export const createSearchServiceImpl = (
  type: SearchImplType = SearchImplType.SearXNG,
): SearchServiceImpl => {
  switch (type) {
    case SearchImplType.SearXNG: {
      return new SearXNGImpl();
    }

    default: {
      return new Search1APIImpl();
    }
  }
};

export type { SearchServiceImpl } from './type';
