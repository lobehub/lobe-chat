import { Skeleton } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const SkeletonList = memo(() => {
  return (
    <Flexbox gap={8} paddingInline={10} style={{ marginTop: 8 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton
          active
          avatar={false}
          key={i}
          paragraph={{ rows: 1, width: '100%' }}
          title={false}
        />
      ))}
    </Flexbox>
  );
});

export default SkeletonList;
