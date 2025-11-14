'use client';

import { ActionIcon, Dropdown, Icon, ScrollShadow, Text } from '@lobehub/ui';
import type { ItemType } from 'antd/es/menu/interface';
import isEqual from 'fast-deep-equal';
import { ArrowDownUpIcon, LucideCheck } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { aiProviderSelectors } from '@/store/aiInfra';
import { useAiInfraStore } from '@/store/aiInfra/store';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import All from './All';
import ProviderItem from './Item';
import SortProviderModal from './SortProviderModal';

// Sort type enumeration
enum SortType {
  Alphabetical = 'alphabetical',
  AlphabeticalDesc = 'alphabeticalDesc',
  Default = 'default',
}

const ProviderList = (props: {
  mobile?: boolean;
  onProviderSelect: (providerKey: string) => void;
}) => {
  const { onProviderSelect, mobile } = props;
  const { t } = useTranslation('modelProvider');
  const [open, setOpen] = useState(false);

  const [sortType, updateSystemStatus] = useGlobalStore((s) => [
    systemStatusSelectors.disabledModelProvidersSortType(s),
    s.updateSystemStatus,
  ]);

  const updateSortType = useCallback(
    (newSortType: SortType) => {
      updateSystemStatus({ disabledModelProvidersSortType: newSortType });
    },
    [updateSystemStatus],
  );

  const enabledModelProviderList = useAiInfraStore(
    aiProviderSelectors.enabledAiProviderList,
    isEqual,
  );

  const disabledModelProviderList = useAiInfraStore(
    aiProviderSelectors.disabledAiProviderList,
    isEqual,
  );

  // Sort model providers based on sort type
  const sortedDisabledProviders = useMemo(() => {
    const providers = [...disabledModelProviderList];
    switch (sortType) {
      case SortType.Alphabetical: {
        return providers.sort((a, b) => {
          const cmpDisplay = (a.name || a.id).localeCompare(b.name || b.id);
          if (cmpDisplay !== 0) return cmpDisplay;
          return a.id.localeCompare(b.id);
        });
      }
      case SortType.AlphabeticalDesc: {
        return providers.sort((a, b) => {
          const cmpDisplay = (b.name || a.id).localeCompare(a.name || b.id);
          if (cmpDisplay !== 0) return cmpDisplay;
          return b.id.localeCompare(a.id);
        });
      }
      case SortType.Default: {
        return providers;
      }
      default: {
        return providers;
      }
    }
  }, [disabledModelProviderList, sortType]);

  return (
    <ScrollShadow gap={4} height={'100%'} paddingInline={12} size={4} style={{ paddingBottom: 32 }}>
      {!mobile && <All onClick={onProviderSelect} />}
      <Flexbox
        align={'center'}
        horizontal
        justify={'space-between'}
        style={{ fontSize: 12, marginTop: 8 }}
      >
        <Text style={{ fontSize: 12 }} type={'secondary'}>
          {t('menu.list.enabled')}
        </Text>
        <ActionIcon
          icon={ArrowDownUpIcon}
          onClick={() => {
            setOpen(true);
          }}
          size={'small'}
          title={t('menu.sort')}
        />
        {open && (
          <SortProviderModal
            defaultItems={enabledModelProviderList}
            onCancel={() => {
              setOpen(false);
            }}
            open={open}
          />
        )}
      </Flexbox>
      {enabledModelProviderList.map((item) => (
        <ProviderItem {...item} key={item.id} onClick={onProviderSelect} />
      ))}
      <Flexbox align={'center'} horizontal justify={'space-between'}>
        <Text style={{ fontSize: 12, marginTop: 8 }} type={'secondary'}>
          {t('menu.list.disabled')}
        </Text>
        {disabledModelProviderList.length > 1 && (
          <Dropdown
            menu={{
              items: [
                {
                  icon: sortType === SortType.Default ? <Icon icon={LucideCheck} /> : <div />,
                  key: 'default',
                  label: t('menu.list.disabledActions.sortDefault'),
                  onClick: () => updateSortType(SortType.Default),
                },
                {
                  type: 'divider',
                },
                {
                  icon: sortType === SortType.Alphabetical ? <Icon icon={LucideCheck} /> : <div />,
                  key: 'alphabetical',
                  label: t('menu.list.disabledActions.sortAlphabetical'),
                  onClick: () => updateSortType(SortType.Alphabetical),
                },
                {
                  icon:
                    sortType === SortType.AlphabeticalDesc ? <Icon icon={LucideCheck} /> : <div />,
                  key: 'alphabeticalDesc',
                  label: t('menu.list.disabledActions.sortAlphabeticalDesc'),
                  onClick: () => updateSortType(SortType.AlphabeticalDesc),
                },
              ] as ItemType[],
            }}
            trigger={['click']}
          >
            <ActionIcon
              icon={ArrowDownUpIcon}
              size={'small'}
              title={t('menu.list.disabledActions.sort')}
            />
          </Dropdown>
        )}
      </Flexbox>
      {sortedDisabledProviders.map((item) => (
        <ProviderItem {...item} key={item.id} onClick={onProviderSelect} />
      ))}
    </ScrollShadow>
  );
};

export default ProviderList;
