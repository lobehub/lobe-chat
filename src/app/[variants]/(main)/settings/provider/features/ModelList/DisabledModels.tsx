import { ActionIcon, Button, Text, Tooltip } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { ArrowDownAZ, ChevronDown } from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useAiInfraStore } from '@/store/aiInfra';
import { aiModelSelectors } from '@/store/aiInfra/selectors';

import ModelItem from './ModelItem';

interface DisabledModelsProps {
  activeTab: string;
}

// Sort type enumeration
enum SortType {
  Alphabetical = 'alphabetical',
  Default = 'default',
}

const DisabledModels = memo<DisabledModelsProps>(({ activeTab }) => {
  const { t } = useTranslation('modelProvider');

  const [showMore, setShowMore] = useState(false);
  const [sortType, setSortType] = useState<SortType>(
    () => (localStorage.getItem('disabledModelsSortType') as SortType) || SortType.Default,
  );

  useEffect(() => {
    localStorage.setItem('disabledModelsSortType', sortType);
  }, [sortType]);

  const disabledModels = useAiInfraStore(aiModelSelectors.disabledAiProviderModelList, isEqual);

  // Filter models based on active tab
  const filteredDisabledModels = useMemo(() => {
    if (activeTab === 'all') return disabledModels;
    return disabledModels.filter((model) => model.type === activeTab);
  }, [disabledModels, activeTab]);

  // Sort models based on sort type
  const sortedDisabledModels = useMemo(() => {
    if (sortType === SortType.Default) {
      return [...filteredDisabledModels];
    } else {
      return [...filteredDisabledModels].sort((a, b) => {
        const cmpDisplay = (a.displayName || a.id).localeCompare(b.displayName || b.id);
        if (cmpDisplay !== 0) return cmpDisplay;
        return a.id.localeCompare(b.id);
      });
    }
  }, [filteredDisabledModels, sortType]);

  const displayModels = showMore ? sortedDisabledModels : sortedDisabledModels.slice(0, 10);

  const toggleSortType = () => {
    setSortType(sortType === SortType.Default ? SortType.Alphabetical : SortType.Default);
  };

  const getSortTooltip = () => {
    return sortType === SortType.Default
      ? t('providerModels.list.disabledActions.sortAlphabetical')
      : t('providerModels.list.disabledActions.sortDefault');
  };

  return (
    filteredDisabledModels.length > 0 && (
      <Flexbox>
        <Flexbox align="center" horizontal justify="space-between">
          <Text style={{ fontSize: 12, marginTop: 8 }} type={'secondary'}>
            {t('providerModels.list.disabled')}
          </Text>
          {filteredDisabledModels.length > 1 && (
            <Tooltip title={getSortTooltip()}>
              <ActionIcon
                active={sortType === SortType.Alphabetical}
                icon={ArrowDownAZ}
                onClick={toggleSortType}
                size={'small'}
              />
            </Tooltip>
          )}
        </Flexbox>
        {displayModels.map((item) => (
          <ModelItem {...item} key={item.id} />
        ))}
        {!showMore && sortedDisabledModels.length > 10 && (
          <Button
            block
            icon={ChevronDown}
            onClick={() => {
              setShowMore(true);
            }}
            size={'small'}
          >
            {t('providerModels.list.disabledActions.showMore')}
          </Button>
        )}
      </Flexbox>
    )
  );
});

export default DisabledModels;
