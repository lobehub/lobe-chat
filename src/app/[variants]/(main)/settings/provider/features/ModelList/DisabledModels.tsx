import { ActionIcon, Button, Dropdown, Icon, Text } from '@lobehub/ui';
import type { ItemType } from 'antd/es/menu/interface';
import isEqual from 'fast-deep-equal';
import { ArrowDownUpIcon, ChevronDown, LucideCheck } from 'lucide-react';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useAiInfraStore } from '@/store/aiInfra';
import { aiModelSelectors } from '@/store/aiInfra/selectors';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import ModelItem from './ModelItem';

interface DisabledModelsProps {
  activeTab: string;
}

// Sort type enumeration
enum SortType {
  Alphabetical = 'alphabetical',
  AlphabeticalDesc = 'alphabeticalDesc',
  Default = 'default',
  ReleasedAt = 'releasedAt',
  ReleasedAtDesc = 'releasedAtDesc',
}

const DisabledModels = memo<DisabledModelsProps>(({ activeTab }) => {
  const { t } = useTranslation('modelProvider');

  const [showMore, setShowMore] = useState(false);
  const [sortType, setSortType] = useState<SortType>(
    () =>
      (systemStatusSelectors.disabledModelsSortType(useGlobalStore.getState()) as SortType) ||
      SortType.Default,
  );

  useEffect(() => {
    useGlobalStore.getState().updateSystemStatus({
      disabledModelsSortType: sortType,
    });
  }, [sortType]);

  const disabledModels = useAiInfraStore(aiModelSelectors.disabledAiProviderModelList, isEqual);

  // Filter models based on active tab
  const filteredDisabledModels = useMemo(() => {
    if (activeTab === 'all') return disabledModels;
    return disabledModels.filter((model) => model.type === activeTab);
  }, [disabledModels, activeTab]);

  // Sort models based on sort type
  const sortedDisabledModels = useMemo(() => {
    const models = [...filteredDisabledModels];
    switch (sortType) {
      case SortType.Alphabetical: {
        return models.sort((a, b) => {
          const cmpDisplay = (a.displayName || a.id).localeCompare(b.displayName || b.id);
          if (cmpDisplay !== 0) return cmpDisplay;
          return a.id.localeCompare(b.id);
        });
      }
      case SortType.AlphabeticalDesc: {
        return models.sort((a, b) => {
          const cmpDisplay = (b.displayName || b.id).localeCompare(a.displayName || a.id);
          if (cmpDisplay !== 0) return cmpDisplay;
          return b.id.localeCompare(a.id);
        });
      }
      case SortType.ReleasedAt: {
        return models.sort((a, b) => {
          const aHasDate = !!a.releasedAt;
          const bHasDate = !!b.releasedAt;

          if (aHasDate && !bHasDate) return -1;
          if (!aHasDate && bHasDate) return 1;
          if (!aHasDate && !bHasDate) return 0;

          return a.releasedAt!.localeCompare(b.releasedAt!);
        });
      }
      case SortType.ReleasedAtDesc: {
        return models.sort((a, b) => {
          const aHasDate = !!a.releasedAt;
          const bHasDate = !!b.releasedAt;

          if (aHasDate && !bHasDate) return -1;
          if (!aHasDate && bHasDate) return 1;
          if (!aHasDate && !bHasDate) return 0;

          return b.releasedAt!.localeCompare(a.releasedAt!);
        });
      }
      case SortType.Default: {
        return models;
      }
      default: {
        return models;
      }
    }
  }, [filteredDisabledModels, sortType]);

  const displayModels = showMore ? sortedDisabledModels : sortedDisabledModels.slice(0, 10);

  return (
    filteredDisabledModels.length > 0 && (
      <Flexbox>
        <Flexbox align="center" horizontal justify="space-between">
          <Text style={{ fontSize: 12, marginTop: 8 }} type={'secondary'}>
            {t('providerModels.list.disabled')}
          </Text>
          {filteredDisabledModels.length > 1 && (
            <Dropdown
              menu={{
                items: [
                  {
                    icon: sortType === SortType.Default ? <Icon icon={LucideCheck} /> : <div />,
                    key: 'default',
                    label: t('providerModels.list.disabledActions.sortDefault'),
                    onClick: () => setSortType(SortType.Default),
                  },
                  {
                    type: 'divider',
                  },
                  {
                    icon:
                      sortType === SortType.Alphabetical ? <Icon icon={LucideCheck} /> : <div />,
                    key: 'alphabetical',
                    label: t('providerModels.list.disabledActions.sortAlphabetical'),
                    onClick: () => setSortType(SortType.Alphabetical),
                  },
                  {
                    icon:
                      sortType === SortType.AlphabeticalDesc ? (
                        <Icon icon={LucideCheck} />
                      ) : (
                        <div />
                      ),
                    key: 'alphabeticalDesc',
                    label: t('providerModels.list.disabledActions.sortAlphabeticalDesc'),
                    onClick: () => setSortType(SortType.AlphabeticalDesc),
                  },
                  {
                    type: 'divider',
                  },
                  {
                    icon: sortType === SortType.ReleasedAt ? <Icon icon={LucideCheck} /> : <div />,
                    key: 'releasedAt',
                    label: t('providerModels.list.disabledActions.sortReleasedAt'),
                    onClick: () => setSortType(SortType.ReleasedAt),
                  },
                  {
                    icon:
                      sortType === SortType.ReleasedAtDesc ? <Icon icon={LucideCheck} /> : <div />,
                    key: 'releasedAtDesc',
                    label: t('providerModels.list.disabledActions.sortReleasedAtDesc'),
                    onClick: () => setSortType(SortType.ReleasedAtDesc),
                  },
                ] as ItemType[],
              }}
              trigger={['click']}
            >
              <ActionIcon
                icon={ArrowDownUpIcon}
                size={'small'}
                title={t('providerModels.list.disabledActions.sort')}
              />
            </Dropdown>
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
