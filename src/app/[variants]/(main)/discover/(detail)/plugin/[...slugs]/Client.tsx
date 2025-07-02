'use client';

import { notFound } from 'next/navigation';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Breadcrumb from '@/app/[variants]/(main)/discover/(detail)/features/Breadcrumb';
import { withSuspense } from '@/components/withSuspense';
import { useDiscoverStore } from '@/store/discover';
import { DiscoverTab } from '@/types/discover';

import { DetailProvider } from './features/DetailProvider';
import Details from './features/Details';
import Header from './features/Header';
import Loading from './loading';

interface ClientProps {
  identifier: string;
  mobile?: boolean;
}

const Client = memo<ClientProps>(({ identifier, mobile }) => {
  const usePluginDetail = useDiscoverStore((s) => s.usePluginDetail);
  const { data, isLoading } = usePluginDetail({ identifier, withManifest: true });

  if (isLoading) return <Loading />;
  if (!data) return notFound();

  return (
    <DetailProvider config={data}>
      {!mobile && <Breadcrumb identifier={identifier} tab={DiscoverTab.Plugins} />}
      <Flexbox gap={16}>
        <Header mobile={mobile} />
        <Details mobile={mobile} />
      </Flexbox>
    </DetailProvider>
  );
});

export default withSuspense(Client);
