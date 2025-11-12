'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useQuery } from '@/hooks/useQuery';
import { useDiscoverStore } from '@/store/discover';
import { DiscoverTab, ProviderQueryParams } from '@/types/discover';

import Pagination from '../features/Pagination';
import List from './features/List';
import Loading from './loading';

const Client = memo<{ mobile?: boolean }>(() => {
  const { q, page, sort, order } = useQuery() as ProviderQueryParams;
  const useProviderList = useDiscoverStore((s) => s.useProviderList);
  const { data, isLoading } = useProviderList({
    order,
    page,
    pageSize: 21,
    q,
    sort,
  });

  if (isLoading || !data) return <Loading />;

  const { items, currentPage, pageSize, totalCount } = data;

  return (
    <Flexbox gap={32} width={'100%'}>
      <List data={items} />
      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        tab={DiscoverTab.Providers}
        total={totalCount}
      />
    </Flexbox>
  );
});

const DesktopProviderPage = memo<{ mobile?: boolean }>(() => {
  return <Client mobile={false} />;
});

const MobileProviderPage = memo<{ mobile?: boolean }>(() => {
  return <Client mobile={true} />;
});

export { DesktopProviderPage, MobileProviderPage };