'use client';

import { memo } from 'react';
import { Outlet } from 'react-router-dom';

import NProgress from '@/components/NProgress';

/**
 * Mobile Discover Layout
 * Provides NProgress and outlet for all mobile discover pages
 */
export const MobileDiscoverLayout = memo(() => {
  return (
    <>
      <NProgress />
      <Outlet />
    </>
  );
});

MobileDiscoverLayout.displayName = 'MobileDiscoverLayout';
