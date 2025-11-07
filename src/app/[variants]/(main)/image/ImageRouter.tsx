'use client';

import { memo, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { isServerMode } from '@/const/version';

import ImageWorkspace from './features/ImageWorkspace';
import SkeletonList from './features/ImageWorkspace/SkeletonList';
import NotSupportClient from './NotSupportClient';

/**
 * Mobile Image Routes
 * Image generation is not yet supported on mobile
 */
export const MobileImageRoutes = memo(() => {
  return (
    <Routes>
      <Route element={<div><h2>Coming Soon!</h2></div>} path="/" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
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
      <Routes>
        <Route element={<NotSupportClient />} path="/" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    );
  }

  return (
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
  );
});

DesktopImageRoutes.displayName = 'DesktopImageRoutes';
