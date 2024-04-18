'use client';

import { usePathname } from 'next/navigation';
import { PropsWithChildren, memo } from 'react';

import { useActiveTabKey } from '@/hooks/useActiveTabKey';
import { useIsSubSlug } from '@/hooks/useIsSubSlug';
import { DefaultLayoutMobile } from '@/layout/DefaultLayout';

const MobileLayout = memo<PropsWithChildren>(({ children }) => {
  const pathname = usePathname();
  const tabBarKey = useActiveTabKey();
  const isSubPath = useIsSubSlug();

  if (pathname === '/') return children;

  return (
    <DefaultLayoutMobile showTabBar={!isSubPath} tabBarKey={tabBarKey}>
      {children}
    </DefaultLayoutMobile>
  );
});

export default MobileLayout;
