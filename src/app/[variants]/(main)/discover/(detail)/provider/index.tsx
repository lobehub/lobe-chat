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

interface ProviderDetailPageProps {
  mobile?: boolean;
}

const ProviderDetailPage = memo<ProviderDetailPageProps>(({ mobile }) => {
  const { slug } = useLoaderData() as SlugParams;
  const identifier = decodeURIComponent(slug);

  const useProviderDetail = useDiscoverStore((s) => s.useProviderDetail);
  const { data, isLoading } = useProviderDetail({ identifier, withReadme: true });

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

export const MobileProviderPage = memo<{ mobile?: boolean }>(() => {
  return <ProviderDetailPage mobile={true} />;
});

export default ProviderDetailPage;
