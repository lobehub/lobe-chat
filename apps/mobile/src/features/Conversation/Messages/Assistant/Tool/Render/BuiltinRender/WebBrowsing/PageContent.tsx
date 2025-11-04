import { CrawlPluginState } from '@lobechat/types';
import { Flexbox, ScrollShadow } from '@lobehub/ui-rn';
import { memo } from 'react';

import PageLoading from './PageLoading';
import PageResult from './PageResult';

interface PageContentProps {
  results?: CrawlPluginState['results'];
  urls?: string[];
}

/**
 * PageContent - 页面爬取结果展示
 * 简化版，横向滚动展示爬取结果
 */
const PageContent = memo<PageContentProps>(({ results, urls = [] }) => {
  // 加载中状态
  if (!results || results.length === 0) {
    if (!urls || urls.length === 0) return null;

    return (
      <Flexbox gap={8} horizontal>
        {urls.map((url, index) => (
          <PageLoading key={`${url}_${index}`} url={url} />
        ))}
      </Flexbox>
    );
  }

  // 展示结果
  return (
    <ScrollShadow hideScrollBar horizontal orientation="horizontal" size={10}>
      <Flexbox gap={8} horizontal>
        {results.map((result) => (
          <PageResult
            crawler={result.crawler}
            key={result.originalUrl}
            originalUrl={result.originalUrl}
            result={result.data as any}
          />
        ))}
      </Flexbox>
    </ScrollShadow>
  );
});

PageContent.displayName = 'PageContent';

export default PageContent;
