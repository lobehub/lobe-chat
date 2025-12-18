'use client';

import dynamic from 'next/dynamic';
import { Suspense, memo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Loading from '@/components/Loading/BrandTextLoading';
import { MarketAuthProvider } from '@/layout/AuthProvider/MarketAuth';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { NavigatorRegistrar } from '@/utils/router';

import NavBar from './NavBar';

const CloudBanner = dynamic(() => import('@/features/AlertBanner/CloudBanner'));
const MOBILE_NAV_ROUTES = new Set([
  '/',
  '/discover',
  '/discover/assistant',
  '/discover/mcp',
  '/discover/plugin',
  '/discover/model',
  '/discover/provider',
  '/me',
]);

const MobileMainLayout = memo(() => {
  const { showCloudPromotion } = useServerConfigStore(featureFlagsSelectors);
  const location = useLocation();
  const pathname = location.pathname;
  const showNav = MOBILE_NAV_ROUTES.has(pathname);
  return (
    <>
      <NavigatorRegistrar />
      <Suspense fallback={null}>{showCloudPromotion && <CloudBanner mobile />}</Suspense>
      <MarketAuthProvider isDesktop={false}>
        <Suspense fallback={<Loading debugId="MobileMainLayout > Outlet" />}>
          <Outlet />
          {showNav && <NavBar />}
        </Suspense>
      </MarketAuthProvider>
    </>
  );
});

MobileMainLayout.displayName = 'MobileMainLayout';

export default MobileMainLayout;
