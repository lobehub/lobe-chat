'use client';

import { useResponsive, useTheme } from 'antd-style';
import { memo, useEffect, useRef, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import InitClientDB from '@/features/InitClientDB';
import Footer from '@/features/Setting/Footer';
import SettingContainer from '@/features/Setting/SettingContainer';

import { LayoutProps } from '../type';
import Header from './Header';
import SideBar from './SideBar';
import CategoryContent from '../CategoryContent';
import { SettingsTabs } from '@/store/global/initialState';
import SettingsContent from '../SettingsContent';
import { useSettingsStore } from '../../hooks/useSettingsStore';

const Layout = memo<LayoutProps>(() => {
  const [activeTab, setActiveTab] = useState(SettingsTabs.Common)
  const { state, actions } = useSettingsStore();
  const category = <CategoryContent onMenuSelect={setActiveTab} />
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
      <SettingContainer addonAfter={<Footer />}>
        <SettingsContent
          actions={actions}
          activeTab={activeTab}
          state={state}
          // 应该改造成从顶部传入
          mobile={false}
        />
      </SettingContainer>
      <InitClientDB />
    </Flexbox>
  );
});

Layout.displayName = 'DesktopSettingsLayout';

export default Layout;
