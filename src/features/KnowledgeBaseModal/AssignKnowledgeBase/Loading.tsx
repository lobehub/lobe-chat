import { Skeleton } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const Loading = memo(() => {
  return (
    <Flexbox>
      <Skeleton paragraph={{ rows: 8 }} title={false} />
    </Flexbox>
  );
});

export default Loading;
