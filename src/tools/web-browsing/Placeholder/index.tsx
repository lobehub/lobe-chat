import {
  BuiltinPlaceholderProps,
  CrawlMultiPagesQuery,
  CrawlSinglePageQuery,
  SearchQuery,
} from '@lobechat/types';
import { Skeleton } from 'antd';
import { memo } from 'react';

import { WebBrowsingApiName } from '@/tools/web-browsing';

import PageContent from './PageContent';
import { Search } from './Search';

const Placeholder = memo<BuiltinPlaceholderProps>(({ apiName, args }) => {
  switch (apiName) {
    case WebBrowsingApiName.search: {
      const { query } = args as SearchQuery;
      return <Search query={query} />;
    }

    case WebBrowsingApiName.crawlSinglePage: {
      const { url } = args as CrawlSinglePageQuery;

      return <PageContent urls={[url]} />;
    }

    case WebBrowsingApiName.crawlMultiPages: {
      const { urls } = args as CrawlMultiPagesQuery;

      return <PageContent urls={urls} />;
    }

    default: {
      return <Skeleton.Button />;
    }
  }
});

export default Placeholder;
