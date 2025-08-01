export interface UserSearchConfig {
  crawlApiKey?: string;
  /**
   * 爬虫配置
   */
  crawlConfig?: {
    executeJS?: boolean;
    includeImages?: boolean;
    maxContentLength?: number;
    outputFormat?: 'markdown' | 'html' | 'text';
    timeout?: number;
  };
  crawlEndpoint?: string;

  /**
   * 爬虫提供商配置
   */
  crawlProvider?: string;

  searchApiKey?: string;
  /**
   * 搜索引擎配置
   */
  searchConfig?: {
    excludeDomains?: string;
    maxResults?: number;
  };
  searchEndpoint?: string;

  /**
   * 搜索提供商配置
   */
  searchProvider?: string;
}
