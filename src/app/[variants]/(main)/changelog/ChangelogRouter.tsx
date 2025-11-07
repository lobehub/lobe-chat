'use client';

import { memo } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Flexbox } from 'react-layout-kit';
import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';

/**
 * Changelog content placeholder
 * TODO: Implement client-side data fetching for changelog
 */
const ChangelogContent = memo(() => {
  return (
    <Flexbox gap={16} padding={24}>
      <h1>Changelog</h1>
      <p>Changelog content will be loaded here...</p>
    </Flexbox>
  );
});

ChangelogContent.displayName = 'ChangelogContent';

/**
 * Mobile Changelog Routes
 */
export const MobileChangelogRoutes = memo(() => {
  return (
    <Mobile>
    <Routes>
      <Route element={<ChangelogContent />} path="/" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
    </Mobile>
  );
});

MobileChangelogRoutes.displayName = 'MobileChangelogRoutes';

/**
 * Desktop Changelog Routes
 */
export const DesktopChangelogRoutes = memo(() => {
  return (
    <Desktop>
    <Routes>
      <Route element={<ChangelogContent />} path="/" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
    </Desktop>
  );
});

DesktopChangelogRoutes.displayName = 'DesktopChangelogRoutes';
