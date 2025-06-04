import { PropsWithChildren } from 'react';

import { SCROLL_PARENT_ID } from '@/app/[variants]/(main)/discover/features/const';
import MobileContentLayout from '@/components/server/MobileNavLayout';
import Footer from '@/features/Setting/Footer';

import Header from './Header';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <MobileContentLayout gap={16} header={<Header />} id={SCROLL_PARENT_ID} padding={16}>
      {children}
      <div />
      <Footer />
    </MobileContentLayout>
  );
};

Layout.displayName = 'MobileDiscoverDetailLayout';

export default Layout;
