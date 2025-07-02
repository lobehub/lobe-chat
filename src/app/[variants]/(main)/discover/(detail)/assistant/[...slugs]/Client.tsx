'use client';

import { notFound } from 'next/navigation';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { withSuspense } from '@/components/withSuspense';
import { useDiscoverStore } from '@/store/discover';

import { TocProvider } from '../../features/Toc/useToc';
import { DetailProvider } from './features/DetailProvider';
import Details from './features/Details';
import Header from './features/Header';
import Loading from './loading';

interface ClientProps {
  identifier: string;
  mobile?: boolean;
}

const Client = memo<ClientProps>(({ identifier, mobile }) => {
  const useAssistantDetail = useDiscoverStore((s) => s.useAssistantDetail);
  const { data, isLoading } = useAssistantDetail({ identifier });

  if (isLoading) return <Loading />;
  if (!data) return notFound();

  return (
    <TocProvider>
      <DetailProvider config={data}>
        <Flexbox gap={16}>
          <Header mobile={mobile} />
          <Details mobile={mobile} />
        </Flexbox>
      </DetailProvider>
    </TocProvider>
  );
});

export default withSuspense(Client);
