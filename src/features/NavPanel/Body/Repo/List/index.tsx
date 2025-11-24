'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useRepoMenuItems } from '@/features/NavPanel/hooks';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useKnowledgeBaseStore } from '@/store/knowledgeBase';

import EmptyStatus from '../../EmptyStatus';
import SkeletonList from '../../SkeletonList';
import Item from './Item';

const RepoList = memo(() => {
  const expand = useGlobalStore(systemStatusSelectors.showSessionPanel);
  const { t } = useTranslation('file');
  const useFetchKnowledgeBaseList = useKnowledgeBaseStore((s) => s.useFetchKnowledgeBaseList);
  const { data, isLoading } = useFetchKnowledgeBaseList();
  const { createRepo } = useRepoMenuItems();

  if (!data || isLoading) return <SkeletonList />;

  const isEmpty = data.length === 0;

  if (isEmpty) {
    if (!expand) return null;
    return <EmptyStatus onClick={createRepo} title={t('knowledgeBase.new')} />;
  }

  return (
    <Flexbox gap={2}>
      {data.map((item) => (
        <Item {...item} expand={expand} key={item.id} />
      ))}
    </Flexbox>
  );
});

export default RepoList;
