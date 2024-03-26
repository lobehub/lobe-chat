'use client';

import { usePathname } from 'next/navigation';
import { PropsWithChildren, memo } from 'react';

import { useActiveTabKey } from '@/hooks/useActiveTabKey';
import { useIsSubSlug } from '@/hooks/useIsSubSlug';

import Layout from './Client';

const MobileLayout = memo<PropsWithChildren>(({ children }) => {
  const pathname = usePathname();
  const tabBarKey = useActiveTabKey();
  const isSubPath = useIsSubSlug();

  if (pathname === '/') return children;

  return (
    <Layout showTabBar={!isSubPath} tabBarKey={tabBarKey}>
      {children}
    </Layout>
  );
});

export default MobileLayout;
