'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useKnowledgeBaseStore } from '@/store/knowledgeBase';

import SkeletonList from '../../SkeletonList';
import EmptyStatus from '../EmptyStatus';
import Item from './Item';

const RepoList = memo<{ expand?: boolean }>(({ expand }) => {
  const useFetchKnowledgeBaseList = useKnowledgeBaseStore((s) => s.useFetchKnowledgeBaseList);
  const { data, isLoading } = useFetchKnowledgeBaseList();

  if (!data || isLoading) return <SkeletonList />;
  if (data.length === 0) return expand ? <EmptyStatus /> : null;

  return (
    <Flexbox gap={2}>
      {data.map((item) => (
        <Item {...item} expand={expand} key={item.id} />
      ))}
    </Flexbox>
  );
});

export default RepoList;
