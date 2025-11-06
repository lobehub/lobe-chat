'use client';

import { memo, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { MemoryRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import MainChatPage from './components/MainChatPage';
import SettingsPage from './components/SettingsPage';

// Get initial path from URL
const getInitialPath = () => {
  if (typeof window === 'undefined') return '/';
  const fullPath = window.location.pathname;
  const searchParams = window.location.search;
  const chatIndex = fullPath.indexOf('/chat');

  if (chatIndex !== -1) {
    const pathAfterChat = fullPath.slice(chatIndex + '/chat'.length) || '/';
    return pathAfterChat + searchParams;
  }
  return '/';
};

// Helper component to sync URL with MemoryRouter
const UrlSynchronizer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Sync initial URL
  useEffect(() => {
    const fullPath = window.location.pathname;
    const searchParams = window.location.search;
    const chatIndex = fullPath.indexOf('/chat');

    if (chatIndex !== -1) {
      const pathAfterChat = fullPath.slice(chatIndex + '/chat'.length) || '/';
      const targetPath = pathAfterChat + searchParams;

      if (location.pathname + location.search !== targetPath) {
        navigate(targetPath, { replace: true });
      }
    }
  }, []);

  // Update browser URL when location changes
  useEffect(() => {
    const normalizedPath = location.pathname === '/' ? '' : location.pathname;
    const newUrl = `/chat${normalizedPath}${location.search}`;
    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState({}, '', newUrl);
    }
  }, [location.pathname, location.search]);

  return null;
};

const ChatRouter = memo(() => {
  const mobile = useMediaQuery({ maxWidth: 768 });
  const routes = (
    <Routes>
      <Route element={<MainChatPage mobile={true} />} path="/" />
      <Route element={<SettingsPage mobile={true} />} path="/settings" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );

  return (
    <MemoryRouter initialEntries={[getInitialPath()]} initialIndex={0}>
      <UrlSynchronizer />
      {mobile ? (
        // Mobile Layout
        routes
      ) : (
        // Desktop Layout
        <MainChatPage mobile={false} />
      )}
    </MemoryRouter>
  );
});

ChatRouter.displayName = 'ChatRouter';

export default ChatRouter;
