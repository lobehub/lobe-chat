'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useLoaderData } from 'react-router-dom';

import type { SlugParams } from '@/app/[variants]/loaders/routeParams';
import { useDiscoverStore } from '@/store/discover';

import NotFound from '../components/NotFound';
import { DetailProvider } from './features/DetailProvider';
import Details from './features/Details';
import Header from './features/Header';
import Loading from './loading';

interface ModelDetailPageProps {
  mobile?: boolean;
}

const ModelDetailPage = memo<ModelDetailPageProps>(({ mobile }) => {
  const { slug } = useLoaderData() as SlugParams;
  const identifier = decodeURIComponent(slug);

  const useModelDetail = useDiscoverStore((s) => s.useModelDetail);
  const { data, isLoading } = useModelDetail({ identifier });

  if (isLoading) return <Loading />;
  if (!data) return <NotFound />;

  return (
    <DetailProvider config={data}>
      <Flexbox gap={16}>
        <Header mobile={mobile} />
        <Details mobile={mobile} />
      </Flexbox>
    </DetailProvider>
  );
});

const DesktopModelPage = memo<{ mobile?: boolean }>(() => {
  return <ModelDetailPage mobile={false} />;
});

const MobileModelPage = memo<{ mobile?: boolean }>(() => {
  return <ModelDetailPage mobile={true} />;
});

export { DesktopModelPage, MobileModelPage };
