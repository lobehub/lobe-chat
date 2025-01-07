import { PropsWithChildren } from 'react';

import MobileContentLayout from '@/components/server/MobileNavLayout';
import InitClientDB from '@/features/InitClientDB';

import Header from './features/Header';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <MobileContentLayout header={<Header />} withNav>
      {children}
      <InitClientDB />
    </MobileContentLayout>
  );
};

Layout.displayName = 'MeLayout';

export default Layout;
