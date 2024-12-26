'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import qs from 'query-string';
import { memo } from 'react';

import { useQuery } from '@/hooks/useQuery';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import { LayoutProps } from './type';

const CloudBanner = dynamic(() => import('@/features/AlertBanner/CloudBanner'));
const MOBILE_NAV_ROUTES = new Set([
  '/chat',
  '/discover',
  '/discover/assistants',
  '/discover/plugins',
  '/discover/models',
  '/discover/providers',
  '/me',
]);

const Layout = memo(({ children, nav }: LayoutProps) => {
  const { showMobileWorkspace } = useQuery();
  const pathname = usePathname();
  const { url } = qs.parseUrl(pathname);
  const showNav = !showMobileWorkspace && MOBILE_NAV_ROUTES.has(url);

  const { showCloudPromotion } = useServerConfigStore(featureFlagsSelectors);

  return (
    <>
      {showCloudPromotion && <CloudBanner mobile />}
      {children}
      {showNav && nav}
    </>
  );
});

Layout.displayName = 'MobileMainLayout';

export default Layout;
