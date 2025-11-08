'use client';

import { memo } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import CommonRouterWrapper from './CommonRouterWrapper';
import Mobile from './(main)/_layout/Mobile';

import { MobileChatRoutes } from './(main)/chat/ChatRouter';
import { MobileChangelogRoutes } from './(main)/changelog/ChangelogRouter';
import { MobileDiscoverRoutes } from './(main)/discover/DiscoverRouter';
import { MobileImageRoutes } from './(main)/image/ImageRouter';
import { MobileKnowledgeRoutes } from './(main)/knowledge/KnowledgeRouter';
import { MobileLabsRoutes } from './(main)/labs/LabsRouter';
import { MobileMeRoutes } from './(main)/(mobile)/me/MeRouter';
import { MobileProfileRoutes } from './(main)/profile/ProfileRouter';
import { MobileSettingsRoutes } from './(main)/settings/SettingsRouter';

const MobileRouter = memo(() => {
  return (
    <CommonRouterWrapper>
      <Mobile>
        <Routes>
          {/* Chat routes */}
          <Route element={<MobileChatRoutes />} path="/chat/*" />

          {/* Discover routes */}
          <Route element={<MobileDiscoverRoutes />} path="/discover/*" />

          {/* Knowledge routes */}
          <Route element={<MobileKnowledgeRoutes />} path="/knowledge/*" />

          {/* Settings routes */}
          <Route element={<MobileSettingsRoutes />} path="/settings/*" />

          {/* Image routes */}
          <Route element={<MobileImageRoutes />} path="/image/*" />

          {/* Labs routes */}
          <Route element={<MobileLabsRoutes />} path="/labs/*" />

          {/* Changelog routes */}
          <Route element={<MobileChangelogRoutes />} path="/changelog/*" />

          {/* Profile routes */}
          <Route element={<MobileProfileRoutes />} path="/profile/*" />

          {/* Me routes (mobile personal center) */}
          <Route element={<MobileMeRoutes />} path="/me/*" />

          {/* Default route */}
          <Route element={<Navigate replace to="/chat" />} path="*" />
        </Routes>
      </Mobile>
    </CommonRouterWrapper>
  );
});

MobileRouter.displayName = 'MobileRouter';

export default MobileRouter;

