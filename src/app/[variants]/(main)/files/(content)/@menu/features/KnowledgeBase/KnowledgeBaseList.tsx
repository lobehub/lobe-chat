import React from 'react';
import { Flexbox } from 'react-layout-kit';
import { Virtuoso } from 'react-virtuoso';

import { useKnowledgeBaseStore } from '@/store/knowledgeBase';

import EmptyStatus from './EmptyStatus';
import Item from './Item';
import { SkeletonList } from './SkeletonList';

const KnowledgeBaseList = () => {
  const useFetchKnowledgeBaseList = useKnowledgeBaseStore((s) => s.useFetchKnowledgeBaseList);
  const { data, isLoading } = useFetchKnowledgeBaseList();

  if (isLoading) return <SkeletonList />;

  if (data?.length === 0) return <EmptyStatus />;

  return (
    <Flexbox height={'100%'}>
      <Virtuoso
        data={data}
        fixedItemHeight={36}
        itemContent={(index, data) => <Item id={data.id} key={data.id} name={data.name} />}
      />
    </Flexbox>
  );
};

export default KnowledgeBaseList;
