import { Flexbox } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { Activity, FC, ReactNode, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useHomeStore } from '@/store/home';

import RecentHydration from './RecentHydration';
import Sidebar from './Sidebar';

interface LayoutProps {
  children?: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isHomeRoute = pathname === '/';
  const [hasActivated, setHasActivated] = useState(isHomeRoute);
  const setNavigate = useHomeStore((s) => s.setNavigate);
  const content = children ?? <Outlet />;

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate, setNavigate]);

  useEffect(() => {
    if (isHomeRoute) setHasActivated(true);
  }, [isHomeRoute]);

  if (!hasActivated) return null;

  // Keep the Home layout alive and render it offscreen when inactive.
  return (
    <Activity mode={isHomeRoute ? 'visible' : 'hidden'} name="DesktopHomeLayout">
      <Flexbox
        height={'100%'}
        style={{
          inset: 0,
          pointerEvents: isHomeRoute ? 'auto' : 'none',
          position: 'absolute',
          visibility: isHomeRoute ? 'visible' : 'hidden',
        }}
        width={'100%'}
      >
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
          {content}
        </Flexbox>

        <RecentHydration />
      </Flexbox>
    </Activity>
  );
};

Layout.displayName = 'DesktopHomeLayout';

export default Layout;
