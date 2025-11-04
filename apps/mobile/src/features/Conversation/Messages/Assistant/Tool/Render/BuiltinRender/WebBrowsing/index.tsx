import {
  CrawlMultiPagesQuery,
  CrawlPluginState,
  CrawlSinglePageQuery,
  SearchQuery as SearchQueryType,
  UniformSearchResponse,
} from '@lobechat/types';
import { Flexbox } from '@lobehub/ui-rn';
import { memo, useMemo } from 'react';

import PageContent from './PageContent';
import SearchQuery from './SearchQuery';
import SearchResult from './SearchResult';

export interface WebBrowsingRenderProps {
  apiName: string;
  arguments?: string;
  pluginState?: any;
}

/**
 * WebBrowsingRender - Web 搜索工具渲染
 * 简化版，支持搜索和爬虫功能
 */
const WebBrowsingRender = memo<WebBrowsingRenderProps>(
  ({ apiName, arguments: args, pluginState }) => {
    // 解析 arguments
    const parsedArgs = useMemo(() => {
      if (!args) return undefined;
      try {
        return JSON.parse(args);
      } catch {
        return undefined;
      }
    }, [args]);

    // 搜索 API - 展示搜索查询和搜索结果
    if (apiName === 'search' || apiName === 'searchWithSearXNG') {
      const searchQuery = parsedArgs as SearchQueryType;
      return (
        <Flexbox gap={8}>
          <SearchQuery query={searchQuery?.query} />
          <SearchResult searchResponse={pluginState as UniformSearchResponse} />
        </Flexbox>
      );
    }

    // 爬取单个页面
    if (apiName === 'crawlSinglePage') {
      const singlePageArgs = parsedArgs as CrawlSinglePageQuery;
      return (
        <PageContent
          results={(pluginState as CrawlPluginState)?.results}
          urls={singlePageArgs?.url ? [singlePageArgs.url] : []}
        />
      );
    }

    // 爬取多个页面
    if (apiName === 'crawlMultiPages') {
      const multiPagesArgs = parsedArgs as CrawlMultiPagesQuery;
      return (
        <PageContent
          results={(pluginState as CrawlPluginState)?.results}
          urls={multiPagesArgs?.urls || []}
        />
      );
    }

    // 其他 API 暂不支持
    return null;
  },
);

WebBrowsingRender.displayName = 'WebBrowsingRender';

export default WebBrowsingRender;
