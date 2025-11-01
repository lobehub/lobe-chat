import { ReactNode } from 'react';

import MobileContentLayout from '@/components/server/MobileNavLayout';

import Hero from '../../features/Hero';
import Header from './Header';

type Props = { children: ReactNode };

const Layout = ({ children }: Props) => {
  return (
    <MobileContentLayout header={<Header />} padding={16}>
      <Hero />
      {children}
    </MobileContentLayout>
  );
};

Layout.displayName = 'MobileChangelogLayout';

export default Layout;
