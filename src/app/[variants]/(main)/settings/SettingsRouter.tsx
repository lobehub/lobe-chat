'use client';

import { memo } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import SettingsContextProvider from './_layout/ContextProvider';
import DesktopLayout from './_layout/Desktop';
import MobileLayout from './_layout/Mobile';

/**
 * Mobile Settings Routes
 * Settings use query parameters (?active=xxx) to manage tabs
 */
export const MobileSettingsRoutes = memo(() => {
  return (
    <SettingsContextProvider
      value={{
        showOpenAIApiKey: true,
        showOpenAIProxyUrl: true,
      }}
    >
      <Routes>
        <Route element={<MobileLayout />} path="/" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </SettingsContextProvider>
  );
});

MobileSettingsRoutes.displayName = 'MobileSettingsRoutes';

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
