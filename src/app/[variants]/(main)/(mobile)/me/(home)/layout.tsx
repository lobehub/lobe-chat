import { PropsWithChildren, Suspense } from 'react';

import Loading from '@/components/Loading/BrandTextLoading';
import MobileContentLayout from '@/components/server/MobileNavLayout';

import Header from './features/Header';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <MobileContentLayout header={<Header />} withNav>
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </MobileContentLayout>
  );
};

Layout.displayName = 'MeLayout';

export default Layout;
