import { PropsWithChildren } from 'react';

import NProgress from '@/components/NProgress';

import Container from './Container';
import Header from './Header';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <NProgress />
      <Container>
        <Header />
        {children}
      </Container>
      {/* ↓ cloud slot ↓ */}

      {/* ↑ cloud slot ↑ */}
    </>
  );
};

Layout.displayName = 'DesktopDiscoverStoreLayout';

export default Layout;
