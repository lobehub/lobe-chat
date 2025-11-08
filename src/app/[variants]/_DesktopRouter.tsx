'use client';

import { memo } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import CommonRouterWrapper from './CommonRouterWrapper';
import Desktop from './(main)/_layout/Desktop';

import { DesktopChatRoutes } from './(main)/chat/ChatRouter';
import { DesktopChangelogRoutes } from './(main)/changelog/ChangelogRouter';
import { DesktopDiscoverRoutes } from './(main)/discover/DiscoverRouter';
import { DesktopImageRoutes } from './(main)/image/ImageRouter';
import { DesktopKnowledgeRoutes } from './(main)/knowledge/KnowledgeRouter';
import { DesktopLabsRoutes } from './(main)/labs/LabsRouter';
import { DesktopProfileRoutes } from './(main)/profile/ProfileRouter';
import { DesktopSettingsRoutes } from './(main)/settings/SettingsRouter';

const DesktopRouter = memo(() => {
  return (
    <CommonRouterWrapper>
      <Desktop>
        <Routes>
          {/* Chat routes */}
          <Route element={<DesktopChatRoutes />} path="/chat/*" />

          {/* Discover routes */}
          <Route element={<DesktopDiscoverRoutes />} path="/discover/*" />

          {/* Knowledge routes */}
          <Route element={<DesktopKnowledgeRoutes />} path="/knowledge/*" />

          {/* Settings routes */}
          <Route element={<DesktopSettingsRoutes />} path="/settings/*" />

          {/* Image routes */}
          <Route element={<DesktopImageRoutes />} path="/image/*" />

          {/* Labs routes */}
          <Route element={<DesktopLabsRoutes />} path="/labs/*" />

          {/* Changelog routes */}
          <Route element={<DesktopChangelogRoutes />} path="/changelog/*" />

          {/* Profile routes */}
          <Route element={<DesktopProfileRoutes />} path="/profile/*" />

          {/* Default route */}
          <Route element={<Navigate replace to="/chat" />} path="*" />
        </Routes>
      </Desktop>
    </CommonRouterWrapper>
  );
});

DesktopRouter.displayName = 'DesktopRouter';

export default DesktopRouter;

