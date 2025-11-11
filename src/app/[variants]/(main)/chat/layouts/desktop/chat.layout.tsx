import { Suspense } from 'react';
import { Flexbox } from 'react-layout-kit';

import { isDesktop } from '@/const/version';
import ProtocolUrlHandler from '@/features/ProtocolUrlHandler';

import RegisterHotkeys from '../../_layout/Desktop/RegisterHotkeys';
import SessionPanel from '../../_layout/Desktop/SessionPanel';
import Workspace from '../../_layout/Desktop/Workspace';

import { Outlet } from 'react-router-dom';


export const ChatDesktopLayout = () => {
  return (
    <>
      <Flexbox
        height={'100%'}
        horizontal
        style={{ maxWidth: '100%', overflow: 'hidden', position: 'relative' }}
        width={'100%'}
      >
        <SessionPanel />
        <Workspace><Outlet/></Workspace>
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

ChatDesktopLayout.displayName = 'ChatDesktopLayout';

export default ChatDesktopLayout;
