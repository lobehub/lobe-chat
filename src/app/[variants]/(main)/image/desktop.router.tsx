'use client';

import { memo, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { isServerMode } from '@/const/version';

import Desktop from './_layout/Desktop';
import ImageWorkspace from './features/ImageWorkspace';
import SkeletonList from './features/ImageWorkspace/SkeletonList';
import NotSupportClient from './NotSupportClient';

import Menu from './@menu/default';
import Topic from './@topic/default';

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
