'use client';

import { useEffect } from 'react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';

import DesktopRouter from './DesktopRouter';
import MobileRouter from './MobileRouter';

import Desktop from './(main)/_layout/Desktop';
import Mobile from './(main)/_layout/Mobile';

import { RouteVariants } from '@/utils/server/routeVariants';
import { useGlobalStore } from '@/store/global';
import { useServerConfigStore } from '@/store/serverConfig';

const VARIANT_SEGMENT_REG = /^\/([^/]+)(.*)$/;

const isSerializedVariant = (segment: string) => {
  if (!segment.includes('__')) return false;
  return RouteVariants.serializeVariants(RouteVariants.deserializeVariants(segment)) === segment;
};

const extractPathAfterVariant = (pathname: string) => {
  if (pathname === '/') {
    return { pathAfterVariant: '/', variantPrefix: undefined };
  }

  const match = pathname.match(VARIANT_SEGMENT_REG);
  if (!match) {
    return { pathAfterVariant: pathname || '/', variantPrefix: undefined };
  }

  const [, maybeVariant, restPath = ''] = match;

  if (!isSerializedVariant(maybeVariant)) {
    return { pathAfterVariant: pathname || '/', variantPrefix: undefined };
  }

  return {
    pathAfterVariant: restPath || '/',
    variantPrefix: `/${maybeVariant}`,
  };
};

// Get initial path from URL
const getInitialPath = () => {
  if (typeof window === 'undefined') return '/';
  const { pathAfterVariant } = extractPathAfterVariant(window.location.pathname);
  return pathAfterVariant + window.location.search;
};

// Helper component to sync URL with MemoryRouter
const UrlSynchronizer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Sync initial URL
  useEffect(() => {
    const { pathAfterVariant } = extractPathAfterVariant(window.location.pathname);
    const targetPath = pathAfterVariant + window.location.search;

    if (location.pathname + location.search !== targetPath) {
      navigate(targetPath, { replace: true });
    }
  }, []);

  // Update browser URL when location changes
  useEffect(() => {
    const normalizedPath = location.pathname === '' ? '/' : location.pathname;
    const newUrl = `${normalizedPath}${location.search}`;

    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState({}, '', newUrl);
    }
  }, [location.pathname, location.search]);

  return null;
};

const NavigatorRegistrar = () => {
  const navigate = useNavigate();

  useEffect(() => {
    useGlobalStore.setState({ navigate });

    return () => {
      useGlobalStore.setState({ navigate: undefined });
    };
  }, [navigate]);

  return null;
};

export default function AppRouter() {
  
  const mobile = useServerConfigStore((s) => s.isMobile);

  return (
    <MemoryRouter initialEntries={[getInitialPath()]} initialIndex={0}>
      <UrlSynchronizer />
      <NavigatorRegistrar />
      {mobile ? (
        <Mobile>
          <MobileRouter />
        </Mobile>
      ) : (
        <Desktop>
          <DesktopRouter />
        </Desktop>
      )}
    </MemoryRouter>
  );
}
