'use client';

import { Skeleton } from 'antd';
import { useTheme } from 'antd-style';
import { memo } from 'react';

export const SkeletonList = memo(() => {
  const theme = useTheme();
  return Array.from({ length: 3 }).map((_, i) => (
    <Skeleton.Button
      active
      block
      key={i}
      size={'small'}
      style={{
        borderRadius: theme.borderRadius,
        height: 32,
        minWidth: 32,
        opacity: 0.75,
      }}
    />
  ));
});

export default SkeletonList;
