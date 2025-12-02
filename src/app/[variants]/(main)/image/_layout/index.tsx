import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { Outlet } from 'react-router-dom';

import RegisterHotkeys from './RegisterHotkeys';
import Sidebar from './Sidebar';
import TopicSidebar from './TopicSidebar';

const Layout = memo(() => {
  const theme = useTheme();
  return (
    <>
      <Sidebar />
      <Flexbox
        flex={1}
        height={'100vh'}
        horizontal
        style={{
          background: theme.colorBgContainer,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Flexbox
          flex={1}
          height={'100vh'}
          style={{
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Outlet />
        </Flexbox>
        <TopicSidebar />
      </Flexbox>
      <RegisterHotkeys />
    </>
  );
});

Layout.displayName = 'DesktopAiImageLayout';

export default Layout;
