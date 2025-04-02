'use client';

import { useTheme } from 'antd-style';
import dynamic from 'next/dynamic';
import { PropsWithChildren, Suspense, memo } from 'react';
import { HotkeysProvider } from 'react-hotkeys-hook';
import { Flexbox } from 'react-layout-kit';

import { BANNER_HEIGHT } from '@/features/AlertBanner/CloudBanner';
import HotkeyHelperPanel from '@/features/HotkeyHelperPanel';
import { usePlatform } from '@/hooks/usePlatform';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { HotkeyScopeEnum } from '@/types/hotkey';

import RegisterHotkeys from './RegisterHotkeys';
import SideBar from './SideBar';

const CloudBanner = dynamic(() => import('@/features/AlertBanner/CloudBanner'));

const Layout = memo<PropsWithChildren>(({ children }) => {
  const { isPWA } = usePlatform();
  const theme = useTheme();
  const { showCloudPromotion } = useServerConfigStore(featureFlagsSelectors);

  return (
    <HotkeysProvider initiallyActiveScopes={[HotkeyScopeEnum.Global]}>
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
      <HotkeyHelperPanel />
      <Suspense>
        <RegisterHotkeys />
      </Suspense>
    </HotkeysProvider>
  );
});

Layout.displayName = 'DesktopMainLayout';

export default Layout;
