'use client';

import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { Outlet } from 'react-router-dom';

import SideBar from '@/app/[variants]/(main)/settings/_layout/SideBar';

import SettingsContextProvider from './ContextProvider';

const Layout = memo(() => {
  const theme = useTheme();

  return (
    <SettingsContextProvider
      value={{
        showOpenAIApiKey: true,
        showOpenAIProxyUrl: true,
      }}
    >
      <SideBar />
      <Flexbox
        height={'100%'}
        horizontal
        style={{ background: theme.colorBgContainer, flex: '1', position: 'relative' }}
      >
        <Outlet />
      </Flexbox>
    </SettingsContextProvider>
  );
});

Layout.displayName = 'DesktopSettingsWrapper';

export default Layout;
