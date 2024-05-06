'use client';

import { ReactNode } from 'react';
import { Flexbox } from 'react-layout-kit';

import FolderPanel from '@/features/FolderPanel';

import Migration from '../features/Migration';

type Props = { children: ReactNode; session: ReactNode };

const Layout = ({ children, session }: Props) => {
  return (
    <>
      <Flexbox
        height={'100%'}
        horizontal
        style={{ maxWidth: 'calc(100vw - 64px)', overflow: 'hidden', position: 'relative' }}
        width={'100%'}
      >
        <FolderPanel>{session}</FolderPanel>
        <Flexbox
          flex={1}
          id={'lobe-conversion-container'}
          style={{ overflow: 'hidden', position: 'relative' }}
        >
          {children}
        </Flexbox>
      </Flexbox>
      <Migration />
    </>
  );
};

Layout.displayName = 'DesktopChatLayout';

export default Layout;
