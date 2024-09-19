import { PropsWithChildren } from 'react';

import NProgress from '@/components/NProgress';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <NProgress />
      {children}
    </>
  );
};

Layout.displayName = 'MobileDiscoverStoreLayout';

export default Layout;
