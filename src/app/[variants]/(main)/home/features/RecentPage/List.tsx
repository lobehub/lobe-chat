'use client';

import { memo } from 'react';
import { Link } from 'react-router-dom';

import GroupSkeleton from '@/app/[variants]/(main)/home/features/components/GroupSkeleton';
import { RECENT_BLOCK_SIZE } from '@/app/[variants]/(main)/home/features/const';
import { useInitRecentPage } from '@/hooks/useInitRecentPage';

import RecentPageItem from './Item';

const RecentPageList = memo(() => {
  const { data: documents, isLoading } = useInitRecentPage();

  if (isLoading) {
    return (
      <GroupSkeleton height={RECENT_BLOCK_SIZE.PAGE.HEIGHT} width={RECENT_BLOCK_SIZE.PAGE.WIDTH} />
    );
  }

  if (!documents || documents.length === 0) {
    return null;
  }

  return documents.map((document) => {
    const pageUrl = `/page/${document.id}`;

    return (
      <Link
        key={document.id}
        style={{
          color: 'inherit',
          textDecoration: 'none',
        }}
        to={pageUrl}
      >
        <RecentPageItem document={document} />
      </Link>
    );
  });
});

export default RecentPageList;
