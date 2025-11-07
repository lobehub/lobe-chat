'use client';

import { memo } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import LabsPage from './index';

/**
 * Mobile Labs Routes
 * Labs page for experimental features
 */
export const MobileLabsRoutes = memo(() => {
  return (
    <Routes>
      <Route element={<LabsPage />} path="/" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
});

MobileLabsRoutes.displayName = 'MobileLabsRoutes';

/**
 * Desktop Labs Routes
 * Labs page for experimental features
 */
export const DesktopLabsRoutes = memo(() => {
  return (
    <Routes>
      <Route element={<LabsPage />} path="/" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
});

DesktopLabsRoutes.displayName = 'DesktopLabsRoutes';
