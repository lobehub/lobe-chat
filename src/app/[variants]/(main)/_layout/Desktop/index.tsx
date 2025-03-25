'use client';

import { useTheme } from 'antd-style';
import dynamic from 'next/dynamic';
import { PropsWithChildren, memo } from 'react';
import { HotkeysProvider } from 'react-hotkeys-hook';
import { Flexbox } from 'react-layout-kit';

import { GLOBAL_HOTKEY_SCOPE } from '@/const/hotkeys';
import { BANNER_HEIGHT } from '@/features/AlertBanner/CloudBanner';
import { usePlatform } from '@/hooks/usePlatform';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import RegisterHotkeys from './RegisterHotkeys';
import SideBar from './SideBar';

const CloudBanner = dynamic(() => import('@/features/AlertBanner/CloudBanner'));

const Layout = memo<PropsWithChildren>(({ children }) => {
  const { isPWA } = usePlatform();
  const theme = useTheme();

  const { showCloudPromotion } = useServerConfigStore(featureFlagsSelectors);

  return (
    <HotkeysProvider initiallyActiveScopes={[GLOBAL_HOTKEY_SCOPE]}>
      {showCloudPromotion && <CloudBanner />}
      <Flexbox
        height={showCloudPromotion ? `calc(100% - ${BANNER_HEIGHT}px)` : '100%'}
        horizontal
        style={{
          borderTop: isPWA ? `1px solid ${theme.colorBorder}` : undefined,
          position: 'relative',
        }}
        width={'100%'}
      >
        <SideBar />
        {children}
      </Flexbox>
      <RegisterHotkeys />
    </HotkeysProvider>
  );
});

Layout.displayName = 'DesktopMainLayout';

export default Layout;
