import { Skeleton } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const SkeletonLoading = memo(() => (
  <Flexbox padding={12}>
    <Skeleton active paragraph={{ width: '70%' }} title={false} />
    <Skeleton active paragraph={{ width: '40%' }} title={false} />
    <Skeleton active paragraph={{ width: '80%' }} title={false} />
    <Skeleton active paragraph={{ width: '30%' }} title={false} />
    <Skeleton active paragraph={{ width: '50%' }} title={false} />
    <Skeleton active paragraph={{ width: '70%' }} title={false} />
  </Flexbox>
));

export default SkeletonLoading;
