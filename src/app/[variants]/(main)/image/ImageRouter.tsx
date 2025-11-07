'use client';

import { memo, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { isServerMode } from '@/const/version';

import ImageWorkspace from './features/ImageWorkspace';
import SkeletonList from './features/ImageWorkspace/SkeletonList';
import NotSupportClient from './NotSupportClient';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';

import Menu from './@menu/default';
import Topic from './@topic/default';
/**
 * Mobile Image Routes
 * Image generation is not yet supported on mobile
 */
export const MobileImageRoutes = memo(() => {
  return (
  <Mobile>
    <Routes>
      <Route element={<div><h2>Coming Soon!</h2></div>} path="/" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
    </Mobile>
  );
});

MobileImageRoutes.displayName = 'MobileImageRoutes';

/**
 * Desktop Image Routes
 * Main image generation workspace
 */
export const DesktopImageRoutes = memo(() => {
  if (!isServerMode) {
    return (
      <Desktop menu={<Menu />} topic={<Topic />}>
        <Routes>
          <Route element={<NotSupportClient />} path="/" />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </Desktop>
    );
  }

  return (
    <Desktop menu={<Menu />} topic={<Topic />}>
    <Routes>
      <Route
        element={
          <Suspense fallback={<SkeletonList />}>
            <ImageWorkspace />
          </Suspense>
        }
        path="/"
      />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
    </Desktop>
  );
});

DesktopImageRoutes.displayName = 'DesktopImageRoutes';
