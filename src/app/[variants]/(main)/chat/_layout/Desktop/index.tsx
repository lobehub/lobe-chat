import { Suspense } from 'react';
import { Flexbox } from 'react-layout-kit';

import InitClientDB from '@/features/InitClientDB';

import { LayoutProps } from '../type';
import RegisterHotkeys from './RegisterHotkeys';
import SessionPanel from './SessionPanel';
import Workspace from './Workspace';

const Layout = ({ children, session }: LayoutProps) => {
  return (
    <>
      <Flexbox
        height={'100%'}
        horizontal
        style={{ maxWidth: '100%', overflow: 'hidden', position: 'relative' }}
        width={'100%'}
      >
        <SessionPanel>{session}</SessionPanel>
        <Workspace>{children}</Workspace>
      </Flexbox>
      <InitClientDB bottom={60} />
      {/* ↓ cloud slot ↓ */}

      {/* ↑ cloud slot ↑ */}
      <Suspense>
        <RegisterHotkeys />
      </Suspense>
    </>
  );
};

Layout.displayName = 'DesktopChatLayout';

export default Layout;
