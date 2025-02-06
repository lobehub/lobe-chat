'use client';

import { Skeleton } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import GridLoadingCard from './GridLoadingCard';

const ListLoading = memo(() => {
  return (
    <Flexbox gap={16}>
      <Flexbox justify={'center'} style={{ minHeight: 62 }}>
        <Skeleton.Button active style={{ minWidth: 150 }} />
      </Flexbox>
      <GridLoadingCard banner />
      <Flexbox justify={'center'} style={{ minHeight: 62 }}>
        <Skeleton.Button active style={{ minWidth: 150 }} />
      </Flexbox>
      <GridLoadingCard />
    </Flexbox>
  );
});

export const ListLoadingWithoutBanner = memo<{ banner?: boolean }>(() => {
  return (
    <Flexbox gap={16}>
      <Flexbox justify={'center'} style={{ minHeight: 62 }}>
        <Skeleton.Button active style={{ minWidth: 150 }} />
      </Flexbox>
      <GridLoadingCard count={16} />
    </Flexbox>
  );
});

export const ProviderListLoading = memo<{ banner?: boolean }>(() => {
  return (
    <Flexbox gap={16}>
      <Flexbox justify={'center'} style={{ minHeight: 62 }}>
        <Skeleton.Button active style={{ minWidth: 150 }} />
      </Flexbox>
      <GridLoadingCard count={6} rows={1} />
    </Flexbox>
  );
});

export const HomeLoading = memo<{ banner?: boolean }>(() => {
  return (
    <Flexbox gap={16}>
      <Flexbox justify={'center'} style={{ minHeight: 62 }}>
        <Skeleton.Button active style={{ minWidth: 150 }} />
      </Flexbox>
      <GridLoadingCard banner />
      <GridLoadingCard />
      <Flexbox justify={'center'} style={{ minHeight: 62 }}>
        <Skeleton.Button active style={{ minWidth: 150 }} />
      </Flexbox>
      <GridLoadingCard />
      <Flexbox justify={'center'} style={{ minHeight: 62 }}>
        <Skeleton.Button active style={{ minWidth: 150 }} />
      </Flexbox>
      <GridLoadingCard />
    </Flexbox>
  );
});

export default ListLoading;
