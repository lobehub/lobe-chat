import { useTheme } from 'antd-style';
import { Flexbox } from 'react-layout-kit';
import { Outlet } from 'react-router-dom';

import { isDesktop } from '@/const/version';
import SessionHydration from '@/features/NavPanel/SessionHydration';
import ProtocolUrlHandler from '@/features/ProtocolUrlHandler';
import { useInitAgentConfig } from '@/hooks/useInitAgentConfig';

import RegisterHotkeys from './RegisterHotkeys';
import Sidebar from './Sidebar';

const Layout = () => {
  const theme = useTheme();
  useInitAgentConfig();
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
      <SessionHydration />
    </>
  );
};

Layout.displayName = 'DesktopChatLayout';

export default Layout;
