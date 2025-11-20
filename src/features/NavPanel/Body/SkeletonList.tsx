'use client';

import { Skeleton } from 'antd';
import { useTheme } from 'antd-style';
import { memo, useCallback } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

export const SkeletonList = memo(() => {
  const expand = useGlobalStore(systemStatusSelectors.showSessionPanel);
  const theme = useTheme();

  const SkeletonItem = useCallback(() => {
    if (!expand)
      return (
        <Skeleton.Button
          active
          block
          size={'small'}
          style={{
            borderRadius: theme.borderRadius,
            height: 32,
            maxHeight: 32,
            minWidth: 32,
            opacity: 0.5,
          }}
        />
      );
    return (
      <Flexbox align={'center'} flex={1} gap={8} height={32} horizontal padding={4}>
        <Skeleton.Button
          size={'small'}
          style={{
            borderRadius: theme.borderRadius,
            height: 24,
            maxHeight: 24,
            maxWidth: 24,
            minWidth: 24,
          }}
        />
        <Skeleton.Button
          active
          block
          size={'small'}
          style={{
            borderRadius: theme.borderRadius,
            height: 16,
            maxHeight: 16,
            opacity: 0.5,
          }}
        />
      </Flexbox>
    );
  }, [theme, expand]);

  return (
    <Flexbox gap={2}>
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonItem key={i} />
      ))}
    </Flexbox>
  );
});

export default SkeletonList;
