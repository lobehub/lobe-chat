'use client';

import { Skeleton } from 'antd';
import { Center } from 'react-layout-kit';

import SkeletonLoading from '@/components/SkeletonLoading';

export default () => {
  return (
    <>
      <Center height={180}>
        <Skeleton.Avatar shape={'circle'} size={88} />
      </Center>
      <SkeletonLoading paragraph={{ rows: 8 }} title={false} />
    </>
  );
};
