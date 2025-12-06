import { useTheme } from 'antd-style';
import { Suspense, memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { Outlet } from 'react-router-dom';

import RecentHydration from './RecentHydration';
import Sidebar from './Sidebar';

const Layout = memo(() => {
  const theme = useTheme();

  return (
    <>
      <Sidebar />
      <Flexbox
        flex={1}
        height={'100%'}
        style={{
          background: theme.isDarkMode
            ? `linear-gradient(to bottom, ${theme.colorBgContainer}, ${theme.colorBgContainerSecondary})`
            : theme.colorBgContainerSecondary,
          overflow: 'hidden',
        }}
      >
        <Outlet />
      </Flexbox>
      <Suspense fallback={null}>
        <RecentHydration />
      </Suspense>
    </>
  );
});

Layout.displayName = 'DesktopChatLayout';

export default Layout;
