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
        flex={1}
        height={'100vh'}
        style={{
          background: theme.colorBgContainer,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Outlet />
      </Flexbox>
    </SettingsContextProvider>
  );
});

Layout.displayName = 'DesktopSettingsWrapper';

export default Layout;
