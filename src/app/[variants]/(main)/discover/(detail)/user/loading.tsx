'use client';

import { Skeleton } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const Loading = memo(() => {
  return (
    <Flexbox gap={24} width={'100%'}>
      {/* User Header Skeleton */}
      <Flexbox gap={16}>
        <Flexbox align={'flex-start'} gap={16} horizontal>
          <Skeleton.Avatar active size={80} />
          <Flexbox flex={1} gap={8}>
            <Skeleton.Input active size="large" style={{ width: 200 }} />
            <Skeleton.Input active size="small" style={{ width: 120 }} />
            <Skeleton active paragraph={{ rows: 1 }} title={false} />
          </Flexbox>
        </Flexbox>
      </Flexbox>

      {/* Agent List Skeleton */}
      <Flexbox gap={16}>
        <Skeleton.Input active style={{ width: 150 }} />
        <Flexbox gap={16} horizontal wrap="wrap">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton.Node
              active
              key={i}
              style={{
                borderRadius: 8,
                height: 200,
                width: 'calc(33.33% - 12px)',
              }}
            />
          ))}
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
});

export default Loading;
