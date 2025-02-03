'use client';

import { usePathname } from 'next/navigation';
import { PropsWithChildren } from 'react';

import ProviderMenu from '../ProviderMenu';

const Layout = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();

  return pathname === '/settings/provider' ? <ProviderMenu mobile /> : children;
};

export default Layout;
