'use client';

import { useTheme } from 'antd-style';
import dynamic from 'next/dynamic';
import { Suspense, memo } from 'react';
import { HotkeysProvider } from 'react-hotkeys-hook';
import { Flexbox } from 'react-layout-kit';
import { Outlet, useNavigation } from 'react-router-dom';

import Loading from '@/components/Loading/BrandTextLoading';
import { isDesktop } from '@/const/version';
import { BANNER_HEIGHT } from '@/features/AlertBanner/CloudBanner';
import TitleBar, { TITLE_BAR_HEIGHT } from '@/features/ElectronTitlebar';
import HotkeyHelperPanel from '@/features/HotkeyHelperPanel';
import { usePlatform } from '@/hooks/usePlatform';
import { Locales } from '@/locales/resources';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { HotkeyScopeEnum } from '@/types/hotkey';

import DesktopLayoutContainer from './DesktopLayoutContainer';
import RegisterHotkeys from './RegisterHotkeys';
import SideBar from './SideBar';

const CloudBanner = dynamic(() => import('@/features/AlertBanner/CloudBanner'));

const Layout = memo((props: { locale: Locales }) => {
  const { locale } = props;
  const { isPWA } = usePlatform();
  const theme = useTheme();

  // 获取全局导航状态
  const navigation = useNavigation();

  // 当 navigation.state 为 'loading'时，意味着我们正在等待 loader
  const isLoading = navigation.state === 'loading';

  const { showCloudPromotion } = useServerConfigStore(featureFlagsSelectors);
  return (
    <HotkeysProvider initiallyActiveScopes={[HotkeyScopeEnum.Global]}>
      {isDesktop && <TitleBar />}
      {isLoading && <Loading />}
      {showCloudPromotion && <CloudBanner />}
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
        {isDesktop ? (
          <DesktopLayoutContainer>
            <Outlet context={{ locale: locale }} />
          </DesktopLayoutContainer>
        ) : (
          <>
            <Suspense>
              <SideBar />
            </Suspense>
            <Outlet context={{ locale: locale }} />
          </>
        )}
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
