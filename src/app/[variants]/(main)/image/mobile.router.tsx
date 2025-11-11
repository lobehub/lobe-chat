'use client';

import { memo } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Mobile from './_layout/Mobile';

/**
 * Mobile Image Routes
 * Image generation is not yet supported on mobile
 */
export const MobileImageRoutes = memo(() => {
  return (
    <Mobile>
      <Routes>
        <Route
          element={
            <div>
              <h2>Coming Soon!</h2>
            </div>
          }
          path="/"
        />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </Mobile>
  );
});

MobileImageRoutes.displayName = 'MobileImageRoutes';
