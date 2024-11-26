import { ReactNode } from 'react';

import MobileContentLayout from '@/components/server/MobileNavLayout';

import Header from './Header';

type Props = { children: ReactNode };

const Layout = ({ children }: Props) => {
  return (
    <MobileContentLayout header={<Header />} padding={16}>
      {children}
    </MobileContentLayout>
  );
};

Layout.displayName = 'MobileChangelogLayout';

export default Layout;
