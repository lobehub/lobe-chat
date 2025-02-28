export interface CrawResult {
  content?: string;
  description?: string;
  length?: number;
  siteName?: string;
  title?: string;
  url: string;
}

export type CrawlImpl<Params = object> = (
  url: string,
  params: Params,
) => Promise<CrawResult | undefined>;
