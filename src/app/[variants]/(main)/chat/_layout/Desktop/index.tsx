import { Flexbox } from 'react-layout-kit';
import { Outlet } from 'react-router-dom';

import { isDesktop } from '@/const/version';
import NavPanel from '@/features/NavPanel';
import ProtocolUrlHandler from '@/features/ProtocolUrlHandler';

import RegisterHotkeys from './RegisterHotkeys';
import Workspace from './Workspace';

const Layout = () => {
  return (
    <>
      <Flexbox
        height={'100%'}
        horizontal
        style={{ maxWidth: '100%', overflow: 'hidden', position: 'relative' }}
        width={'100%'}
      >
        <NavPanel />
        <Workspace>
          <Outlet />
        </Workspace>
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
