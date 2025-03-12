import { PropsWithChildren } from 'react';

import MobileContentLayout from '@/components/server/MobileNavLayout';
import Footer from '@/features/Setting/Footer';

import { SCROLL_PARENT_ID } from '../../../features/const';
import Header from './Header';
import Nav from './Nav';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <MobileContentLayout
      gap={16}
      header={
        <>
          <Header />
          <Nav />
        </>
      }
      id={SCROLL_PARENT_ID}
      style={{ paddingInline: 16 }}
    >
      {children}
      <div />
      <Footer />
    </MobileContentLayout>
  );
};

Layout.displayName = 'MobileDiscoverSearchLayout';

export default Layout;
