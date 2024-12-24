import React, { memo, useCallback } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { SearchResult } from '@/types/tool/search';

import Item from './SearchItem';

interface ResultListProps {
  dataSources: SearchResult[];
}

const ResultList = memo<ResultListProps>(({ dataSources }) => {
  const itemContent = useCallback(
    (index: number, result: SearchResult) => <Item {...result} highlight={index < 5} />,
    [],
  );

  return <Virtuoso data={dataSources} height={'100%'} itemContent={itemContent} />;
});

export default ResultList;
