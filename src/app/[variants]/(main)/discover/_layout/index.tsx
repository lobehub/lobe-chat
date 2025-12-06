import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { Outlet } from 'react-router-dom';

import NProgress from '@/components/NProgress';

import Header from './Header';

const Layout = memo(() => {
  const theme = useTheme();
  return (
    <>
      <NProgress />
      <Flexbox
        height={'100%'}
        style={{
          background: theme.colorBgContainerSecondary,
          overflow: 'hidden',
          position: 'relative',
        }}
        width={'100%'}
      >
        <Header />
        <Outlet />
      </Flexbox>
      {/* ↓ cloud slot ↓ */}

      {/* ↑ cloud slot ↑ */}
    </>
  );
});

Layout.displayName = 'DesktopDiscoverStoreLayout';

export default Layout;
