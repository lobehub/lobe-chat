'use client';

import { usePathname } from 'next/navigation';
import { PropsWithChildren } from 'react';

import ProviderMenu from '../AgentMenu';

const Layout = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();

  return pathname === '/settings/agent' ? <ProviderMenu mobile /> : children;
};

export default Layout;
