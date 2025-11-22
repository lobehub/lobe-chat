'use client';

import { useResponsive, useTheme } from 'antd-style';
import useMergedState from 'rc-util/lib/hooks/useMergedState';
import { memo, useEffect, useRef } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useSearchParams } from 'react-router-dom';

import SettingContainer from '@/features/Setting/SettingContainer';
import { SettingsTabs } from '@/store/global/initialState';

import CategoryContent from '../CategoryContent';
import SettingsContent from '../SettingsContent';
import { LayoutProps } from '../type';
import Header from './Header';
import SideBar from './SideBar';

const Layout = memo<LayoutProps>(() => {
  const ref = useRef<HTMLDivElement | null>(null);
  const { md = true } = useResponsive();
  const theme = useTheme();

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

  const category = (
    <CategoryContent activeTab={activeTabState.active} onMenuSelect={setActiveTab} />
  );

  return (
    <Flexbox
      height={'100%'}
      horizontal={md}
      ref={ref}
      style={{ background: theme.colorBgContainer, flex: '1', position: 'relative' }}
    >
      {md ? (
        <SideBar>{category}</SideBar>
      ) : (
        <Header getContainer={() => ref.current!}>{category}</Header>
      )}
      <SettingContainer maxWidth={'none'}>
        <SettingsContent activeTab={activeTabState.active} mobile={false} />
      </SettingContainer>
    </Flexbox>
  );
});

Layout.displayName = 'DesktopSettingsLayout';

export default Layout;
