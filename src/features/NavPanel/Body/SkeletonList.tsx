'use client';

import { Skeleton } from 'antd';
import { useTheme } from 'antd-style';
import { memo, useCallback } from 'react';
import { Flexbox } from 'react-layout-kit';

export const SkeletonList = memo(() => {
  const theme = useTheme();

  const SkeletonItem = useCallback(() => {
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
        <Flexbox flex={1} height={16}>
          <Skeleton.Button
            active
            block
            size={'small'}
            style={{
              borderRadius: theme.borderRadius,
              height: 16,
              margin: 0,
              maxHeight: 16,
              opacity: 0.5,
              padding: 0,
            }}
          />
        </Flexbox>
      </Flexbox>
    );
  }, [theme.borderRadius]);

  return (
    <Flexbox gap={2}>
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonItem key={i} />
      ))}
    </Flexbox>
  );
});

export default SkeletonList;
