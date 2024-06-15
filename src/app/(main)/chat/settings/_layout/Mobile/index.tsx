'use client';

import { PropsWithChildren } from 'react';

import Footer from '@/app/(main)/settings/features/Footer';
import MobileContentLayout from '@/components/server/MobileNavLayout';

import Header from './Header';

const Layout = ({ children }: PropsWithChildren) => (
  <MobileContentLayout header={<Header />}>
    {children}
    <Footer />
  </MobileContentLayout>
);

Layout.displayName = 'MobileSessionSettingsLayout';

export default Layout;
