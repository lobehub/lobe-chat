'use client';

import { ActionIcon, Dropdown, Icon, ScrollShadow } from '@lobehub/ui';
import { Collapse } from 'antd';
import { createStyles } from 'antd-style';
import type { ItemType } from 'antd/es/menu/interface';
import isEqual from 'fast-deep-equal';
import { ArrowDownUpIcon, ChevronDownIcon, LucideCheck } from 'lucide-react';
import { type ReactNode, useCallback, useMemo, useState } from 'react';
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

const useStyles = createStyles(({ css, token }) => ({
  collapse: css`
    &.ant-collapse {
      border: none;
      border-radius: 0;
      background: transparent;
    }

    .ant-collapse-item {
      border: none !important;
    }

    .ant-collapse-header {
      padding: 0 !important;
      padding-block: 8px !important;

      font-size: 12px !important;
      color: ${token.colorTextSecondary} !important;

      background: transparent !important;
    }

    .ant-collapse-content {
      border: none !important;
      background: transparent !important;
    }

    .ant-collapse-content-box {
      padding: 0 !important;
    }

    .ant-collapse-expand-icon {
      padding-inline-end: 4px !important;
    }
  `,
  sectionHeader: css`
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: space-between;

    margin-block-start: 8px;
    padding-block: 4px;

    font-size: 12px;
    color: ${token.colorTextSecondary};
  `,
}));

const ProviderList = (props: {
  mobile?: boolean;
  onProviderSelect: (providerKey: string) => void;
}) => {
  const { onProviderSelect, mobile } = props;
  const { t } = useTranslation('modelProvider');
  const { styles } = useStyles();
  const [open, setOpen] = useState(false);

  // Collapse states - using array of active keys
  const [activeKeys, setActiveKeys] = useState<string[]>(['enabled', 'custom', 'disabled']);

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

  const disabledCustomProviderList = useAiInfraStore(
    aiProviderSelectors.disabledCustomAiProviderList,
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

  const collapseItems = useMemo(() => {
    const items: {
      children: ReactNode;
      extra?: ReactNode;
      key: string;
      label: string;
    }[] = [
      {
        children: (
          <Flexbox gap={0}>
            {enabledModelProviderList.map((item) => (
              <ProviderItem {...item} key={item.id} onClick={onProviderSelect} />
            ))}
          </Flexbox>
        ),
        extra: (
          <div onClick={(e) => e.stopPropagation()}>
            <ActionIcon
              icon={ArrowDownUpIcon}
              onClick={() => setOpen(true)}
              size={'small'}
              title={t('menu.sort')}
            />
          </div>
        ),
        key: 'enabled',
        label: t('menu.list.enabled'),
      },
    ];

    // Add custom providers section if there are any
    if (disabledCustomProviderList.length > 0) {
      items.push({
        children: (
          <Flexbox gap={0}>
            {disabledCustomProviderList.map((item) => (
              <ProviderItem {...item} key={item.id} onClick={onProviderSelect} />
            ))}
          </Flexbox>
        ),
        key: 'custom',
        label: t('menu.list.custom'),
      });
    }

    // Add disabled providers section
    items.push({
      children: (
        <Flexbox gap={0}>
          {sortedDisabledProviders.map((item) => (
            <ProviderItem {...item} key={item.id} onClick={onProviderSelect} />
          ))}
        </Flexbox>
      ),
      extra:
        disabledModelProviderList.length > 1 ? (
          <div onClick={(e) => e.stopPropagation()}>
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
                    icon:
                      sortType === SortType.Alphabetical ? <Icon icon={LucideCheck} /> : <div />,
                    key: 'alphabetical',
                    label: t('menu.list.disabledActions.sortAlphabetical'),
                    onClick: () => updateSortType(SortType.Alphabetical),
                  },
                  {
                    icon:
                      sortType === SortType.AlphabeticalDesc ? (
                        <Icon icon={LucideCheck} />
                      ) : (
                        <div />
                      ),
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
          </div>
        ) : undefined,
      key: 'disabled',
      label: t('menu.list.disabled'),
    });

    return items;
  }, [
    enabledModelProviderList,
    disabledCustomProviderList,
    sortedDisabledProviders,
    disabledModelProviderList.length,
    sortType,
    t,
    onProviderSelect,
    updateSortType,
  ]);

  return (
    <ScrollShadow gap={4} height={'100%'} paddingInline={8} size={4} style={{ paddingBottom: 32 }}>
      {!mobile && <All onClick={onProviderSelect} />}
      {open && (
        <SortProviderModal
          defaultItems={enabledModelProviderList}
          onCancel={() => {
            setOpen(false);
          }}
          open={open}
        />
      )}
      <Collapse
        activeKey={activeKeys}
        className={styles.collapse}
        expandIcon={({ isActive }) => (
          <Icon
            icon={ChevronDownIcon}
            size={'small'}
            style={{
              transform: isActive ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        )}
        ghost
        items={collapseItems}
        onChange={(keys) => setActiveKeys(keys as string[])}
      />
    </ScrollShadow>
  );
};

export default ProviderList;
