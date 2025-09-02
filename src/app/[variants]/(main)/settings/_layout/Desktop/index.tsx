'use client';

import { useResponsive, useTheme } from 'antd-style';
import { useSearchParams } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { memo, useEffect, useRef } from 'react';
import { Flexbox } from 'react-layout-kit';

import InitClientDB from '@/features/InitClientDB';
import SettingContainer from '@/features/Setting/SettingContainer';
import { SettingsTabs } from '@/store/global/initialState';

import CategoryContent from '../CategoryContent';
import SettingsContent from '../SettingsContent';
import { LayoutProps } from '../type';
import Header from './Header';
import SideBar from './SideBar';

const Layout = memo<LayoutProps>((props) => {
  const { showLLM = true } = props;
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useQueryState('active', {
    defaultValue: SettingsTabs.Common,
  });
  const category = <CategoryContent activeTab={activeTab} onMenuSelect={setActiveTab} />;
  const ref = useRef<any>(null);
  const { md = true } = useResponsive();
  const theme = useTheme();

  useEffect(() => {
    const activeParam = searchParams.get('active');
    if (activeParam && Object.values(SettingsTabs).includes(activeParam as SettingsTabs)) {
      setActiveTab(activeParam as SettingsTabs);
    }
  }, [searchParams, setActiveTab]);

  useEffect(() => {
    console.log('settings render');
  });

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
        <SettingsContent activeTab={activeTab} mobile={false} showLLM={showLLM} />
      </SettingContainer>
      <InitClientDB />
    </Flexbox>
  );
});

Layout.displayName = 'DesktopSettingsLayout';

export default Layout;
