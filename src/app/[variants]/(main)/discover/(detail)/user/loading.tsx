'use client';

import { Skeleton } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ListLoading from '@/app/[variants]/(main)/discover/components/ListLoading';

import Banner from './features/Header/Banner';

const Loading = memo(() => {
  const theme = useTheme();
  return (
    <Flexbox gap={24} width={'100%'}>
      {/* User Header Skeleton */}
      <Banner />
      <Flexbox gap={16}>
        <Skeleton.Avatar
          shape={'square'}
          size={64}
          style={{ boxShadow: `0 0 0 4px ${theme.colorBgContainer}`, flexShrink: 0 }}
        />
        <Skeleton paragraph={{ rows: 1 }} />
      </Flexbox>

      {/* Agent List Skeleton */}
      <ListLoading length={4} rows={4} />
    </Flexbox>
  );
});

export default Loading;
