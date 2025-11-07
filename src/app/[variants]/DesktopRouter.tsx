'use client';

import { memo } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { DesktopChatRoutes } from './(main)/chat/ChatRouter';
import { DesktopDiscoverRoutes } from './(main)/discover/DiscoverRouter';

const DesktopRouter = memo(() => {
  return (
    <Routes>
      {/* Chat routes */}
      <Route element={<DesktopChatRoutes />} path="/chat/*"/>

      {/* Discover routes */}
      <Route element={<DesktopDiscoverRoutes />} path="/discover/*" />

      {/* Default route */}
      <Route element={<Navigate replace to="/chat" />} path="*" />
    </Routes>
  );
});

DesktopRouter.displayName = 'DesktopRouter';

export default DesktopRouter;

