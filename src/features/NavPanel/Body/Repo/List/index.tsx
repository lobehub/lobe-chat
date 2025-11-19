'use client';

import React, { memo } from 'react';

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

  if (!data || isLoading) return <SkeletonList />;

  if (data.length === 0) return expand ? <EmptyStatus /> : null;

  return data.map((item) => <Item {...item} key={item.id} />);
});

export default RepoList;
