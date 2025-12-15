'use client';

import { useTheme } from 'antd-style';
import dynamic from 'next/dynamic';
import { Suspense, memo, useEffect } from 'react';
import { HotkeysProvider } from 'react-hotkeys-hook';
import { Flexbox } from 'react-layout-kit';
import { Outlet } from 'react-router-dom';

import { DndContextWrapper } from '@/app/[variants]/(main)/resource/features/DndContextWrapper';
import Loading from '@/components/Loading/BrandTextLoading';
import { isDesktop } from '@/const/version';
import { BANNER_HEIGHT } from '@/features/AlertBanner/CloudBanner';
import TitleBar, { TITLE_BAR_HEIGHT } from '@/features/ElectronTitlebar';
import HotkeyHelperPanel from '@/features/HotkeyHelperPanel';
import NavPanel from '@/features/NavPanel';
import { usePlatform } from '@/hooks/usePlatform';
import { MarketAuthProvider } from '@/layout/AuthProvider/MarketAuth';
import CmdkLazy from '@/layout/GlobalProvider/CmdkLazy';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { HotkeyScopeEnum } from '@/types/hotkey';

import DesktopAutoOidcOnFirstOpen from './DesktopAutoOidcOnFirstOpen';
import DesktopLayoutContainer from './DesktopLayoutContainer';
import RegisterHotkeys from './RegisterHotkeys';

const CloudBanner = dynamic(() => import('@/features/AlertBanner/CloudBanner'));

const Layout = memo(() => {
  const { isPWA } = usePlatform();
  const theme = useTheme();
  const { showCloudPromotion } = useServerConfigStore(featureFlagsSelectors);
  useEffect(() => {
    document.body.style.background = theme.colorBgLayout;
  }, [theme.colorBgLayout]);
  return (
    <HotkeysProvider initiallyActiveScopes={[HotkeyScopeEnum.Global]}>
      <Suspense fallback={null}>
        {isDesktop && <TitleBar />}
        {isDesktop && <DesktopAutoOidcOnFirstOpen />}
        {showCloudPromotion && <CloudBanner />}
      </Suspense>
      <DndContextWrapper>
        <Flexbox
          height={
            isDesktop
              ? `calc(100% - ${TITLE_BAR_HEIGHT}px)`
              : showCloudPromotion
                ? `calc(100% - ${BANNER_HEIGHT}px)`
                : '100%'
          }
          horizontal
          style={{
            borderTop: isPWA ? `1px solid ${theme.colorBorder}` : undefined,
            position: 'relative',
          }}
          width={'100%'}
        >
          <NavPanel />
          <DesktopLayoutContainer>
            <MarketAuthProvider isDesktop={isDesktop}>
              <Suspense fallback={<Loading debugId="DesktopMainLayout > Outlet" />}>
                <Outlet />
              </Suspense>
            </MarketAuthProvider>
          </DesktopLayoutContainer>
        </Flexbox>
      </DndContextWrapper>
      <Suspense fallback={null}>
        <HotkeyHelperPanel />
        <RegisterHotkeys />
        <CmdkLazy />
      </Suspense>
    </HotkeysProvider>
  );
});

Layout.displayName = 'DesktopMainLayout';

export default Layout;
