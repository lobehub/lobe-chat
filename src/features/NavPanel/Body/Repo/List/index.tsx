'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { Link, useNavigate } from 'react-router-dom';

import { LIBRARY_URL } from '@/const/url';
import { useRepoMenuItems } from '@/features/NavPanel/hooks';
import { useKnowledgeBaseStore } from '@/store/knowledgeBase';

import EmptyStatus from '../../EmptyStatus';
import SkeletonList from '../../SkeletonList';
import Item from './Item';

const RepoList = memo(() => {
  const navigate = useNavigate();
  const { t } = useTranslation('file');
  const useFetchKnowledgeBaseList = useKnowledgeBaseStore((s) => s.useFetchKnowledgeBaseList);
  const { data, isLoading } = useFetchKnowledgeBaseList();
  const { createRepo } = useRepoMenuItems();

  if (!data || isLoading) return <SkeletonList />;

  const isEmpty = data.length === 0;

  if (isEmpty) {
    return <EmptyStatus onClick={createRepo} title={t('knowledgeBase.new')} />;
  }

  return (
    <Flexbox gap={1}>
      {data.map((item) => (
        <Link
          aria-label={item.id}
          key={item.id}
          onClick={(e) => {
            e.preventDefault();
            navigate(LIBRARY_URL(item.id));
          }}
          to={LIBRARY_URL(item.id)}
        >
          <Item {...item} key={item.id} />
        </Link>
      ))}
    </Flexbox>
  );
});

export default RepoList;
