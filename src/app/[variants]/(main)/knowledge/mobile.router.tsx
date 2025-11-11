'use client';

import { App } from 'antd';
import { memo } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import KnowledgeBaseDetailPage from './routes/KnowledgeBaseDetail';
import KnowledgeBasesListPage from './routes/KnowledgeBasesList';
import KnowledgeHomePage from './routes/KnowledgeHome';

/**
 * Mobile Knowledge Routes
 * Route structure:
 * - / → Knowledge home (file list with categories)
 * - /bases → Knowledge bases list
 * - /bases/:id → Knowledge base detail (file list for specific base)
 */
export const MobileKnowledgeRoutes = memo(() => {
  return (
    <App style={{ display: 'flex', flex: 1, height: '100%' }}>
      <Routes>
        {/* Knowledge home - file list page */}
        <Route element={<KnowledgeHomePage />} path="/" />

        {/* Knowledge bases routes */}
        <Route element={<KnowledgeBasesListPage />} path="/bases" />
        <Route element={<KnowledgeBaseDetailPage />} path="/bases/:id" />

        {/* Fallback */}
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </App>
  );
});

MobileKnowledgeRoutes.displayName = 'MobileKnowledgeRoutes';
