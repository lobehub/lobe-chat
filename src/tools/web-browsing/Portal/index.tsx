import { memo } from 'react';

import { WebBrowsingApiName } from '@/tools/web-browsing';
import { BuiltinPortalProps } from '@/types/tool';
import { CrawlPluginState } from '@/types/tool/crawler';
import { SearchQuery } from '@/types/tool/search';

import PageContent from './PageContent';
import Search from './Search';

const Inspector = memo<BuiltinPortalProps>(({ arguments: args, messageId, state, apiName }) => {
  switch (apiName) {
    case WebBrowsingApiName.searchWithSearXNG: {
      return <Search messageId={messageId} query={args as SearchQuery} response={state} />;
    }

    case WebBrowsingApiName.crawlSinglePage: {
      const url = args.url;
      const result = (state as CrawlPluginState).results.find(
        (result) => result.originalUrl === url,
      );
      return <PageContent messageId={messageId} result={result} />;
    }

    case WebBrowsingApiName.crawlMultiPages: {
      console.log(args);
      console.log(state);
      // return <PageContent content={state as CrawlPluginState} messageId={messageId} />;}
    }
  }
  return null;
});

export default Inspector;
