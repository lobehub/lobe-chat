'use client';

import { memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useQuery } from '@/hooks/useQuery';
import { useDiscoverStore } from '@/store/discover';

import { TocProvider } from '../features/useToc';
import { DetailProvider } from './features/DetailProvider';
import Details from './features/Details';
import Header from './features/Header';
import Loading from './loading';

const Client = memo<{ identifier: string; mobile?: boolean }>(({ identifier, mobile }) => {
  const { version } = useQuery() as { version?: string };
  const usePluginDetail = useDiscoverStore((s) => s.usePluginDetail);
  const usePluginList = useDiscoverStore((s) => s.usePluginList);
  const { data: detail, isLoading: detailLoading } = usePluginDetail({ identifier, version });
  const { data: relatedList, isLoading: relatedLoading } = usePluginList({
    category: detail?.category,
    page: 1,
    pageSize: 7,
  });

  const related = useMemo(
    () =>
      relatedList?.items
        .filter((item) => {
          return item.identifier !== detail?.identifier;
        })
        .slice(0, 6),
    [relatedList, detail],
  );

  if (detailLoading || relatedLoading || !detail) return <Loading />;

  return (
    <TocProvider>
      <DetailProvider config={{ ...detail, related }}>
        <Flexbox gap={16}>
          <Header mobile={mobile} />
          <Details mobile={mobile} />
        </Flexbox>
      </DetailProvider>
    </TocProvider>
  );
});

export default Client;
