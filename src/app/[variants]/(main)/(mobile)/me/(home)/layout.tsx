import { Outlet } from 'react-router-dom';

import MobileContentLayout from '@/components/server/MobileNavLayout';

import Header from './features/Header';

const Layout = () => {
  return (
    <MobileContentLayout header={<Header />} withNav>
      <Outlet />
    </MobileContentLayout>
  );
};

export default Layout;
