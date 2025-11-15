'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useLoaderData } from 'react-router-dom';

import type { SlugParams } from '@/app/[variants]/loaders/routeParams';
import { useQuery } from '@/hooks/useQuery';
import { useDiscoverStore } from '@/store/discover';
import { AssistantMarketSource, DiscoverTab } from '@/types/discover';

import NotFound from '../components/NotFound';
import Breadcrumb from '../features/Breadcrumb';
import { TocProvider } from '../features/Toc/useToc';
import { DetailProvider } from './features/DetailProvider';
import Details from './features/Details';
import Header from './features/Header';
import StatusPage from './features/StatusPage';
import Loading from './loading';

interface AssistantDetailPageProps {
  mobile?: boolean;
}

const AssistantDetailPage = memo<AssistantDetailPageProps>(({ mobile }) => {
  const { slug } = useLoaderData() as SlugParams;
  const identifier = decodeURIComponent(slug);
  const { version, source } = useQuery() as { source?: AssistantMarketSource; version?: string };

  const useAssistantDetail = useDiscoverStore((s) => s.useAssistantDetail);
  const { data, isLoading } = useAssistantDetail({ identifier, source, version });

  if (isLoading) return <Loading />;
  if (!data) return <NotFound />;

  // 检查助手状态
  const status = (data as any)?.status;
  if (status === 'unpublished' || status === 'archived' || status === 'deprecated') {
    return <StatusPage status={status} />;
  }

  return (
    <TocProvider>
      <DetailProvider config={data}>
        {!mobile && <Breadcrumb identifier={identifier} tab={DiscoverTab.Assistants} />}
        <Flexbox gap={16}>
          <Header mobile={mobile} />
          <Details mobile={mobile} />
        </Flexbox>
      </DetailProvider>
    </TocProvider>
  );
});

const DesktopDiscoverAssistantDetailPage = memo<{ mobile?: boolean }>(() => {
  return <AssistantDetailPage mobile={false} />;
});

const MobileDiscoverAssistantDetailPage = memo<{ mobile?: boolean }>(() => {
  return <AssistantDetailPage mobile={true} />;
});

export { DesktopDiscoverAssistantDetailPage, MobileDiscoverAssistantDetailPage };
