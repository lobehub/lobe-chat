'use client';

import { Skeleton } from 'antd';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

export const SkeletonItem = memo<Omit<FlexboxProps, 'children'>>(
  ({ padding = 4, height = 36, style, ...rest }) => {
    const theme = useTheme();

    return (
      <Flexbox align={'center'} flex={1} gap={8} height={height} horizontal padding={padding}>
        <Skeleton.Button
          size={'small'}
          style={{
            borderRadius: theme.borderRadius,
            height: 24,
            maxHeight: 24,
            maxWidth: 24,
            minWidth: 24,
            ...style,
          }}
          {...rest}
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
  },
);

export const SkeletonList = memo<{ rows?: number } & Omit<FlexboxProps, 'children'>>(
  ({ rows = 3, ...rest }) => {
    return (
      <Flexbox gap={2} {...rest}>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonItem key={i} />
        ))}
      </Flexbox>
    );
  },
);

export default SkeletonList;
