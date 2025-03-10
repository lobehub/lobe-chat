import { memo } from 'react';

import { WebBrowsingApiName } from '@/tools/web-browsing';
import PageContent from '@/tools/web-browsing/Render/PageContent';
import { BuiltinRenderProps } from '@/types/tool';
import { CrawlMultiPagesQuery, CrawlPluginState, CrawlSinglePageQuery } from '@/types/tool/crawler';
import { SearchContent, SearchQuery, SearchResponse } from '@/types/tool/search';

import Search from './Search';

const WebBrowsing = memo<BuiltinRenderProps<SearchContent[]>>(
  ({ messageId, args, pluginState, pluginError, apiName }) => {
    switch (apiName) {
      case WebBrowsingApiName.searchWithSearXNG: {
        return (
          <Search
            messageId={messageId}
            pluginError={pluginError}
            searchQuery={args as SearchQuery}
            searchResponse={pluginState as SearchResponse}
          />
        );
      }

      case WebBrowsingApiName.crawlSinglePage: {
        return (
          <PageContent
            messageId={messageId}
            results={(pluginState as CrawlPluginState)?.results}
            urls={[(args as CrawlSinglePageQuery).url]}
          />
        );
      }

      case WebBrowsingApiName.crawlMultiPages: {
        return (
          <PageContent
            messageId={messageId}
            results={(pluginState as CrawlPluginState)?.results}
            urls={(args as CrawlMultiPagesQuery).urls}
          />
        );
      }
    }
  },
);

WebBrowsing.displayName = 'WebBrowsing';

export default WebBrowsing;
