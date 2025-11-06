'use client';

import { Suspense, memo, useEffect } from 'react';
import { createStyles, useTheme } from 'antd-style';
import { useMediaQuery } from 'react-responsive';
import { MemoryRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Flexbox } from 'react-layout-kit';

import { isDesktop } from '@/const/version';
import { useShowMobileWorkspace } from '@/hooks/useShowMobileWorkspace';
import ProtocolUrlHandler from '@/features/ProtocolUrlHandler';

import { useFeatureFlags } from './_layout/FeatureFlagsProvider';
import RegisterHotkeys from './_layout/Desktop/RegisterHotkeys';
import SessionPanel from './_layout/Desktop/SessionPanel';
import SessionPanelContent from './components/SessionPanel';
import MainChatPage from './components/MainChatPage';
import SettingsPage from './components/SettingsPage';

const useStyles = createStyles(({ css, token }) => ({
  main: css`
    position: relative;
    overflow: hidden;
    background: ${token.colorBgLayout};
  `,
}));

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
  const theme = useTheme();
  const { styles } = useStyles();
  const showMobileWorkspace = useShowMobileWorkspace();
  const { hideDocs, showChangelog } = useFeatureFlags();

  const routes = (
    <Routes>
      <Route
        element={<MainChatPage hideDocs={hideDocs} mobile={mobile} showChangelog={showChangelog} />}
        path="/"
      />
      <Route element={<SettingsPage mobile={mobile} />} path="/settings" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );

  return (
    <MemoryRouter initialEntries={[getInitialPath()]} initialIndex={0}>
      <UrlSynchronizer />
      {mobile ? (
        // Mobile Layout
        <>
          <Flexbox
            className={styles.main}
            height="100%"
            style={showMobileWorkspace ? { display: 'none' } : undefined}
            width="100%"
          >
            <SessionPanelContent mobile />
          </Flexbox>
          <Flexbox
            className={styles.main}
            height="100%"
            style={showMobileWorkspace ? undefined : { display: 'none' }}
            width="100%"
          >
            {routes}
          </Flexbox>
        </>
      ) : (
        // Desktop Layout
        <>
          <Flexbox
            height={'100%'}
            horizontal
            style={{ maxWidth: '100%', overflow: 'hidden', position: 'relative' }}
            width={'100%'}
          >
            <SessionPanel />
            <Flexbox
              flex={1}
              style={{
                background: theme.colorBgContainerSecondary,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
             <MainChatPage hideDocs={hideDocs} mobile={false} showChangelog={showChangelog}/>
            </Flexbox>
          </Flexbox>
          <Suspense>
            <RegisterHotkeys />
          </Suspense>
          {isDesktop && <ProtocolUrlHandler />}
        </>
      )}
    </MemoryRouter>
  );
});

ChatRouter.displayName = 'ChatRouter';

export default ChatRouter;
