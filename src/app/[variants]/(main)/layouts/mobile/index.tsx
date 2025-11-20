'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { withSuspense } from '@/components/withSuspense';
import { useShowMobileWorkspace } from '@/hooks/useShowMobileWorkspace';
import { Locales } from '@/locales/resources';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import NavBar from './NavBar';

const CloudBanner = dynamic(() => import('@/features/AlertBanner/CloudBanner'));
const MOBILE_NAV_ROUTES = new Set([
  '/chat',
  '/discover',
  '/discover/assistant',
  '/discover/mcp',
  '/discover/plugin',
  '/discover/model',
  '/discover/provider',
  '/me',
]);

export const MobileMainLayout = memo((props: { locale: Locales }) => {
  const { locale } = props;
  const showMobileWorkspace = useShowMobileWorkspace();
  const location = useLocation();
  const pathname = location.pathname;
  const showNav = !showMobileWorkspace && MOBILE_NAV_ROUTES.has(pathname);

  const { showCloudPromotion } = useServerConfigStore(featureFlagsSelectors);

  return (
    <>
      {showCloudPromotion && <CloudBanner mobile />}
      <Outlet context={{ locale: locale }} />
      {showNav && <NavBar />}
    </>
  );
});

MobileMainLayout.displayName = 'MobileMainLayout';

export default withSuspense(MobileMainLayout);
