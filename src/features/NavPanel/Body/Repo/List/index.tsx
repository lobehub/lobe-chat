'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useRepoMenuItems } from '@/features/NavPanel/hooks';
import { useKnowledgeBaseStore } from '@/store/knowledgeBase';

import EmptyStatus from '../../EmptyStatus';
import SkeletonList from '../../SkeletonList';
import Item from './Item';

const RepoList = memo<{ expand?: boolean }>(({ expand }) => {
  const { t } = useTranslation('file');
  const useFetchKnowledgeBaseList = useKnowledgeBaseStore((s) => s.useFetchKnowledgeBaseList);
  const { data, isLoading } = useFetchKnowledgeBaseList();
  const { createKnowledgeBase } = useRepoMenuItems();

  if (!data || isLoading) return <SkeletonList />;
  if (data.length === 0)
    return expand ? (
      <EmptyStatus onClick={createKnowledgeBase} title={t('knowledgeBase.new')} />
    ) : null;

  return (
    <Flexbox gap={2}>
      {data.map((item) => (
        <Item {...item} expand={expand} key={item.id} />
      ))}
    </Flexbox>
  );
});

export default RepoList;
