import { memo } from 'react';

import { WebBrowsingApiName } from '@/tools/web-browsing';
import PageContent from '@/tools/web-browsing/Render/PageContent';
import { BuiltinRenderProps } from '@/types/tool';
import { CrawlMultiPagesQuery, CrawlResponse, CrawlSinglePageQuery } from '@/types/tool/crawler';
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
            results={(pluginState as CrawlResponse).results}
            urls={[(args as CrawlSinglePageQuery).url]}
          />
        );
      }

      case WebBrowsingApiName.crawlMultiPages: {
        return (
          <PageContent
            results={(pluginState as CrawlResponse).results}
            urls={(args as CrawlMultiPagesQuery).urls}
          />
        );
      }
    }
  },
);

export default WebBrowsing;
