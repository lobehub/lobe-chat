interface FirecrawlScrapeOptions {
  formats: string[];
}

export interface FirecrawlSearchParameters {
  country?: string;
  lang?: string;
  limit?: number;
  query: string;
  scrapeOptions?: FirecrawlScrapeOptions;
  tbs?: string;
  timeout?: number;
}

interface FirecrawlMetadata {
  description?: string;
  sourceURL?: string;
  statusCode?: number;
  title: string;
}

interface FirecrawlData {
  description?: string;
  html?: string;
  links?: string[];
  markdown?: string;
  metadata?: FirecrawlMetadata;
  title?: string;
  url: string;
}

export interface FirecrawlResponse {
  data: FirecrawlData[];
  success?: boolean;
}
