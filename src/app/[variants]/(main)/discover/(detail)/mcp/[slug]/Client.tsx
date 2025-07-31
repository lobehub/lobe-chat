'use client';

import { notFound } from 'next/navigation';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { withSuspense } from '@/components/withSuspense';
import { DetailProvider } from '@/features/MCPPluginDetail/DetailProvider';
import Header from '@/features/MCPPluginDetail/Header';
import { useFetchInstalledPlugins } from '@/hooks/useFetchInstalledPlugins';
import { useQuery } from '@/hooks/useQuery';
import { useDiscoverStore } from '@/store/discover';
import { DiscoverTab } from '@/types/discover';

import Breadcrumb from '../../features/Breadcrumb';
import { TocProvider } from '../../features/Toc/useToc';
import Details from './features/Details';
import Loading from './loading';

const Client = memo<{ identifier: string; mobile?: boolean }>(({ identifier, mobile }) => {
  const { version } = useQuery() as { version?: string };
  const useMcpDetail = useDiscoverStore((s) => s.useFetchMcpDetail);
  const { data, isLoading } = useMcpDetail({ identifier, version });

  useFetchInstalledPlugins();

  if (isLoading) return <Loading />;
  if (!data) return notFound();

  return (
    <TocProvider>
      <DetailProvider config={data}>
        {!mobile && <Breadcrumb identifier={identifier} tab={DiscoverTab.Mcp} />}
        <Flexbox gap={16}>
          <Header mobile={mobile} />
          <Details mobile={mobile} />
        </Flexbox>
      </DetailProvider>
    </TocProvider>
  );
});

export default withSuspense(Client);
