import { Outlet } from 'react-router-dom';

import MobileContentLayout from '@/components/server/MobileNavLayout';

import Hero from '../../features/Hero';
import Header from './Header';

const Layout = () => {
  return (
    <MobileContentLayout header={<Header />} padding={16}>
      <Hero />
      <Outlet />
    </MobileContentLayout>
  );
};

Layout.displayName = 'MobileChangelogLayout';

export default Layout;
