import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { Outlet } from 'react-router-dom';

import { isDesktop } from '@/const/version';
import ProtocolUrlHandler from '@/features/ProtocolUrlHandler';
import { useInitGroupConfig } from '@/hooks/useInitGroupConfig';

import GroupIdSync from './GroupIdSync';
import RegisterHotkeys from './RegisterHotkeys';
import Sidebar from './Sidebar';

const Layout = memo(() => {
  const theme = useTheme();
  useInitGroupConfig();

  return (
    <>
      <Sidebar />
      <Flexbox
        flex={1}
        height={'100%'}
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
      <GroupIdSync />
    </>
  );
});

Layout.displayName = 'DesktopChatLayout';

export default Layout;
