'use client';

import { memo } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import SettingsContextProvider from './_layout/ContextProvider';
import DesktopLayout from './_layout/Desktop';

/**
 * Desktop Settings Routes
 * Settings use query parameters (?active=xxx) to manage tabs
 */
export const DesktopSettingsRoutes = memo(() => {
  return (
    <SettingsContextProvider
      value={{
        showOpenAIApiKey: true,
        showOpenAIProxyUrl: true,
      }}
    >
      <Routes>
        <Route element={<DesktopLayout />} path="/" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </SettingsContextProvider>
  );
});

DesktopSettingsRoutes.displayName = 'DesktopSettingsRoutes';
