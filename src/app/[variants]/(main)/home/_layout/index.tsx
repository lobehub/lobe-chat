import { Flexbox } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { FC, Suspense, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { useHomeStore } from '@/store/home';

import RecentHydration from './RecentHydration';
import Sidebar from './Sidebar';

const Layout: FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const setNavigate = useHomeStore((s) => s.setNavigate);

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate, setNavigate]);

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
};

Layout.displayName = 'DesktopHomeLayout';

export default Layout;
