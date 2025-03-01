import { memo } from 'react';

import { CrawlPluginState } from '@/types/tool/crawler';

import Result from './Result';

interface PagesContentProps {
  messageId: string;
  results?: CrawlPluginState['results'];
  urls: string[];
}

const PagesContent = memo<PagesContentProps>(({ results, messageId }) => {
  if (!results || results.length === 0) {
    return <div>loading...</div>;
  }

  return results.map((result) => (
    <Result
      crawler={result.crawler}
      key={result.originalUrl}
      messageId={messageId}
      originalUrl={result.originalUrl}
      result={result.data}
    />
  ));
});

export default PagesContent;
