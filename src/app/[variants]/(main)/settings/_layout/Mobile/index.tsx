import { Suspense } from 'react';

import MobileContentLayout from '@/components/server/MobileNavLayout';
import InitClientDB from '@/features/InitClientDB';
import Footer from '@/features/Setting/Footer';

import { LayoutProps } from '../type';
import Header from './Header';

const Layout = ({ children }: LayoutProps) => {
  return (
    <MobileContentLayout
      header={
        <Suspense>
          <Header />
        </Suspense>
      }
    >
      {children}
      <Footer />
      <InitClientDB />
    </MobileContentLayout>
  );
};

Layout.displayName = 'MobileSettingsLayout';

export default Layout;
