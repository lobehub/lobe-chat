import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

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

  return (
    <Flexbox gap={12} horizontal>
      {results.map((result) => (
        <Result
          crawler={result.crawler}
          key={result.originalUrl}
          messageId={messageId}
          originalUrl={result.originalUrl}
          result={result.data}
        />
      ))}
    </Flexbox>
  );
});

export default PagesContent;
