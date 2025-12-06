import { memo } from 'react';
import { Outlet } from 'react-router-dom';

import MobileLayout from '@/app/[variants]/(mobile)/(home)/_layout/MobileLayout';
import SessionHydration from '@/app/[variants]/(mobile)/(home)/_layout/SessionHydration';

const Layout = memo(() => {
  return (
    <>
      <MobileLayout>
        <Outlet />
      </MobileLayout>
      <SessionHydration />
    </>
  );
});

Layout.displayName = 'MobileHomeLayout';

export default Layout;
