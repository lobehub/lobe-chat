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

export interface CrawlUrlRule {
  // 内容过滤配置（可选）
  filterOptions?: {
    // 是否启用Readability
    enableReadability?: boolean;
    // 其他过滤选项
    keepImages?: boolean;
    keepTables?: boolean;
    minContentLength?: number;
  };
  // 是否使用正则表达式匹配（默认为glob模式）
  isRegex?: boolean;
  // URL匹配模式，支持glob模式或正则表达式
  urlPattern: string;
  // URL转换模板（可选），如果提供则进行URL转换
  urlTransform?: string;
}
