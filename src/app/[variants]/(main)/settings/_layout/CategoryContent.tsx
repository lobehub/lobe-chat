'use client';

import useMergedState from 'rc-util/lib/hooks/useMergedState';
import { memo, useEffect } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useSearchParams } from 'react-router-dom';

import Menu from '@/components/Menu';
import { withSuspense } from '@/components/withSuspense';
import { SettingsTabs } from '@/store/global/initialState';

import { useCategory } from '../hooks/useCategory';

const CategoryContent = memo(() => {
  const cateItems = useCategory();
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
    <Flexbox>
      <Menu
        compact
        defaultSelectedKeys={[activeTabState.active || SettingsTabs.Common]}
        items={cateItems}
        onClick={({ key }) => {
          setActiveTab(key as SettingsTabs);
        }}
        selectable
      />
    </Flexbox>
  );
});

export default withSuspense(CategoryContent);
