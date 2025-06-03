import { BochaImpl } from './bocha';
import { ExaImpl } from './exa';
import { FirecrawlImpl } from './firecrawl';
import { JinaImpl } from './jina';
import { Search1APIImpl } from './search1api';
import { SearXNGImpl } from './searxng';
import { TavilyImpl } from './tavily';

import { SearchServiceImpl } from './type';

/**
 * Available search service implementations
 */
export enum SearchImplType {
  Bocha = 'bocha',
  Exa = 'exa',
  Firecrawl = 'firecrawl',
  Jina = 'jina',
  SearXNG = 'searxng',
  Search1API = 'search1api',
  Tavily = 'tavily',
}

/**
 * Create a search service implementation instance
 */
export const createSearchServiceImpl = (
  type: SearchImplType = SearchImplType.SearXNG,
): SearchServiceImpl => {
  switch (type) {
    case SearchImplType.Bocha: {
      return new BochaImpl();
    }

    case SearchImplType.Exa: {
      return new ExaImpl();
    }

    case SearchImplType.Firecrawl: {
      return new FirecrawlImpl();
    }

    case SearchImplType.Jina: {
      return new JinaImpl();
    }

    case SearchImplType.SearXNG: {
      return new SearXNGImpl();
    }

    case SearchImplType.Tavily: {
      return new TavilyImpl();
    }

    default: {
      return new Search1APIImpl();
    }
  }
};

export type { SearchServiceImpl } from './type';
