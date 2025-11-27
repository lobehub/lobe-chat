'use client';

import { Skeleton } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import NewTopicButton from './NewTopicButton';

const borderRadius = 6;

const SkeletonList = memo(() => {
  return (
    <Flexbox align="center" gap={6} width={'100%'}>
      <NewTopicButton />

      {/* Topic items skeleton */}
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index}>
          <Skeleton.Avatar
            active
            size={48}
            style={{
              borderRadius,
            }}
          />
        </div>
      ))}
    </Flexbox>
  );
});

SkeletonList.displayName = 'SkeletonList';

export default SkeletonList;
