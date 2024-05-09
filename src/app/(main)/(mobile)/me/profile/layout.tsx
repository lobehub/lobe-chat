import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';

import MobileContentLayout from '@/components/server/MobileNavLayout';
import { enableClerk } from '@/const/auth';

import Header from './features/Header';

const Layout = ({ children }: PropsWithChildren) => {
  if (!enableClerk) return notFound();
  return <MobileContentLayout header={<Header />}>{children}</MobileContentLayout>;
};

Layout.displayName = 'MeProfileLayout';

export default Layout;
