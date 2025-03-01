import { CrawlSuccessResult } from '@lobechat/web-crawler';

export interface CrawlSinglePageQuery {
  url: string;
}
export interface CrawlMultiPagesQuery {
  urls: string[];
}

interface CrawlResult {
  crawler: string;
  data: CrawlSuccessResult;
  originalUrl: string;
}

export interface CrawlResponse {
  results: CrawlResult[];
}
