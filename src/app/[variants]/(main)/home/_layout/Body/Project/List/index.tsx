'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { Link, useNavigate } from 'react-router-dom';

import { LIBRARY_URL } from '@/const/url';
import { useKnowledgeBaseStore } from '@/store/knowledgeBase';

import SkeletonList from '../../../../../../../../features/NavPanel/components/SkeletonList';
import { useProjectMenuItems } from '../../../hooks';
import EmptyStatus from '../../EmptyStatus';
import Item from './Item';

const ProjectList = memo(() => {
  const navigate = useNavigate();
  const useFetchKnowledgeBaseList = useKnowledgeBaseStore((s) => s.useFetchKnowledgeBaseList);
  const { data, isLoading } = useFetchKnowledgeBaseList();
  const { createProject } = useProjectMenuItems();

  if (!data || isLoading) return <SkeletonList />;

  const isEmpty = data.length === 0;

  if (isEmpty) {
    return <EmptyStatus onClick={createProject} title={'新建项目'} />;
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

export default ProjectList;
