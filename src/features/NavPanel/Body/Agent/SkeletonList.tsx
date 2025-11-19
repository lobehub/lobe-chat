'use client';

import { Skeleton } from 'antd';
import { useTheme } from 'antd-style';
import { memo, useMemo } from 'react';

// Pre-generate array to avoid recreation on each render
const SKELETON_INDICES = Array.from({ length: 3 }, (_, i) => i);

export const SkeletonList = memo(() => {
  const theme = useTheme();

  // Memoize style object to prevent recreation
  const skeletonStyle = useMemo(
    () => ({
      borderRadius: theme.borderRadius,
      height: 32,
      minWidth: 32,
      opacity: 0.75,
    }),
    [theme.borderRadius],
  );

  return (
    <>
      {SKELETON_INDICES.map((i) => (
        <Skeleton.Button active block key={i} size={'small'} style={skeletonStyle} />
      ))}
    </>
  );
});

export default SkeletonList;
