import { Outlet } from 'react-router-dom';

import NProgress from '@/components/NProgress';

const Layout = () => {
  return (
    <>
      <NProgress />
      <Outlet />
    </>
  );
};

Layout.displayName = 'MobileAiImageLayout';

export default Layout;
