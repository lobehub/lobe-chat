
import NProgress from '@/components/NProgress';

import Container from './Container';
import Header from './Header';  
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <>
      <NProgress />
      <Container>
        <Header />
        <Outlet />
      </Container>
      {/* ↓ cloud slot ↓ */}

      {/* ↑ cloud slot ↑ */}
    </>
  );
};

Layout.displayName = 'DesktopDiscoverStoreLayout';

export default Layout;
