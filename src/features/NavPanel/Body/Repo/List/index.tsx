'use client';

import { memo, useMemo } from 'react';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useKnowledgeBaseStore } from '@/store/knowledgeBase';

import EmptyStatus from '../EmptyStatus';
import SkeletonList from '../SkeletonList';
import Item from './Item';

const RepoList = memo(() => {
  const expand = useGlobalStore(systemStatusSelectors.showSessionPanel);
  const useFetchKnowledgeBaseList = useKnowledgeBaseStore((s) => s.useFetchKnowledgeBaseList);
  const { data, isLoading } = useFetchKnowledgeBaseList();

  // Memoize items to prevent unnecessary re-renders
  const items = useMemo(() => {
    if (!data || isLoading) return null;
    if (data.length === 0) return null;

    return data.map((item) => <Item {...item} key={item.id} />);
  }, [data, isLoading]);

  // Early returns for loading and empty states
  if (!data || isLoading) return <SkeletonList />;
  if (data.length === 0) return expand ? <EmptyStatus /> : null;

  return items;
});

export default RepoList;
