import { CrawlImplType, crawlImpls } from './crawImpl';
import { CrawlUrlRule } from './type';
import { crawUrlRules } from './urlRules';
import { applyUrlRules } from './utils/appUrlRules';

export class Crawler {
  impls = ['naive', 'jina', 'browserless'] as const;

  /**
   * 爬取网页内容
   * @param options 爬取选项
   */
  async crawl({
    url,
    impls,
    filterOptions: userFilterOptions,
  }: {
    filterOptions?: CrawlUrlRule['filterOptions'];
    impls?: string[];
    url: string;
  }) {
    // 应用URL规则
    const { transformedUrl, filterOptions: ruleFilterOptions } = applyUrlRules(url, crawUrlRules);

    // 合并用户提供的过滤选项和规则中的过滤选项，用户选项优先
    const mergedFilterOptions = {
      ...ruleFilterOptions,
      ...userFilterOptions,
    };

    let finalError: Error | undefined;

    const finalImpls = impls
      ? (impls.filter((impl) => Object.keys(crawlImpls).includes(impl)) as CrawlImplType[])
      : this.impls;

    //   按照内置的实现顺序依次尝试
    for (const impl of finalImpls) {
      try {
        const res = await crawlImpls[impl](transformedUrl, { filterOptions: mergedFilterOptions });

        if (res)
          return {
            crawler: impl,
            data: res,
            originalUrl: url,
            transformedUrl: transformedUrl !== url ? transformedUrl : undefined,
          };
      } catch (error) {
        console.error(error);
        finalError = error as Error;
      }
    }

    const errorType = finalError?.name || 'UnknownError';
    const errorMessage = finalError?.message;

    return {
      content: `Fail to crawl the page. Error type: ${errorType}, error message: ${errorMessage}`,
      errorMessage: errorMessage,
      errorType,
      originalUrl: url,
      transformedUrl: transformedUrl !== url ? transformedUrl : undefined,
    };
  }
}
