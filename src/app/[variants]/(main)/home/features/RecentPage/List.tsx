'use client';

import { memo } from 'react';
import { Link } from 'react-router-dom';

import GroupSkeleton from '@/app/[variants]/(main)/home/features/components/GroupSkeleton';
import { RECENT_BLOCK_SIZE } from '@/app/[variants]/(main)/home/features/const';
import { useSessionStore } from '@/store/session';
import { recentSelectors } from '@/store/session/selectors';

import RecentPageItem from './Item';

const RecentPageList = memo(() => {
  const documents = useSessionStore(recentSelectors.recentPages);
  const isInit = useSessionStore(recentSelectors.isRecentPagesInit);

  // Loading state
  if (!isInit) {
    return (
      <GroupSkeleton height={RECENT_BLOCK_SIZE.PAGE.HEIGHT} width={RECENT_BLOCK_SIZE.PAGE.WIDTH} />
    );
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
