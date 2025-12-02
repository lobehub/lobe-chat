'use client';

import useMergedState from 'rc-util/lib/hooks/useMergedState';
import React, { memo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { NavPanelPortal } from '@/features/NavPanel';
import SideBarLayout from '@/features/NavPanel/SideBarLayout';
import { SettingsTabs } from '@/store/global/initialState';

import CategoryContent from './CategoryContent';
import Header from './Header';

const SidebarLayout = memo(() => {
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
    <NavPanelPortal navKey="image">
      <SideBarLayout body={<CategoryContent />} header={<Header />} />
    </NavPanelPortal>
  );
});

export default SidebarLayout;
