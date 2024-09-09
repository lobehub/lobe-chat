import { PropsWithChildren } from 'react';

import MobileContentLayout from '@/components/server/MobileNavLayout';
import Footer from '@/features/Setting/Footer';

import Header from './Header';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <MobileContentLayout gap={16} header={<Header />} padding={16}>
      {children}
      <Footer />
    </MobileContentLayout>
  );
};

Layout.displayName = 'MobileDiscoverDetailLayout';

export default Layout;
