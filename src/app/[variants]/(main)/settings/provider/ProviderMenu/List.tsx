'use client';

import { ActionIcon, ScrollShadow, Text, Tooltip } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { ArrowDownAZ, ArrowDownUpIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { aiProviderSelectors } from '@/store/aiInfra';
import { useAiInfraStore } from '@/store/aiInfra/store';

import All from './All';
import ProviderItem from './Item';
import SortProviderModal from './SortProviderModal';

// Sort type enumeration
enum SortType {
  Alphabetical = 'alphabetical',
  Default = 'default',
}

const ProviderList = (props: {
  mobile?: boolean;
  onProviderSelect: (providerKey: string) => void;
}) => {
  const { onProviderSelect, mobile } = props;
  const { t } = useTranslation('modelProvider');
  const [open, setOpen] = useState(false);
  const [sortType, setSortType] = useState<SortType>(
    () => (localStorage.getItem('disabledModelProvidersSortType') as SortType) || SortType.Default,
  );

  useEffect(() => {
    localStorage.setItem('disabledModelProvidersSortType', sortType);
  }, [sortType]);

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
    if (sortType === SortType.Default) {
      return [...disabledModelProviderList];
    } else {
      return [...disabledModelProviderList].sort((a, b) => {
        const cmpDisplay = (a.name || a.id).localeCompare(b.name || b.id);
        if (cmpDisplay !== 0) return cmpDisplay;
        return a.id.localeCompare(b.id);
      });
    }
  }, [disabledModelProviderList, sortType]);

  const toggleSortType = () => {
    setSortType(sortType === SortType.Default ? SortType.Alphabetical : SortType.Default);
  };

  const getSortTooltip = () => {
    return sortType === SortType.Default
      ? t('menu.list.disabledActions.sortAlphabetical')
      : t('menu.list.disabledActions.sortDefault');
  };
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
      {sortedDisabledProviders.map((item) => (
        <ProviderItem {...item} key={item.id} onClick={onProviderSelect} />
      ))}
    </ScrollShadow>
  );
};

export default ProviderList;
