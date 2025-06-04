'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useQuery } from '@/hooks/useQuery';
import { useDiscoverStore } from '@/store/discover';

import Pagination from '../features/Pagination';
import List from './features/List';
import Loading from './loading';

const Client = memo<{ mobile?: boolean }>(() => {
  const { q, page, category, sort } = useQuery() as {
    category?: string;
    page?: number;
    q?: string;
    sort?: 'installCount' | 'createdAt' | 'updatedAt' | 'ratingAverage' | 'ratingCount';
  };
  const usePluginList = useDiscoverStore((s) => s.usePluginList);
  const { data, isLoading } = usePluginList({
    category,
    page,
    pageSize: 21,
    q,
    sort,
  });

  if (!data || isLoading) return <Loading />;

  const { items, currentPage, pageSize, totalCount } = data;

  return (
    <Flexbox gap={32} width={'100%'}>
      <List data={items} />
      <Pagination currentPage={currentPage} pageSize={pageSize} total={totalCount} />
    </Flexbox>
  );
});

export default Client;
