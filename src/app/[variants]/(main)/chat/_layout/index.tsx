import { useTheme } from 'antd-style';
import { Flexbox } from 'react-layout-kit';
import { Outlet } from 'react-router-dom';

import { isDesktop } from '@/const/version';
import ProtocolUrlHandler from '@/features/ProtocolUrlHandler';

import RegisterHotkeys from './RegisterHotkeys';
import Sidebar from './Sidebar';

const Layout = () => {
  const theme = useTheme();
  return (
    <>
      <Sidebar />
      <Flexbox
        flex={1}
        style={{
          background: theme.colorBgContainer,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Outlet />
      </Flexbox>
      {/* ↓ cloud slot ↓ */}

      {/* ↑ cloud slot ↑ */}
      <RegisterHotkeys />
      {isDesktop && <ProtocolUrlHandler />}
    </>
  );
};

Layout.displayName = 'DesktopChatLayout';

export default Layout;
