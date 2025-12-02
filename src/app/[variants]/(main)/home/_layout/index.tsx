import { useTheme } from 'antd-style';
import { Flexbox } from 'react-layout-kit';
import { Outlet } from 'react-router-dom';

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
          background: theme.colorBgContainer,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Outlet />
      </Flexbox>
    </>
  );
};

Layout.displayName = 'DesktopChatLayout';

export default Layout;
