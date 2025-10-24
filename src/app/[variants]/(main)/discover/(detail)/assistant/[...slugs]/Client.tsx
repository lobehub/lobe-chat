'use client';

import { notFound } from 'next/navigation';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { withSuspense } from '@/components/withSuspense';
import { useQuery } from '@/hooks/useQuery';
import { useDiscoverStore } from '@/store/discover';
import { AssistantMarketSource } from '@/types/discover';

import { TocProvider } from '../../features/Toc/useToc';
import { DetailProvider } from './features/DetailProvider';
import Details from './features/Details';
import Header from './features/Header';
import StatusPage from './features/StatusPage';
import Loading from './loading';

interface ClientProps {
  identifier: string;
  mobile?: boolean;
}

const Client = memo<ClientProps>(({ identifier, mobile }) => {
  const { version, source } = useQuery() as { source?: AssistantMarketSource; version?: string };
  const marketSource = source as AssistantMarketSource | undefined;
  const useAssistantDetail = useDiscoverStore((s) => s.useAssistantDetail);
  const { data, isLoading } = useAssistantDetail({ identifier, source: marketSource, version });

  if (isLoading) return <Loading />;
  if (!data) return notFound();

  // 检查助手状态
  const status = (data as any)?.status;
  if (status === 'unpublished' || status === 'archived' || status === 'deprecated') {
    return <StatusPage status={status} />;
  }

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
