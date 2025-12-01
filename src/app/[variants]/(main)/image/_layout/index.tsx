import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';
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
        height={'100%'}
        horizontal
        style={{ maxWidth: '100%', overflow: 'hidden', position: 'relative' }}
        width={'100%'}
      >
        <Center
          flex={1}
          style={{
            background: theme.colorBgContainer,
            overflowX: 'hidden',
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          <Flexbox
            gap={16}
            height={'100%'}
            padding={24}
            style={{
              maxWidth: 906,
            }}
            width={'100%'}
          >
            <Outlet />
          </Flexbox>
        </Center>
        <TopicSidebar />
      </Flexbox>
      <RegisterHotkeys />
    </>
  );
});

Layout.displayName = 'DesktopAiImageLayout';

export default Layout;
