'use client';

import { memo, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { MemoryRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import MainChatPage from './components/MainChatPage';
import SettingsPage from './components/SettingsPage';

import Desktop from './_layout/Desktop';
import Mobile from '../_layout/Mobile';

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

// Mobile Chat Routes
export const MobileChatRoutes = memo(() => {
  return (
    <Mobile>
      <Routes>
        <Route element={<MainChatPage mobile={true} />} path="/" />
        <Route element={<SettingsPage mobile={true} />} path="/settings" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </Mobile>
  );
});

MobileChatRoutes.displayName = 'MobileChatRoutes';

// Desktop Chat Routes
export const DesktopChatRoutes = memo(() => {
  return (
    <Desktop>
      <Routes>
        <Route element={<MainChatPage mobile={false} />} path="/" />
        <Route element={<MainChatPage mobile={false} />} path="/*" />
      </Routes>
    </Desktop>
  );
});

DesktopChatRoutes.displayName = 'DesktopChatRoutes';

const ChatRouter = memo(() => {
  const mobile = useMediaQuery({ maxWidth: 768 });

  return (
    <MemoryRouter initialEntries={[getInitialPath()]} initialIndex={0}>
      <UrlSynchronizer />
      {mobile ? <MobileChatRoutes /> : <DesktopChatRoutes />}
    </MemoryRouter>
  );
});

ChatRouter.displayName = 'ChatRouter';

export default ChatRouter;
