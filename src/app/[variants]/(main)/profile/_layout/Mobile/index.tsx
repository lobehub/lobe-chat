import { Outlet } from 'react-router-dom';

import MobileContentLayout from '@/components/server/MobileNavLayout';
import Footer from '@/features/Setting/Footer';

import Header from './Header';

const Layout = () => {
  return (
    <MobileContentLayout header={<Header />}>
      <Outlet />
      <div style={{ flex: 1 }} />
      <Footer />
    </MobileContentLayout>
  );
};

Layout.displayName = 'MobileProfileLayout';

export default Layout;
