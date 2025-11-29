
import NProgress from '@/components/NProgress';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <>
      <NProgress />
      <Outlet />
    </>
  );
};

Layout.displayName = 'MobileDiscoverStoreLayout';

export default Layout;
