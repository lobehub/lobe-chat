  import { Suspense } from 'react';
import { Flexbox } from 'react-layout-kit';

import { isDesktop } from '@/const/version';
import ProtocolUrlHandler from '@/features/ProtocolUrlHandler';

import RegisterHotkeys from './RegisterHotkeys';
import SessionPanel from './SessionPanel';
import Workspace from './Workspace';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <>
      <Flexbox
        height={'100%'}
        horizontal
        style={{ maxWidth: '100%', overflow: 'hidden', position: 'relative' }}
        width={'100%'}
      >
        <SessionPanel />
        <Workspace>
          <Outlet />
        </Workspace>
      </Flexbox>
      {/* ↓ cloud slot ↓ */}

      {/* ↑ cloud slot ↑ */}
      <Suspense>
        <RegisterHotkeys />
      </Suspense>
      {isDesktop && <ProtocolUrlHandler />}
    </>
  );
};

Layout.displayName = 'DesktopChatLayout';

export default Layout;
