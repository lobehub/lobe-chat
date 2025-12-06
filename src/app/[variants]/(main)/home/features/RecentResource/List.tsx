'use client';

import { memo } from 'react';
import { Link } from 'react-router-dom';

import GroupSkeleton from '@/app/[variants]/(main)/home/features/components/GroupSkeleton';
import { RECENT_BLOCK_SIZE } from '@/app/[variants]/(main)/home/features/const';
import { useSessionStore } from '@/store/session';
import { recentSelectors } from '@/store/session/selectors';

import RecentResourceItem from './Item';

const RecentResourceList = memo(() => {
  const files = useSessionStore(recentSelectors.recentResources);
  const isInit = useSessionStore(recentSelectors.isRecentResourcesInit);

  // Loading state
  if (!isInit) {
    return (
      <GroupSkeleton
        height={RECENT_BLOCK_SIZE.RESOURCE.HEIGHT}
        width={RECENT_BLOCK_SIZE.RESOURCE.WIDTH}
      />
    );
  }

  return files.map((file) => {
    const isPage = file.fileType === 'text/plain';
    const fileUrl = isPage ? `/resource/${file.id}` : `/resource?file=${file.id}`;

    return (
      <Link
        key={file.id}
        style={{
          color: 'inherit',
          textDecoration: 'none',
        }}
        to={fileUrl}
      >
        <RecentResourceItem file={file} />
      </Link>
    );
  });
});

export default RecentResourceList;
