export interface SearchProvider {
  description: string;
  id: string;
  name: string;
}

export interface CrawlProvider {
  description: string;
  id: string;
  name: string;
  needsApi: boolean;
  sharedWith?: string;
}

export interface SearchSettings {
  crawlConfig?: {
    executeJS?: boolean;
    includeImages?: boolean;
    maxContentLength?: number;
    outputFormat?: 'markdown' | 'html' | 'text';
    proxy?: string;
    timeout?: number;
    userAgent?: string;
  };
  crawlProvider?: string;
  searchConfig?: {
    autoRetry?: boolean;
    depth?: 'basic' | 'advanced';
    enableCache?: boolean;
    excludeDomains?: string[];
    language?: string;
    maxResults?: number;
  };
  searchProvider?: string;
}

export type TestStatus = null | 'testing' | 'success' | 'error';
