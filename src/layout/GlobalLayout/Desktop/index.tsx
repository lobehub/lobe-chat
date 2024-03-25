'use client';

import { usePathname } from 'next/navigation';
import { PropsWithChildren, memo } from 'react';

import Client from './Client';

const DesktopLayout = memo<PropsWithChildren>(({ children }) => {
  const pathname = usePathname();

  if (pathname === '/') return children;

  return <Client>{children}</Client>;
});

export default DesktopLayout;
