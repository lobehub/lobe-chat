import React, { memo, useCallback } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { UniformSearchResult } from '@/types/tool/search';

import Item from './SearchItem';

interface ResultListProps {
  dataSources: UniformSearchResult[];
}

const ResultList = memo<ResultListProps>(({ dataSources }) => {
  const itemContent = useCallback(
    (index: number, result: UniformSearchResult) => <Item {...result} highlight={index < 15} />,
    [],
  );

  return <Virtuoso data={dataSources} height={'100%'} itemContent={itemContent} />;
});

export default ResultList;
