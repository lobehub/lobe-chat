import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { CrawlPluginState } from '@/types/tool/crawler';

import Loading from './Loading';
import Result from './Result';

interface PagesContentProps {
  messageId: string;
  results?: CrawlPluginState['results'];
  urls: string[];
}

const PagesContent = memo<PagesContentProps>(({ results, messageId, urls }) => {
  if (!results || results.length === 0) {
    return (
      <Flexbox gap={12} horizontal>
        {urls.map((url) => (
          <Loading key={url} url={url} />
        ))}
      </Flexbox>
    );
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
