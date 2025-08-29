'use client';

import { useResponsive, useTheme } from 'antd-style';
import { memo, useEffect, useRef, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import InitClientDB from '@/features/InitClientDB';
import SettingContainer from '@/features/Setting/SettingContainer';
import { SettingsTabs } from '@/store/global/initialState';

import { useSettingsStore } from '../../hooks/useSettingsStore';
import CategoryContent from '../CategoryContent';
import SettingsContent from '../SettingsContent';
import { LayoutProps } from '../type';
import Header from './Header';
import SideBar from './SideBar';

const Layout = memo<LayoutProps>(() => {
  const [activeTab, setActiveTab] = useState(SettingsTabs.Common);
  const { state, actions } = useSettingsStore();
  const category = <CategoryContent onMenuSelect={setActiveTab} />;
  const ref = useRef<any>(null);
  const { md = true } = useResponsive();
  const theme = useTheme();

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
      <SettingContainer
        // addonAfter={<Footer />}
        maxWidth={'none'}
      >
        <SettingsContent actions={actions} activeTab={activeTab} mobile={false} state={state} />
      </SettingContainer>
      <InitClientDB />
    </Flexbox>
  );
});

Layout.displayName = 'DesktopSettingsLayout';

export default Layout;
