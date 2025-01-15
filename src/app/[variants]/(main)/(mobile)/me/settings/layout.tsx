import { PropsWithChildren, Suspense } from 'react';

import MobileContentLayout from '@/components/server/MobileNavLayout';

import Header from './features/Header';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <Suspense>
      <MobileContentLayout header={<Header />}>{children}</MobileContentLayout>
    </Suspense>
  );
};

Layout.displayName = 'MeSettingsLayout';

export default Layout;
