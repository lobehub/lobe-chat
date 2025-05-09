'use client';

import { useTheme } from 'antd-style';
import { Suspense, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useIsMobile } from '@/hooks/useIsMobile';
import { aiModelSelectors, useAiInfraStore } from '@/store/aiInfra';

import DisabledModels from './DisabledModels';
import EmptyModels from './EmptyModels';
import EnabledModelList from './EnabledModelList';
import ModelTitle from './ModelTitle';
import { ProviderSettingsContext, ProviderSettingsContextValue } from './ProviderSettingsContext';
import SearchResult from './SearchResult';
import SkeletonList from './SkeletonList';

interface ContentProps {
  id: string;
}

const Content = memo<ContentProps>(({ id }) => {
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

interface ModelListProps extends ProviderSettingsContextValue {
  id: string;
}

const ModelList = memo<ModelListProps>(
  ({ id, showModelFetcher, sdkType, showAddNewModel, showDeployName, modelEditable = true }) => {
    const mobile = useIsMobile();
    const theme = useTheme();

    return (
      <ProviderSettingsContext
        value={{ modelEditable, sdkType, showAddNewModel, showDeployName, showModelFetcher }}
      >
        <Flexbox
          gap={16}
          paddingInline={mobile ? 12 : 0}
          style={{
            background: mobile ? theme.colorBgContainer : undefined,
            paddingBottom: 16,
            paddingTop: 8,
          }}
        >
          <ModelTitle
            provider={id}
            showAddNewModel={showAddNewModel}
            showModelFetcher={showModelFetcher}
          />
          <Suspense fallback={<SkeletonList />}>
            <Content id={id} />
          </Suspense>
        </Flexbox>
      </ProviderSettingsContext>
    );
  },
);

export default ModelList;
