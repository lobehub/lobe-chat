import { Skeleton } from 'antd';
import { memo } from 'react';

const Loading = memo(() => {
  return <Skeleton active avatar paragraph={{ rows: 15 }} />;
});

export default Loading;
