'use client';

import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import CloudBanner, { BANNER_HEIGHT } from '@/features/AlertBanner/CloudBanner';
import { usePlatform } from '@/hooks/usePlatform';

import { LayoutProps } from './type';

const Layout = memo<LayoutProps>(({ children, nav }) => {
  const { isPWA } = usePlatform();
  const theme = useTheme();

  // TODO: Add feature flag
  const showCloudBanner = true;

  return (
    <>
      {showCloudBanner && <CloudBanner />}
      <Flexbox
        height={showCloudBanner ? `calc(100% - ${BANNER_HEIGHT}px)` : '100%'}
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
