import { memo } from 'react';

import { CrawlResponse } from '@/types/tool/crawler';

import Result from './Result';

interface PagesContentProps {
  results: CrawlResponse['results'];
  urls: string[];
}

const PagesContent = memo<PagesContentProps>(({ results }) => {
  if (!results || results.length === 0) {
    return <div>无数据可显示</div>;
  }

  return results.map((result) => {
    return (
      <Result
        crawler={result.crawler}
        key={result.originalUrl}
        originalUrl={result.originalUrl}
        result={result.data}
      />
    );
  });
});

export default PagesContent;
