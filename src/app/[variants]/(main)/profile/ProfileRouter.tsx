'use client';

import { Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import { memo } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { enableClerk } from '@/const/auth';

import ApiKeyClient from './apikey/Client';
import ProfileClient from './(home)/Client';
import StatsClient from './stats/Client';

import Category from './@category/default';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';

const ClerkProfile = dynamic(() => import('./features/ClerkProfile'), {
  loading: () => (
    <div style={{ flex: 1 }}>
      <Skeleton paragraph={{ rows: 8 }} title={false} />
    </div>
  ),
});

/**
 * Mobile Profile Routes
 * Profile routes include: home, apikey, security, stats
 */
export const MobileProfileRoutes = memo(() => {
  const mobile = true;

  return (
    <Mobile category={<Category />}>
    <Routes>
      {/* Home - User profile */}
      <Route
        element={enableClerk ? <ClerkProfile mobile={mobile} /> : <ProfileClient mobile={mobile} />}
        path="/"
      />

      {/* API Key Management */}
      <Route element={<ApiKeyClient />} path="/apikey" />

      {/* Security - Clerk only */}
      <Route
        element={
          enableClerk ? <ClerkProfile mobile={mobile} /> : <Navigate replace to="/" />
        }
        path="/security"
      />

      {/* Stats */}
      <Route element={<StatsClient mobile={mobile} />} path="/stats" />

      {/* Fallback */}
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
    </Mobile>
  );
});

MobileProfileRoutes.displayName = 'MobileProfileRoutes';

/**
 * Desktop Profile Routes
 * Profile routes include: home, apikey, security, stats
 */
export const DesktopProfileRoutes = memo(() => {
  const mobile = false;

  return (
    <Desktop category={<Category />}>
    <Routes>
      {/* Home - User profile */}
      <Route
        element={enableClerk ? <ClerkProfile mobile={mobile} /> : <ProfileClient mobile={mobile} />}
        path="/"
      />

      {/* API Key Management */}
      <Route element={<ApiKeyClient />} path="/apikey" />

      {/* Security - Clerk only */}
      <Route
        element={
          enableClerk ? <ClerkProfile mobile={mobile} /> : <Navigate replace to="/" />
        }
        path="/security"
      />

      {/* Stats */}
      <Route element={<StatsClient mobile={mobile} />} path="/stats" />

      {/* Fallback */}
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
    </Desktop>
  );
});

DesktopProfileRoutes.displayName = 'DesktopProfileRoutes';
