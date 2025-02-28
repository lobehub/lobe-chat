import { CrawlImplType, crawlImpls } from './crawImpl';

export class Crawler {
  impls = ['naive', 'jina', 'browserless'] as const;

  /**
   *
   * @param url
   */
  async crawl({ url, impls }: { impls?: string[]; url: string }) {
    let finalError: Error | undefined;

    const finalImpls = impls
      ? (impls.filter((impl) => Object.keys(crawlImpls).includes(impl)) as CrawlImplType[])
      : this.impls;

    //   按照内置的实现顺序依次尝试
    for (const impl of finalImpls) {
      try {
        const res = await crawlImpls[impl](url, {});

        if (res) return { crawler: impl, data: res };
      } catch (error) {
        console.error(error);
        finalError = error as Error;
      }
    }

    return { content: 'fail to crawl page content', errorMessage: finalError?.message, url };
  }
}
