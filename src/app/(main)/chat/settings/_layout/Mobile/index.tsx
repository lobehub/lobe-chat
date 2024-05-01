'use client';

import { PropsWithChildren } from 'react';

import MobileContentLayout from '@/components/server/MobileNavLayout';

import Header from './Header';

const Layout = ({ children }: PropsWithChildren) => (
  <MobileContentLayout header={<Header />}>{children}</MobileContentLayout>
);

Layout.displayName = 'MobileSessionSettingsLayout';

export default Layout;
