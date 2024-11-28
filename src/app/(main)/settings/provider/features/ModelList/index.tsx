'use client';

import { ReactNode, Suspense, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useIsMobile } from '@/hooks/useIsMobile';
import { useAiInfraStore } from '@/store/aiInfra';

import DisabledModels from './DisabledModels';
import EnabledModelList from './EnabledModelList';
import ModelTitle from './ModelTitle';
import SearchResult from './SearchResult';
import SkeletonList from './SkeletonList';

const Content = memo<{ id: string }>(({ id }) => {
  const [isSearching, useFetchAiProviderModels] = useAiInfraStore((s) => [
    !!s.modelSearchKeyword,
    s.useFetchAiProviderModels,
  ]);
  const { isLoading } = useFetchAiProviderModels(id);

  if (isLoading) return <SkeletonList />;

  if (isSearching) return <SearchResult />;

  return (
    <Flexbox>
      <EnabledModelList />
      <DisabledModels />
    </Flexbox>
  );
});

interface ModelListProps {
  id: string;
  notFoundContent?: ReactNode;
  placeholder?: string;
  showAzureDeployName?: boolean;
}

const ModelList = memo<ModelListProps>(({ id }) => {
  const mobile = useIsMobile();

  return (
    <Flexbox gap={16} paddingInline={mobile ? 12 : 0}>
      <ModelTitle provider={id} />
      <Suspense fallback={<SkeletonList />}>
        <Content id={id} />
      </Suspense>
    </Flexbox>
  );
});

export default ModelList;
