import { PropsWithChildren } from 'react';
import { Flexbox } from 'react-layout-kit';

import NProgress from '@/components/NProgress';

import Header from './Header';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <NProgress />
      <Flexbox height={'100%'} style={{ overflow: 'hidden', position: 'relative' }} width={'100%'}>
        <Header />
        {children}
      </Flexbox>
      {/* ↓ cloud slot ↓ */}

      {/* ↑ cloud slot ↑ */}
    </>
  );
};

Layout.displayName = 'DesktopDiscoverStoreLayout';

export default Layout;
