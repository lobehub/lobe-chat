'use client';

import { useTheme } from 'antd-style';
import dynamic from 'next/dynamic';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { BANNER_HEIGHT } from '@/features/AlertBanner/CloudBanner';
import { usePlatform } from '@/hooks/usePlatform';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import { LayoutProps } from './type';

const CloudBanner = dynamic(() => import('@/features/AlertBanner/CloudBanner'), { ssr: false });
const ChangelogModal = dynamic(() => import('@/features/ChangelogModal'), { ssr: false });

const Layout = memo<LayoutProps>(({ children, nav }) => {
  const { isPWA } = usePlatform();
  const theme = useTheme();

  const { showCloudPromotion } = useServerConfigStore(featureFlagsSelectors);

  return (
    <>
      {showCloudPromotion && <CloudBanner />}
      <ChangelogModal />
      <Flexbox
        height={showCloudPromotion ? `calc(100% - ${BANNER_HEIGHT}px)` : '100%'}
        horizontal
        style={{
          borderTop: isPWA ? `1px solid ${theme.colorBorder}` : undefined,
          position: 'relative',
        }}
        width={'100%'}
      >
        {nav}
        {children}
      </Flexbox>
    </>
  );
});

Layout.displayName = 'DesktopMainLayout';

export default Layout;
