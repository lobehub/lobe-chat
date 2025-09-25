import { Text } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { Virtuoso } from 'react-virtuoso';

import { useAiInfraStore } from '@/store/aiInfra';
import { aiModelSelectors } from '@/store/aiInfra/selectors';

import ModelItem from './ModelItem';
import { useModelListVirtualConfig } from './useModelListVirtualConfig';

interface DisabledModelsProps {
  activeTab: string;
}

const DisabledModels = memo<DisabledModelsProps>(({ activeTab }) => {
  const { t } = useTranslation('modelProvider');

  const disabledModels = useAiInfraStore(aiModelSelectors.disabledAiProviderModelList, isEqual);

  // Filter models based on active tab
  const filteredDisabledModels = useMemo(() => {
    if (activeTab === 'all') return disabledModels;
    return disabledModels.filter((model) => model.type === activeTab);
  }, [disabledModels, activeTab]);

  const filteredLength = filteredDisabledModels.length;
  const { increaseViewportBy, itemGap, itemSize, overscan, virtualListHeight } =
    useModelListVirtualConfig(filteredLength);

  const renderVirtualItem = useCallback(
    (_index: number, item: (typeof filteredDisabledModels)[number]) => (
      <div style={{ paddingBottom: itemGap }}>
        <ModelItem {...item} />
      </div>
    ),
    [itemGap],
  );

  return (
    filteredDisabledModels.length > 0 && (
      <Flexbox>
        <Text style={{ fontSize: 12, marginTop: 8 }} type={'secondary'}>
          {t('providerModels.list.disabled')}
        </Text>
        <div style={{ height: virtualListHeight }}>
          <Virtuoso
            computeItemKey={(_, item) => item.id}
            data={filteredDisabledModels}
            defaultItemHeight={itemSize}
            fixedItemHeight={itemSize}
            increaseViewportBy={increaseViewportBy}
            itemContent={renderVirtualItem}
            overscan={overscan}
          />
        </div>
      </Flexbox>
    )
  );
});

export default DisabledModels;
