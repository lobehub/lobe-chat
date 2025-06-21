import { Skeleton } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const Loading = memo(() => {
  return (
    <Flexbox padding={16}>
      <Skeleton active paragraph={{ rows: 8 }} title={false} />
    </Flexbox>
  );
});

export default Loading;
