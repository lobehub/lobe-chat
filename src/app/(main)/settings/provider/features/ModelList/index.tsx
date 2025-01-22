'use client';

import { Suspense, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useIsMobile } from '@/hooks/useIsMobile';
import { aiModelSelectors, useAiInfraStore } from '@/store/aiInfra';

import DisabledModels from './DisabledModels';
import EmptyModels from './EmptyModels';
import EnabledModelList from './EnabledModelList';
import ModelTitle from './ModelTitle';
import SearchResult from './SearchResult';
import SkeletonList from './SkeletonList';

const Content = memo<{ id: string }>(({ id }) => {
  const [isSearching, isEmpty, useFetchAiProviderModels] = useAiInfraStore((s) => [
    !!s.modelSearchKeyword,
    aiModelSelectors.isEmptyAiProviderModelList(s),
    s.useFetchAiProviderModels,
  ]);

  const { isLoading } = useFetchAiProviderModels(id);

  if (isLoading) return <SkeletonList />;

  if (isSearching) return <SearchResult />;

  return isEmpty ? (
    <EmptyModels provider={id} />
  ) : (
    <Flexbox>
      <EnabledModelList />
      <DisabledModels />
    </Flexbox>
  );
});

interface ModelListProps {
  id: string;
  showAddNewModel?: boolean;
  showModelFetcher?: boolean;
}

const ModelList = memo<ModelListProps>(({ id, showModelFetcher, showAddNewModel }) => {
  const mobile = useIsMobile();

  return (
    <Flexbox gap={16} paddingInline={mobile ? 12 : 0}>
      <ModelTitle
        provider={id}
        showAddNewModel={showAddNewModel}
        showModelFetcher={showModelFetcher}
      />
      <Suspense fallback={<SkeletonList />}>
        <Content id={id} />
      </Suspense>
    </Flexbox>
  );
});

export default ModelList;
