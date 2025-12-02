'use client';

import { Accordion, AccordionItem, Text } from '@lobehub/ui';
import useMergedState from 'rc-util/lib/hooks/useMergedState';
import { memo, useEffect } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useSearchParams } from 'react-router-dom';

import { withSuspense } from '@/components/withSuspense';
import NavItem from '@/features/NavPanel/components/NavItem';
import { SettingsTabs } from '@/store/global/initialState';

import { SettingsGroupKey, useCategory } from '../hooks/useCategory';

const CategoryContent = memo(() => {
  const categoryGroups = useCategory();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTabState, setActiveTabState] = useMergedState(
    {
      active: (searchParams.get('active') as SettingsTabs)
        ? (searchParams.get('active') as SettingsTabs)
        : SettingsTabs.Common,
    },
    {
      onChange: (obj: { active: SettingsTabs; provider?: string }) => {
        if (obj.provider) {
          setSearchParams({ active: obj.active, provider: obj.provider });
        } else {
          searchParams.delete('provider');
          setSearchParams({ active: obj.active });
        }
      },
    },
  );

  const setActiveTab = (tab: SettingsTabs) => {
    if (tab === SettingsTabs.Provider) {
      setActiveTabState({ active: tab, provider: 'all' });
    } else {
      setActiveTabState({
        active: tab,
      });
    }
  };

  useEffect(() => {
    return () => {
      setSearchParams((prevParams) => {
        prevParams.delete('active');
        return prevParams;
      });
    };
  }, []);

  return (
    <Flexbox paddingInline={4}>
      <Accordion
        defaultExpandedKeys={[
          SettingsGroupKey.Account,
          SettingsGroupKey.AIConfig,
          SettingsGroupKey.System,
        ]}
        gap={8}
      >
        {categoryGroups.map((group) => (
          <AccordionItem
            itemKey={group.key}
            key={group.key}
            paddingBlock={4}
            paddingInline={'8px 4px'}
            title={
              <Text ellipsis fontSize={12} type={'secondary'} weight={500}>
                {group.title}
              </Text>
            }
          >
            <Flexbox gap={4} paddingBlock={1}>
              {group.items.map((item) => (
                <NavItem
                  active={activeTabState.active === item.key}
                  icon={item.icon}
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  title={item.label}
                />
              ))}
            </Flexbox>
          </AccordionItem>
        ))}
      </Accordion>
    </Flexbox>
  );
});

export default withSuspense(CategoryContent);
