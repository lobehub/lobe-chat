import { CrawlSuccessResult } from '@lobechat/web-crawler';

export interface CrawlSinglePageQuery {
  url: string;
}

export interface CrawlMultiPagesQuery {
  urls: string[];
}

export interface CrawlResult {
  crawler: string;
  data: CrawlSuccessResult;
  originalUrl: string;
}

export interface CrawlPluginState {
  results: CrawlResult[];
}
