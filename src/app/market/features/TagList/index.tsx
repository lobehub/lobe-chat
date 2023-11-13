import { Skeleton } from 'antd';
import { Suspense, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Inner from '@/app/market/features/TagList/Inner';

const TagList = memo(() => {
  return (
    <Flexbox gap={6} horizontal style={{ flexWrap: 'wrap' }}>
      <Suspense
        fallback={Array.from({ length: 5 })
          .fill('')
          .map((_, index) => (
            <Skeleton.Button key={index} shape={'round'} size={'small'} />
          ))}
      >
        <Inner />
      </Suspense>
    </Flexbox>
  );
});

export default TagList;
