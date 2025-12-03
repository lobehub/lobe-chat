'use client';

import { Skeleton } from 'antd';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

export const GroupSkeleton = memo<
  { height?: number; rows?: number; width?: number } & Omit<FlexboxProps, 'children'>
>(({ rows = 12, width, height, ...rest }) => {
  const theme = useTheme();
  return (
    <Flexbox gap={16} horizontal {...rest}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton.Button
          active
          key={i}
          size={'large'}
          style={{
            borderRadius: theme.borderRadiusLG,
            height: height,
            maxHeight: height,
            maxWidth: width,
            minWidth: width,
            opacity: 0.5,
          }}
        />
      ))}
    </Flexbox>
  );
});

export default GroupSkeleton;
