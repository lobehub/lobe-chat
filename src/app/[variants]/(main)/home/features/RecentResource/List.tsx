'use client';

import { memo } from 'react';
import { Link } from 'react-router-dom';

import GroupSkeleton from '@/app/[variants]/(main)/home/features/components/GroupSkeleton';
import { RECENT_BLOCK_SIZE } from '@/app/[variants]/(main)/home/features/const';
import { useInitRecentResource } from '@/hooks/useInitRecentResource';

import RecentResourceItem from './Item';

const RecentResourceList = memo(() => {
  const { data: files, isLoading } = useInitRecentResource();

  if (isLoading) {
    return (
      <GroupSkeleton
        height={RECENT_BLOCK_SIZE.RESOURCE.HEIGHT}
        width={RECENT_BLOCK_SIZE.RESOURCE.WIDTH}
      />
    );
  }

  if (!files || files.length === 0) {
    return null;
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
