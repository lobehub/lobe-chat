'use client';

import { useTheme } from 'antd-style';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { PropsWithChildren, Suspense, memo } from 'react';
import { HotkeysProvider } from 'react-hotkeys-hook';
import { Flexbox } from 'react-layout-kit';

import { isDesktop } from '@/const/version';
import { BANNER_HEIGHT } from '@/features/AlertBanner/CloudBanner';
import HotkeyHelperPanel from '@/features/HotkeyHelperPanel';
import { usePlatform } from '@/hooks/usePlatform';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { HotkeyScopeEnum } from '@/types/hotkey';

import RegisterHotkeys from './RegisterHotkeys';
import SideBar from './SideBar';
import TitleBar, { TITLE_BAR_HEIGHT } from './Titlebar';

const CloudBanner = dynamic(() => import('@/features/AlertBanner/CloudBanner'));

const Layout = memo<PropsWithChildren>(({ children }) => {
  const { isPWA } = usePlatform();
  const theme = useTheme();

  const pathname = usePathname();
  const { showCloudPromotion } = useServerConfigStore(featureFlagsSelectors);

  // setting page not show sidebar
  const hideSideBar = isDesktop && pathname.startsWith('/settings');
  return (
    <HotkeysProvider initiallyActiveScopes={[HotkeyScopeEnum.Global]}>
      {isDesktop && <TitleBar />}
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
        {!hideSideBar && <SideBar />}
        {isDesktop ? (
          <Flexbox
            style={{
              background: theme.colorBgLayout,
              borderInlineStart: `1px solid ${theme.colorBorderSecondary}`,
              borderStartStartRadius: !hideSideBar ? 12 : undefined,
              borderTop: `1px solid ${theme.colorBorderSecondary}`,
              overflow: 'hidden',
            }}
            width={'100%'}
          >
            {children}
          </Flexbox>
        ) : (
          children
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
