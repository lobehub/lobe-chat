'use client';

import React, { memo } from 'react';

import SkeletonList from '@/features/NavPanel/Body/SkeletonList';
import { useKnowledgeBaseStore } from '@/store/knowledgeBase';

import EmptyStatus from './EmptyStatus';
import List from './List';

const KnowledgeBaseList = memo(() => {
  const useFetchKnowledgeBaseList = useKnowledgeBaseStore((s) => s.useFetchKnowledgeBaseList);
  const { data, isLoading } = useFetchKnowledgeBaseList();

  if (isLoading) return <SkeletonList paddingInline={4} rows={3} />;

  if (data?.length === 0) return <EmptyStatus />;

  return <List />;
});

export default KnowledgeBaseList;
