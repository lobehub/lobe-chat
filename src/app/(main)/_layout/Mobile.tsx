'use client';

import { usePathname } from 'next/navigation';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { LayoutProps } from './type';

const MOBILE_IGNORE_NAV_ROUTES = ['/settings/', '/chat/'];

const Layout = memo(({ children, nav }: LayoutProps) => {
  const pathname = usePathname();
  const hideNav = MOBILE_IGNORE_NAV_ROUTES.some((path) => pathname.startsWith(path));

  return (
    <Flexbox
      style={{
        height: '100%',
        overflowX: 'hidden',
        overflowY: 'auto',
        position: 'relative',
        width: '100vw',
      }}
    >
      {children}
      {!hideNav && nav}
    </Flexbox>
  );
});

Layout.displayName = 'MobileMainLayout';

export default Layout;
