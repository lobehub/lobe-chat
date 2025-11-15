
import MobileContentLayout from '@/components/server/MobileNavLayout';
import Footer from '@/features/Setting/Footer';

import { SCROLL_PARENT_ID } from '../../../features/const';
import Header from './Header';
import { Outlet } from 'react-router-dom';


const Layout = () => {
  return (
    <MobileContentLayout
      gap={16}
      header={<Header />}
      id={SCROLL_PARENT_ID}
      style={{ paddingInline: 16, paddingTop: 8 }}
      withNav
    >
      <Outlet />
      <div />
      <Footer />
    </MobileContentLayout>
  );
};

Layout.displayName = 'MobileDiscoverLayout';

export default Layout;
