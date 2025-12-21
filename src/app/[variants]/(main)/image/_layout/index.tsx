import { Flexbox } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { FC } from 'react';
import { Outlet } from 'react-router-dom';

import RegisterHotkeys from './RegisterHotkeys';
import Sidebar from './Sidebar';
import TopicSidebar from './TopicSidebar';

const Layout: FC = () => {
  const theme = useTheme();
  return (
    <>
      <Sidebar />
      <Flexbox
        flex={1}
        height={'100%'}
        horizontal
        style={{
          background: theme.colorBgContainer,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Flexbox
          flex={1}
          height={'100%'}
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
};

Layout.displayName = 'DesktopAiImageLayout';

export default Layout;
