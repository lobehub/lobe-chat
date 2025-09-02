'use client';

import { usePathname } from 'next/navigation';
import { PropsWithChildren } from 'react';

import ProviderMenu from '../ProviderMenu';

interface LayoutProps extends PropsWithChildren {
  onProviderSelect: (providerKey: string) => void;
}

const Layout = ({ children, onProviderSelect }: LayoutProps) => {
  const pathname = usePathname();

  return pathname === '/settings?active=provider' ? (
    <ProviderMenu mobile onProviderSelect={onProviderSelect} />
  ) : (
    children
  );
};

export default Layout;
