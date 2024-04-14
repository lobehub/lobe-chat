'use client';

import { usePathname } from 'next/navigation';
import { PropsWithChildren, memo } from 'react';

import { DefaultLayoutDesktop } from '@/layout/DefaultLayout';

const defaultLayoutRoutes = new Set(['/']);

const DesktopLayout = memo<PropsWithChildren>(({ children }) => {
  const pathname = usePathname();

  if (defaultLayoutRoutes.has(pathname)) return children;

  return <DefaultLayoutDesktop>{children}</DefaultLayoutDesktop>;
});

export default DesktopLayout;
