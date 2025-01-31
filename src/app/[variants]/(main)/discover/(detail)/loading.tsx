'use client';

import { Skeleton } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useServerConfigStore } from '@/store/serverConfig';

import DetailLayout from './features/DetailLayout';

const Loading = memo(() => {
  const mobile = useServerConfigStore((s) => s.isMobile);
  return (
    <DetailLayout
      actions={<Skeleton.Button block />}
      header={
        <Flexbox gap={12} width={'100%'}>
          <Flexbox align={'center'} gap={8} horizontal justify={'space-between'} width={'100%'}>
            <Flexbox align={'center'} gap={12} horizontal justify={'flex-start'}>
              <Skeleton.Avatar active shape={'circle'} size={48} />
              <Skeleton.Button active />
            </Flexbox>
            <Flexbox align={'center'} gap={4} horizontal justify={'flex-end'}>
              <Skeleton.Button active />
            </Flexbox>
          </Flexbox>
          <Skeleton active title={false} />
        </Flexbox>
      }
      mobile={mobile}
      sidebar={<Skeleton paragraph={{ rows: 5 }} />}
    >
      <Skeleton paragraph={{ rows: 16 }} title={false} />
    </DetailLayout>
  );
});

export default Loading;
