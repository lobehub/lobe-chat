'use client';

import { memo } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { MobileChatRoutes } from './(main)/chat/ChatRouter';
import { MobileDiscoverRoutes } from './(main)/discover/DiscoverRouter';


const MobileRouter = memo(() => {
  return (
    <Routes>
      {/* Add your mobile routes here */}
      <Routes>
      {/* Chat routes */}
      <Route element={<MobileChatRoutes />} path="/chat/*"/>

      {/* Discover routes */}
      <Route element={<MobileDiscoverRoutes />} path="/discover/*" />

      {/* Default route */}
      <Route element={<Navigate replace to="/chat" />} path="*" />
    </Routes>
    </Routes>
  );
});

MobileRouter.displayName = 'MobileRouter';

export default MobileRouter;

