import { useTheme } from 'antd-style';
import { Flexbox } from 'react-layout-kit';
import { Outlet } from 'react-router-dom';

import RecentHydration from './RecentHydration';
import Sidebar from './Sidebar';

const Layout = () => {
  const theme = useTheme();

  return (
    <>
      <Sidebar />
      <Flexbox
        flex={1}
        height={'100vh'}
        style={{
          background: theme.colorBgContainerSecondary,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Outlet />
      </Flexbox>
      <RecentHydration />
    </>
  );
};

Layout.displayName = 'DesktopChatLayout';

export default Layout;
