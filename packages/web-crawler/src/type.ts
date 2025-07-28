export interface CrawlSuccessResult {
  content?: string;
  contentType: 'text' | 'json';
  description?: string;
  length?: number;
  siteName?: string;
  title?: string;
  url: string;
}

export interface CrawlErrorResult {
  content: string;
  errorMessage: string;
  errorType: string;
  url: string;
}

export interface FilterOptions {
  // 是否启用Readability
  enableReadability?: boolean;

  pureText?: boolean;
}

type CrawlImplType = 'naive' | 'jina' | 'browserless' | 'search1api';

type CrawlImplParams<T> = T & {
  filterOptions: FilterOptions;
};

export type CrawlImpl<Params = object> = (
  url: string,
  params: CrawlImplParams<Params>,
) => Promise<CrawlSuccessResult | undefined>;

export interface CrawlUrlRule {
  // 内容过滤配置（可选）
  filterOptions?: FilterOptions;
  impls?: CrawlImplType[];
  // URL匹配模式，仅支持正则表达式
  urlPattern: string;
  // URL转换模板（可选），如果提供则进行URL转换
  urlTransform?: string;
}
