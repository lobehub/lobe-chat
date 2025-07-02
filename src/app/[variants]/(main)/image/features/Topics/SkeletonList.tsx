'use client';

import { Skeleton } from 'antd';
import { useTheme } from 'antd-style';
import { Plus } from 'lucide-react';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

const borderRadius = 6;
const size = 50;

const SkeletonList = memo(() => {
  const theme = useTheme();

  return (
    <Flexbox align="center" gap={6}>
      <Center
        style={{
          width: size,
          height: size,
          background: theme.colorFillSecondary,
          border: `1px solid ${theme.colorBorder}`,
          borderRadius,
        }}
      >
        <Plus size={12} />
      </Center>

      {/* Topic items skeleton */}
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index}>
          <Skeleton.Avatar
            active
            size={size}
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
